import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// ─── Exports ───────────────────────────────────────────────────────

// WhatsApp Webhook Handler
export { whatsappWebhook } from './whatsapp/webhook';

// Task Assignment Engine
export { assignTask, findBestEmployee } from './tasks/assignment';

// Task Escalation Logic
export { checkOverdueTasks, escalateTask } from './tasks/escalation';

// Notification Engine
export {
    sendNotification,
    sendTaskNotification,
    sendEscalationNotification,
} from './notifications/engine';

// Performance Metrics Calculator
export { calculatePerformanceMetrics, recalculateAllMetrics } from './analytics/performance';

// Media Processing Pipeline
export { processMedia, generateThumbnail, transcribeAudio } from './media/processor';

// Firestore Triggers
export {
    onTaskCreate,
    onTaskUpdate,
    onMessageCreate,
} from './triggers/tasks';

// Scheduled Functions
export { scheduledMetricsCalculation, scheduledEscalationCheck } from './scheduled/metrics';

// ─── Config ─────────────────────────────────────────────────────────

export const config = functions.config();

// ─── Health Check ───────────────────────────────────────────────────

export const healthCheck = functions.https.onRequest((request, response) => {
    response.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'al-ayyam-functions',
    });
});
