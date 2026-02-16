// Firebase module barrel exports
// Import from '@/lib/firebase' for convenience

export { app, auth, db, storage } from './app';
export {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    onAuthChange,
    getCurrentUser,
    getAuthErrorMessage,
} from './auth';
export {
    COLLECTIONS,
    getDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    listenToDocument,
    listenToCollection,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from './firestore';
export {
    uploadFile,
    uploadTaskMedia,
    uploadAvatar,
    getFileURL,
    deleteFile,
    formatFileSize,
} from './storage';
