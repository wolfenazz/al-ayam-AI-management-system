import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function POST(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify the requesting user's token
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        // Check if the requesting user is an Admin or Manager
        const requestingUserId = decodedToken.uid;
        const requestingUserDoc = await adminDb
            .collection('employees')
            .doc(requestingUserId)
            .get();

        if (!requestingUserDoc.exists) {
            return NextResponse.json(
                { error: 'Forbidden - User not found' },
                { status: 403 }
            );
        }

        const requestingUserData = requestingUserDoc.data();
        const allowedRoles = ['Admin', 'Manager'];
        
        if (!allowedRoles.includes(requestingUserData?.role)) {
            return NextResponse.json(
                { error: 'Forbidden - Only Admins and Managers can delete users' },
                { status: 403 }
            );
        }

        // Get the user ID to delete from the request body
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'Bad Request - User ID is required' },
                { status: 400 }
            );
        }

        // Prevent users from deleting themselves
        if (userId === requestingUserId) {
            return NextResponse.json(
                { error: 'Forbidden - Cannot delete your own account' },
                { status: 403 }
            );
        }

        // Check if the user to delete exists
        const userToDeleteDoc = await adminDb
            .collection('employees')
            .doc(userId)
            .get();

        if (!userToDeleteDoc.exists) {
            return NextResponse.json(
                { error: 'Not Found - User does not exist' },
                { status: 404 }
            );
        }

        // Delete the Firebase Auth user
        try {
            await adminAuth.deleteUser(userId);
        } catch (authError) {
            console.error('Error deleting Firebase Auth user:', authError);
            // Continue to delete Firestore document even if Auth deletion fails
            // (user might already be deleted from Auth)
        }

        // Delete the Firestore document
        await adminDb.collection('employees').doc(userId).delete();

        return NextResponse.json({ 
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error in delete user API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
