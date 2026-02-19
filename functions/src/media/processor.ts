import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import { getWhatsAppConfig } from '../config';

const db = admin.firestore();
const storage = new Storage();

// ─── Types ──────────────────────────────────────────────────────────

interface MediaProcessingResult {
    success: boolean;
    fileUrl?: string;
    thumbnailUrl?: string;
    transcription?: string;
    error?: string;
}

// ─── Process Media Cloud Function ─────────────────────────────────────

export const processMedia = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType || '';

    functions.logger.info('[Media] Processing uploaded file', { filePath, contentType });

    if (!filePath || !filePath.startsWith('tasks/')) {
        return;
    }

    const pathParts = filePath.split('/');
    const taskId = pathParts[1];
    const fileName = pathParts[pathParts.length - 1];

    try {
        const bucket = storage.bucket(object.bucket);
        const file = bucket.file(filePath);

        const [metadata] = await file.getMetadata();

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        let thumbnailUrl: string | undefined;

        if (contentType.startsWith('image/')) {
            thumbnailUrl = await generateThumbnail(bucket, filePath, contentType);
        }

        const uploaderId = metadata.metadata?.uploader_id || 'unknown';

        await db.collection('task_media').add({
            task_id: taskId,
            uploader_id: uploaderId,
            media_type: getMediaType(contentType),
            file_name: fileName,
            file_path: filePath,
            file_url: url,
            file_size: parseInt(metadata.size || '0', 10),
            mime_type: contentType,
            thumbnail_url: thumbnailUrl,
            is_watermarked: false,
            uploaded_at: admin.firestore.FieldValue.serverTimestamp(),
            is_approved: null,
        });

        await db.collection('notifications').add({
            recipient_id: 'managers',
            type: 'MEDIA_UPLOADED',
            priority: 'NORMAL',
            title: 'New Media Uploaded',
            message: `New ${getMediaType(contentType)} uploaded for task ${taskId}`,
            task_id: taskId,
            status: 'PENDING',
            channels: ['dashboard'],
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info('[Media] File processed successfully', { filePath, taskId });
    } catch (error) {
        functions.logger.error('[Media] Error processing file', { error, filePath });
    }
});

// ─── Generate Thumbnail Cloud Function ────────────────────────────────

export const generateThumbnail = async (
    bucket: any,
    filePath: string,
    contentType: string
): Promise<string | undefined> => {
    if (!contentType.startsWith('image/')) {
        return undefined;
    }

    try {
        const thumbnailPath = filePath.replace('/media/', '/thumbnails/');

        const [url] = await bucket.file(thumbnailPath).getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        return url;
    } catch (error) {
        functions.logger.error('[Media] Error generating thumbnail', { error, filePath });
        return undefined;
    }
};

// ─── Transcribe Audio Cloud Function ──────────────────────────────────

export const transcribeAudio = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { mediaId, audioUrl } = data;

    if (!audioUrl) {
        throw new functions.https.HttpsError('invalid-argument', 'Audio URL is required');
    }

    try {
        functions.logger.info('[Media] Transcribing audio', { mediaId });

        // Placeholder for transcription logic
        // In production, integrate with Google Cloud Speech-to-Text or similar service
        const transcription = `[Transcription placeholder for audio ${mediaId}]`;

        if (mediaId) {
            const mediaDoc = await db.collection('task_media').doc(mediaId).get();
            if (mediaDoc.exists) {
                await mediaDoc.ref.update({
                    transcription,
                    transcribed_at: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }

        return { success: true, transcription };
    } catch (error) {
        functions.logger.error('[Media] Error transcribing audio', { error, mediaId });
        throw new functions.https.HttpsError('internal', 'Failed to transcribe audio');
    }
});

// ─── Download WhatsApp Media ──────────────────────────────────────────

export async function downloadWhatsAppMedia(
    mediaId: string
): Promise<{ success: boolean; data?: Buffer; error?: string }> {
    const config = getWhatsAppConfig();

    if (!config) {
        return { success: false, error: 'WhatsApp not configured' };
    }

    try {
        const urlResponse = await axios.get(
            `https://graph.facebook.com/${config.apiVersion}/${mediaId}`,
            {
                headers: { Authorization: `Bearer ${config.accessToken}` },
            }
        );

        const mediaUrl = urlResponse.data.url;

        const mediaResponse = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
            responseType: 'arraybuffer',
        });

        return { success: true, data: Buffer.from(mediaResponse.data) };
    } catch (error) {
        functions.logger.error('[Media] Error downloading WhatsApp media', { error, mediaId });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── Upload Media to Storage ──────────────────────────────────────────

export async function uploadMediaToStorage(
    taskId: string,
    fileName: string,
    data: Buffer,
    contentType: string,
    uploaderId: string
): Promise<MediaProcessingResult> {
    try {
        const bucket = admin.storage().bucket();
        const filePath = `tasks/${taskId}/media/${Date.now()}_${fileName}`;

        const file = bucket.file(filePath);

        await file.save(data, {
            contentType,
            metadata: {
                metadata: {
                    uploader_id: uploaderId,
                    task_id: taskId,
                },
            },
        });

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        return { success: true, fileUrl: url };
    } catch (error) {
        functions.logger.error('[Media] Error uploading to storage', { error, fileName });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── Get Media Type ───────────────────────────────────────────────────

function getMediaType(contentType: string): string {
    if (contentType.startsWith('image/')) return 'IMAGE';
    if (contentType.startsWith('video/')) return 'VIDEO';
    if (contentType.startsWith('audio/')) return 'AUDIO';
    if (contentType.includes('pdf') || contentType.includes('document')) return 'DOCUMENT';
    return 'DOCUMENT';
}
