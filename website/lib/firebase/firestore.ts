import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    onSnapshot,
    serverTimestamp,
    QueryConstraint,
    DocumentData,
    Unsubscribe,
    Timestamp,
} from 'firebase/firestore';
import { db } from './app';

// ─── Collection References ──────────────────────────────────────

export const COLLECTIONS = {
    EMPLOYEES: 'employees',
    TASKS: 'tasks',
    TASK_MESSAGES: 'task_messages',
    TASK_MEDIA: 'task_media',
    NOTIFICATIONS: 'notifications',
    TASK_TEMPLATES: 'task_templates',
    PERFORMANCE_METRICS: 'performance_metrics',
} as const;

// ─── Generic CRUD Operations ─────────────────────────────────────

/**
 * Get a single document by ID
 */
export async function getDocument<T>(
    collectionName: string,
    docId: string
): Promise<T | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
}

/**
 * Create or overwrite a document
 */
export async function setDocument(
    collectionName: string,
    docId: string,
    data: DocumentData,
    merge = true
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    return setDoc(docRef, { ...data, updated_at: serverTimestamp() }, { merge });
}

/**
 * Update specific fields of a document
 */
export async function updateDocument(
    collectionName: string,
    docId: string,
    data: Partial<DocumentData>
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    return updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
}

/**
 * Delete a document
 */
export async function deleteDocument(
    collectionName: string,
    docId: string
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    return deleteDoc(docRef);
}

// ─── Query Operations ────────────────────────────────────────────

/**
 * Query documents with filters
 */
export async function queryDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): Promise<T[]> {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as T[];
}

// ─── Real-time Listeners ─────────────────────────────────────────

/**
 * Subscribe to a single document in real-time
 */
export function listenToDocument<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
): Unsubscribe {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
            callback(null);
        }
    });
}

/**
 * Subscribe to a collection query in real-time
 */
export function listenToCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    callback: (data: T[]) => void
): Unsubscribe {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    return onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as T[];
        callback(results);
    });
}

// ─── Helper Exports ──────────────────────────────────────────────

export {
    where,
    orderBy,
    limit,
    serverTimestamp,
    collection,
    doc,
    Timestamp,
};
