import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    UploadTaskSnapshot,
    UploadTask,
} from 'firebase/storage';
import { storage } from './app';

// ─── Upload ──────────────────────────────────────────────────────

interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number; // 0 to 100
    state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export function uploadFile(
    path: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
): { uploadTask: UploadTask; promise: Promise<string> } {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
    });

    const promise = new Promise<string>((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.({
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    progress,
                    state: snapshot.state as UploadProgress['state'],
                });
            },
            (error) => {
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });

    return { uploadTask, promise };
}

/**
 * Upload task-related media (photos, videos, documents)
 */
export function uploadTaskMedia(
    taskId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `tasks/${taskId}/media/${fileName}`;
    return uploadFile(path, file, onProgress);
}

/**
 * Upload user avatar
 */
export function uploadAvatar(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
) {
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}/avatar.${ext}`;
    return uploadFile(path, file, onProgress);
}

// ─── Download ────────────────────────────────────────────────────

/**
 * Get the download URL for a file
 */
export async function getFileURL(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
}

// ─── Delete ──────────────────────────────────────────────────────

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    return deleteObject(storageRef);
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Generate a storage path for task media
 */
export function getTaskMediaPath(taskId: string, fileName: string): string {
    return `tasks/${taskId}/media/${fileName}`;
}

/**
 * Get file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
