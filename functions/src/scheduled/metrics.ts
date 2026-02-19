import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ─── Scheduled Metrics Calculation ────────────────────────────────────

export const scheduledMetricsCalculation = functions.pubsub
    .schedule('every day 00:00')
    .timeZone('Asia/Bahrain')
    .onRun(async (context) => {
        functions.logger.info('[Scheduled] Starting daily metrics calculation');

        try {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);

            const employeesSnapshot = await db.collection('employees').get();

            let successCount = 0;
            let errorCount = 0;

            for (const doc of employeesSnapshot.docs) {
                try {
                    await calculateEmployeeMetrics(doc.id, weekAgo.toISOString(), today.toISOString());
                    successCount++;
                } catch (error) {
                    functions.logger.error('[Scheduled] Error calculating metrics for employee', {
                        error,
                        employeeId: doc.id,
                    });
                    errorCount++;
                }
            }

            functions.logger.info('[Scheduled] Metrics calculation completed', {
                successCount,
                errorCount,
            });
        } catch (error) {
            functions.logger.error('[Scheduled] Error in scheduled metrics calculation', { error });
        }
    });

// ─── Calculate Employee Metrics ───────────────────────────────────────

async function calculateEmployeeMetrics(
    employeeId: string,
    periodStart: string,
    periodEnd: string
): Promise<void> {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    const tasksSnapshot = await db
        .collection('tasks')
        .where('assignee_id', '==', employeeId)
        .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startDate))
        .where('created_at', '<=', admin.firestore.Timestamp.fromDate(endDate))
        .get();

    const tasks = tasksSnapshot.docs.map((doc) => doc.data());

    let tasksAssigned = tasks.length;
    let tasksAccepted = 0;
    let tasksCompleted = 0;
    let tasksRejected = 0;
    let tasksOverdue = 0;
    let totalResponseTime = 0;
    let totalCompletionTime = 0;
    let totalQualityRating = 0;
    let qualityRatingCount = 0;
    let responseTimeCount = 0;
    let completionTimeCount = 0;
    let escalationCount = 0;

    for (const task of tasks) {
        if (task.status === 'REJECTED') {
            tasksRejected++;
        } else if (['ACCEPTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].includes(task.status)) {
            tasksAccepted++;
        }

        if (task.status === 'COMPLETED') {
            tasksCompleted++;

            if (task.completion_time) {
                totalCompletionTime += task.completion_time;
                completionTimeCount++;
            }

            if (task.quality_rating) {
                totalQualityRating += task.quality_rating;
                qualityRatingCount++;
            }

            if (task.deadline && task.completed_at) {
                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                const completedAt = task.completed_at.toDate ? task.completed_at.toDate() : new Date(task.completed_at);
                if (completedAt > deadline) {
                    tasksOverdue++;
                }
            }
        }

        if (task.response_time) {
            totalResponseTime += task.response_time;
            responseTimeCount++;
        }

        if (task.escalation_count) {
            escalationCount += task.escalation_count;
        }
    }

    const acceptanceRate = tasksAssigned > 0 ? Math.round((tasksAccepted / tasksAssigned) * 100) : 0;
    const completionRate = tasksAccepted > 0 ? Math.round((tasksCompleted / tasksAccepted) * 100) : 0;
    const onTimeCount = tasksCompleted - tasksOverdue;
    const onTimeRate = tasksCompleted > 0 ? Math.round((onTimeCount / tasksCompleted) * 100) : 0;
    const avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;
    const avgCompletionTime = completionTimeCount > 0 ? Math.round(totalCompletionTime / completionTimeCount) : 0;
    const avgQualityRating = qualityRatingCount > 0 ? Math.round((totalQualityRating / qualityRatingCount) * 10) / 10 : 0;

    // Get media count
    const mediaSnapshot = await db
        .collection('task_media')
        .where('uploader_id', '==', employeeId)
        .where('uploaded_at', '>=', admin.firestore.Timestamp.fromDate(startDate))
        .where('uploaded_at', '<=', admin.firestore.Timestamp.fromDate(endDate))
        .get();

    const totalMediaUploaded = mediaSnapshot.size;

    // Calculate performance score
    const performanceScore = calculatePerformanceScore({
        completionRate,
        onTimeRate,
        acceptanceRate,
        avgQualityRating,
        avgResponseTime,
        escalationCount,
    });

    // Store metrics
    await db.collection('performance_metrics').add({
        employee_id: employeeId,
        period_start: periodStart,
        period_end: periodEnd,
        tasks_assigned: tasksAssigned,
        tasks_accepted: tasksAccepted,
        tasks_completed: tasksCompleted,
        tasks_rejected: tasksRejected,
        tasks_overdue: tasksOverdue,
        acceptance_rate: acceptanceRate,
        completion_rate: completionRate,
        on_time_rate: onTimeRate,
        avg_response_time: avgResponseTime,
        avg_completion_time: avgCompletionTime,
        avg_quality_rating: avgQualityRating,
        total_media_uploaded: totalMediaUploaded,
        escalation_count: escalationCount,
        performance_score: performanceScore,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update employee's performance score
    await db.collection('employees').doc(employeeId).update({
        performance_score: performanceScore,
        response_time_avg: avgResponseTime,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Calculate Performance Score ──────────────────────────────────────

function calculatePerformanceScore(metrics: {
    completionRate: number;
    onTimeRate: number;
    acceptanceRate: number;
    avgQualityRating: number;
    avgResponseTime: number;
    escalationCount: number;
}): number {
    let score = 50;

    // Completion rate contribution (max 25 points)
    score += (metrics.completionRate / 100) * 25;

    // On-time rate contribution (max 15 points)
    score += (metrics.onTimeRate / 100) * 15;

    // Acceptance rate contribution (max 10 points)
    score += (metrics.acceptanceRate / 100) * 10;

    // Quality rating contribution (max 10 points)
    score += (metrics.avgQualityRating / 5) * 10;

    // Response time bonus/penalty
    if (metrics.avgResponseTime > 0) {
        if (metrics.avgResponseTime < 300) {
            score += 5;
        } else if (metrics.avgResponseTime > 1800) {
            score -= 10;
        } else if (metrics.avgResponseTime > 3600) {
            score -= 20;
        }
    }

    // Escalation penalty
    score -= metrics.escalationCount * 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}
