import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ─── Types ──────────────────────────────────────────────────────────

interface PerformanceMetrics {
    employee_id: string;
    period_start: string;
    period_end: string;
    tasks_assigned: number;
    tasks_accepted: number;
    tasks_completed: number;
    tasks_rejected: number;
    tasks_overdue: number;
    acceptance_rate: number;
    completion_rate: number;
    on_time_rate: number;
    avg_response_time: number;
    avg_completion_time: number;
    avg_quality_rating: number;
    total_media_uploaded: number;
    escalation_count: number;
}

// ─── Calculate Performance Metrics Cloud Function ─────────────────────

export const calculatePerformanceMetrics = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { employeeId, periodStart, periodEnd } = data;

    if (!employeeId) {
        throw new functions.https.HttpsError('invalid-argument', 'Employee ID is required');
    }

    return await calculateEmployeeMetrics(employeeId, periodStart, periodEnd);
});

// ─── Recalculate All Metrics Cloud Function ───────────────────────────

export const recalculateAllMetrics = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { periodStart, periodEnd } = data;

    const employeesSnapshot = await db.collection('employees').get();
    const results = [];

    for (const doc of employeesSnapshot.docs) {
        const result = await calculateEmployeeMetrics(doc.id, periodStart, periodEnd);
        results.push({ employeeId: doc.id, ...result });
    }

    return { success: true, count: results.length, results };
});

// ─── Calculate Employee Metrics ───────────────────────────────────────

async function calculateEmployeeMetrics(
    employeeId: string,
    periodStart?: string,
    periodEnd?: string
): Promise<{ success: boolean; metrics?: PerformanceMetrics; error?: string }> {
    try {
        const startDate = periodStart ? new Date(periodStart) : getWeekStart();
        const endDate = periodEnd ? new Date(periodEnd) : new Date();

        const tasksSnapshot = await db
            .collection('tasks')
            .where('assignee_id', '==', employeeId)
            .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startDate))
            .where('created_at', '<=', admin.firestore.Timestamp.fromDate(endDate))
            .get();

        const tasks = tasksSnapshot.docs.map((doc) => doc.data());

        const metrics: PerformanceMetrics = {
            employee_id: employeeId,
            period_start: startDate.toISOString(),
            period_end: endDate.toISOString(),
            tasks_assigned: 0,
            tasks_accepted: 0,
            tasks_completed: 0,
            tasks_rejected: 0,
            tasks_overdue: 0,
            acceptance_rate: 0,
            completion_rate: 0,
            on_time_rate: 0,
            avg_response_time: 0,
            avg_completion_time: 0,
            avg_quality_rating: 0,
            total_media_uploaded: 0,
            escalation_count: 0,
        };

        let totalResponseTime = 0;
        let totalCompletionTime = 0;
        let totalQualityRating = 0;
        let qualityRatingCount = 0;
        let responseTimeCount = 0;
        let completionTimeCount = 0;

        for (const task of tasks) {
            metrics.tasks_assigned++;

            if (task.status === 'REJECTED') {
                metrics.tasks_rejected++;
            } else if (['ACCEPTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].includes(task.status)) {
                metrics.tasks_accepted++;
            }

            if (task.status === 'COMPLETED') {
                metrics.tasks_completed++;

                if (task.deadline && task.completed_at) {
                    const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                    const completedAt = task.completed_at.toDate ? task.completed_at.toDate() : new Date(task.completed_at);
                    if (completedAt <= deadline) {
                        // On time - counted in on_time_rate calculation
                    }
                }

                if (task.completion_time) {
                    totalCompletionTime += task.completion_time;
                    completionTimeCount++;
                }

                if (task.quality_rating) {
                    totalQualityRating += task.quality_rating;
                    qualityRatingCount++;
                }
            }

            if (task.status === 'OVERDUE' || (task.deadline && task.completed_at)) {
                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                const completedAt = task.completed_at?.toDate ? task.completed_at.toDate() : new Date(task.completed_at);
                if (completedAt > deadline) {
                    metrics.tasks_overdue++;
                }
            }

            if (task.response_time) {
                totalResponseTime += task.response_time;
                responseTimeCount++;
            }

            if (task.escalation_count) {
                metrics.escalation_count += task.escalation_count;
            }
        }

        // Calculate rates
        metrics.acceptance_rate = metrics.tasks_assigned > 0
            ? Math.round((metrics.tasks_accepted / metrics.tasks_assigned) * 100)
            : 0;

        metrics.completion_rate = metrics.tasks_accepted > 0
            ? Math.round((metrics.tasks_completed / metrics.tasks_accepted) * 100)
            : 0;

        const onTimeCount = metrics.tasks_completed - metrics.tasks_overdue;
        metrics.on_time_rate = metrics.tasks_completed > 0
            ? Math.round((onTimeCount / metrics.tasks_completed) * 100)
            : 0;

        metrics.avg_response_time = responseTimeCount > 0
            ? Math.round(totalResponseTime / responseTimeCount)
            : 0;

        metrics.avg_completion_time = completionTimeCount > 0
            ? Math.round(totalCompletionTime / completionTimeCount)
            : 0;

        metrics.avg_quality_rating = qualityRatingCount > 0
            ? Math.round((totalQualityRating / qualityRatingCount) * 10) / 10
            : 0;

        // Get media count
        const mediaSnapshot = await db
            .collection('task_media')
            .where('uploader_id', '==', employeeId)
            .where('uploaded_at', '>=', admin.firestore.Timestamp.fromDate(startDate))
            .where('uploaded_at', '<=', admin.firestore.Timestamp.fromDate(endDate))
            .get();

        metrics.total_media_uploaded = mediaSnapshot.size;

        // Calculate performance score
        const performanceScore = calculatePerformanceScore(metrics);

        // Store metrics
        await db.collection('performance_metrics').add({
            ...metrics,
            performance_score: performanceScore,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update employee's performance score
        await db.collection('employees').doc(employeeId).update({
            performance_score: performanceScore,
            response_time_avg: metrics.avg_response_time,
            total_tasks_completed: admin.firestore.FieldValue.increment(metrics.tasks_completed),
        });

        return { success: true, metrics };
    } catch (error) {
        functions.logger.error('[Performance] Error calculating metrics', { error, employeeId });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── Calculate Performance Score ──────────────────────────────────────

function calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 50;

    // Completion rate contribution (max 25 points)
    score += (metrics.completion_rate / 100) * 25;

    // On-time rate contribution (max 15 points)
    score += (metrics.on_time_rate / 100) * 15;

    // Acceptance rate contribution (max 10 points)
    score += (metrics.acceptance_rate / 100) * 10;

    // Quality rating contribution (max 10 points)
    score += (metrics.avg_quality_rating / 5) * 10;

    // Response time penalty
    if (metrics.avg_response_time > 0) {
        if (metrics.avg_response_time < 300) {
            score += 5;
        } else if (metrics.avg_response_time > 1800) {
            score -= 10;
        } else if (metrics.avg_response_time > 3600) {
            score -= 20;
        }
    }

    // Escalation penalty
    score -= metrics.escalation_count * 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Get Week Start ──────────────────────────────────────────────────

function getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// ─── Get Metrics for Employee ─────────────────────────────────────────

export async function getEmployeeMetrics(
    employeeId: string,
    periodStart?: string,
    periodEnd?: string
): Promise<PerformanceMetrics | null> {
    let query: FirebaseFirestore.Query = db
        .collection('performance_metrics')
        .where('employee_id', '==', employeeId)
        .orderBy('period_end', 'desc')
        .limit(1);

    if (periodStart && periodEnd) {
        query = db
            .collection('performance_metrics')
            .where('employee_id', '==', employeeId)
            .where('period_start', '==', periodStart)
            .where('period_end', '==', periodEnd)
            .limit(1);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data() as PerformanceMetrics;
}

// ─── Get Team Metrics ─────────────────────────────────────────────────

export async function getTeamMetrics(
    managerId: string,
    periodStart?: string,
    periodEnd?: string
): Promise<PerformanceMetrics[]> {
    const employeesSnapshot = await db
        .collection('employees')
        .where('manager_id', '==', managerId)
        .get();

    const employeeIds = employeesSnapshot.docs.map((doc) => doc.id);

    const metrics: PerformanceMetrics[] = [];

    for (const employeeId of employeeIds) {
        const employeeMetrics = await getEmployeeMetrics(employeeId, periodStart, periodEnd);
        if (employeeMetrics) {
            metrics.push(employeeMetrics);
        }
    }

    return metrics;
}
