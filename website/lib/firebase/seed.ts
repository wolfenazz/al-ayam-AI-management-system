import {
    setDocument,
    getDocument,
    COLLECTIONS,
    serverTimestamp,
} from '@/lib/firebase/firestore';
import { mockEmployees, mockTasks, mockMessages, mockNotifications } from '@/lib/mock-data';

/**
 * Seed Firestore with mock data.
 * Idempotent — checks if data already exists before writing.
 * Returns the number of documents created.
 */
export async function seedFirestore(): Promise<{
    employees: number;
    tasks: number;
    messages: number;
    notifications: number;
}> {
    let employeesCreated = 0;
    let tasksCreated = 0;
    let messagesCreated = 0;
    let notificationsCreated = 0;

    // Seed Employees
    for (const emp of mockEmployees) {
        const existing = await getDocument(COLLECTIONS.EMPLOYEES, emp.id);
        if (!existing) {
            const { id, ...data } = emp;
            await setDocument(COLLECTIONS.EMPLOYEES, id, {
                ...data,
                created_at: serverTimestamp(),
                last_active: serverTimestamp(),
            }, false);
            employeesCreated++;
        }
    }

    // Seed Tasks
    for (const task of mockTasks) {
        const existing = await getDocument(COLLECTIONS.TASKS, task.id);
        if (!existing) {
            const { id, ...data } = task;
            await setDocument(COLLECTIONS.TASKS, id, {
                ...data,
                created_at: serverTimestamp(),
            }, false);
            tasksCreated++;
        }
    }

    // Seed Messages
    for (const msg of mockMessages) {
        const existing = await getDocument(COLLECTIONS.TASK_MESSAGES, msg.id);
        if (!existing) {
            const { id, ...data } = msg;
            await setDocument(COLLECTIONS.TASK_MESSAGES, id, {
                ...data,
                sent_at: serverTimestamp(),
            }, false);
            messagesCreated++;
        }
    }

    // Seed Notifications
    for (const notif of mockNotifications) {
        const existing = await getDocument(COLLECTIONS.NOTIFICATIONS, notif.id);
        if (!existing) {
            const { id, ...data } = notif;
            await setDocument(COLLECTIONS.NOTIFICATIONS, id, {
                ...data,
                created_at: serverTimestamp(),
            }, false);
            notificationsCreated++;
        }
    }

    return {
        employees: employeesCreated,
        tasks: tasksCreated,
        messages: messagesCreated,
        notifications: notificationsCreated,
    };
}
