import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    User,
    UserCredential,
} from 'firebase/auth';
import { auth } from './app';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Email/Password Authentication ───────────────────────────────

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create new account with email and password
 */
export async function registerWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Set the display name on the Firebase Auth profile
    if (credential.user) {
        await updateProfile(credential.user, { displayName });
    }

    return credential;
}

// ─── Google Authentication ───────────────────────────────────────

/**
 * Sign in (or sign up) with Google popup
 */
export async function loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
}

// ─── Session Management ──────────────────────────────────────────

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
    return signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
}

// ─── Auth State Observer ────────────────────────────────────────

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get current user synchronously (may be null if not yet resolved)
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// ─── Error Handling ──────────────────────────────────────────────

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
export function getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/user-disabled': 'This account has been disabled. Contact support.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/requires-recent-login': 'Please log in again to perform this action.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled. Contact admin.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
