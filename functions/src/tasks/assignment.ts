import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ─── Types ──────────────────────────────────────────────────────────

interface Task {
    id: string;
    title: string;
    type: string;
    priority: string;
    location?: {
        lat: number;
        lng: number;
    };
    skills?: string[];
    estimated_duration?: number;
}

interface Employee {
    id: string;
    name: string;
    role: string;
    status: string;
    availability: string;
    skills?: string[];
    performance_score?: number;
    current_location?: {
        lat: number;
        lng: number;
    };
    total_tasks_completed?: number;
    response_time_avg?: number;
}

interface AssignmentScore {
    employeeId: string;
    score: number;
    breakdown: {
        availability: number;
        skills: number;
        performance: number;
        proximity: number;
        workload: number;
    };
}

// ─── Assign Task Cloud Function ──────────────────────────────────────

export const assignTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { taskId, employeeId, overrideRecommendation = false } = data;

    if (!taskId) {
        throw new functions.https.HttpsError('invalid-argument', 'Task ID is required');
    }

    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();

        if (!taskDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Task not found');
        }

        const task = { id: taskDoc.id, ...taskDoc.data() } as Task;

        let assigneeId = employeeId;

        if (!assigneeId) {
            const bestEmployee = await findBestEmployeeForTask(task);
            if (!bestEmployee) {
                throw new functions.https.HttpsError('not-found', 'No available employee found');
            }
            assigneeId = bestEmployee.id;
        }

        const employeeDoc = await db.collection('employees').doc(assigneeId).get();
        if (!employeeDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Employee not found');
        }

        const employee = employeeDoc.data() as Employee;

        if (employee.status !== 'ACTIVE') {
            throw new functions.https.HttpsError('failed-precondition', 'Employee is not active');
        }

        if (employee.availability === 'OFF_DUTY') {
            throw new functions.https.HttpsError('failed-precondition', 'Employee is off duty');
        }

        await taskDoc.ref.update({
            assignee_id: assigneeId,
            status: 'DRAFT',
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        await db.collection('audit_logs').add({
            action: 'ASSIGN',
            resource: 'TASK',
            resource_id: taskId,
            actor_id: context.auth.uid,
            description: `Assigned task "${task.title}" to ${employee.name}`,
            new_values: { assignee_id: assigneeId, assignee_name: employee.name },
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            success: true,
            assigneeId,
            assigneeName: employee.name,
        };
    } catch (error) {
        functions.logger.error('Error assigning task', { error, taskId });
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to assign task');
    }
});

// ─── Find Best Employee Cloud Function ───────────────────────────────

export const findBestEmployee = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { taskId } = data;

    if (!taskId) {
        throw new functions.https.HttpsError('invalid-argument', 'Task ID is required');
    }

    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();

        if (!taskDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Task not found');
        }

        const task = { id: taskDoc.id, ...taskDoc.data() } as Task;
        const bestEmployee = await findBestEmployeeForTask(task);

        if (!bestEmployee) {
            return {
                success: false,
                message: 'No available employees found',
            };
        }

        const score = await calculateAssignmentScore(task, bestEmployee);

        return {
            success: true,
            employee: {
                id: bestEmployee.id,
                name: bestEmployee.name,
                role: bestEmployee.role,
                performance_score: bestEmployee.performance_score,
                availability: bestEmployee.availability,
            },
            score,
        };
    } catch (error) {
        functions.logger.error('Error finding best employee', { error, taskId });
        throw new functions.https.HttpsError('internal', 'Failed to find best employee');
    }
});

// ─── Find Best Employee for Task ─────────────────────────────────────

export async function findBestEmployeeForTask(task: Task): Promise<Employee | null> {
    const employeesSnapshot = await db
        .collection('employees')
        .where('status', '==', 'ACTIVE')
        .where('availability', 'in', ['AVAILABLE', 'BUSY'])
        .get();

    if (employeesSnapshot.empty) {
        return null;
    }

    const employees: Employee[] = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Employee[];

    const scores: AssignmentScore[] = [];

    for (const employee of employees) {
        const score = await calculateAssignmentScore(task, employee);
        scores.push(score);
    }

    scores.sort((a, b) => b.score - a.score);

    const bestScore = scores[0];
    if (!bestScore || bestScore.score < 30) {
        return null;
    }

    const bestEmployee = employees.find((e) => e.id === bestScore.employeeId);
    return bestEmployee || null;
}

// ─── Calculate Assignment Score ───────────────────────────────────────

async function calculateAssignmentScore(task: Task, employee: Employee): Promise<AssignmentScore> {
    const breakdown = {
        availability: 0,
        skills: 0,
        performance: 0,
        proximity: 0,
        workload: 0,
    };

    // Availability score (0-30 points)
    if (employee.availability === 'AVAILABLE') {
        breakdown.availability = 30;
    } else if (employee.availability === 'BUSY') {
        breakdown.availability = 10;
    }

    // Skills match score (0-25 points)
    if (task.skills && employee.skills) {
        const matchingSkills = task.skills.filter((s) =>
            employee.skills!.some((es) => es.toLowerCase().includes(s.toLowerCase()))
        );
        const skillRatio = matchingSkills.length / task.skills.length;
        breakdown.skills = Math.round(skillRatio * 25);
    } else {
        breakdown.skills = 12;
    }

    // Performance score (0-20 points)
    if (employee.performance_score) {
        breakdown.performance = Math.round((employee.performance_score / 100) * 20);
    } else {
        breakdown.performance = 10;
    }

    // Proximity score (0-15 points)
    if (task.location && employee.current_location) {
        const distance = calculateDistance(
            task.location.lat,
            task.location.lng,
            employee.current_location.lat,
            employee.current_location.lng
        );

        if (distance < 1) {
            breakdown.proximity = 15;
        } else if (distance < 5) {
            breakdown.proximity = 12;
        } else if (distance < 10) {
            breakdown.proximity = 8;
        } else if (distance < 25) {
            breakdown.proximity = 4;
        } else {
            breakdown.proximity = 0;
        }
    } else {
        breakdown.proximity = 7;
    }

    // Workload score (0-10 points) - less tasks = higher score
    const activeTasksSnapshot = await db
        .collection('tasks')
        .where('assignee_id', '==', employee.id)
        .where('status', 'in', ['SENT', 'ACCEPTED', 'IN_PROGRESS'])
        .get();

    const activeTaskCount = activeTasksSnapshot.size;

    if (activeTaskCount === 0) {
        breakdown.workload = 10;
    } else if (activeTaskCount === 1) {
        breakdown.workload = 8;
    } else if (activeTaskCount === 2) {
        breakdown.workload = 5;
    } else if (activeTaskCount === 3) {
        breakdown.workload = 2;
    } else {
        breakdown.workload = 0;
    }

    const totalScore =
        breakdown.availability +
        breakdown.skills +
        breakdown.performance +
        breakdown.proximity +
        breakdown.workload;

    return {
        employeeId: employee.id,
        score: totalScore,
        breakdown,
    };
}

// ─── Calculate Distance (Haversine formula) ──────────────────────────

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// ─── Get Available Employees ─────────────────────────────────────────

export async function getAvailableEmployees(
    role?: string,
    skills?: string[]
): Promise<Employee[]> {
    let query: FirebaseFirestore.Query = db
        .collection('employees')
        .where('status', '==', 'ACTIVE')
        .where('availability', '==', 'AVAILABLE');

    if (role) {
        query = query.where('role', '==', role);
    }

    const snapshot = await query.get();

    let employees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Employee[];

    if (skills && skills.length > 0) {
        employees = employees.filter((emp) =>
            emp.skills?.some((s) =>
                skills.some((ts) => s.toLowerCase().includes(ts.toLowerCase()))
            )
        );
    }

    return employees;
}
