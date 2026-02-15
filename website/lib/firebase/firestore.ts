import { cache } from 'react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  Query
} from 'firebase/firestore'
import { db } from './config'

export const getCollection = cache(
  async <T extends DocumentData>(
    collectionPath: string,
    constraints: readonly QueryConstraint[] = []
  ): Promise<T[]> => {
    const q = query(collection(db, collectionPath), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as T))
  }
)

export const getDocument = cache(
  async <T extends DocumentData>(
    collectionPath: string,
    documentId: string
  ): Promise<T | null> => {
    const docRef = doc(db, collectionPath, documentId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as unknown as T)
      : null
  }
)

export async function createDocument<T extends DocumentData>(
  collectionPath: string,
  data: T,
  documentId?: string
): Promise<string> {
  if (documentId) {
    await setDoc(doc(db, collectionPath, documentId), data)
    return documentId
  }
  const docRef = await addDoc(collection(db, collectionPath), data)
  return docRef.id
}

export async function updateDocument(
  collectionPath: string,
  documentId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionPath, documentId)
  await updateDoc(docRef, data)
}

export async function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  await deleteDoc(doc(db, collectionPath, documentId))
}

export function buildQuery(
  collectionPath: string,
  constraints: readonly QueryConstraint[] = []
): Query {
  return query(collection(db, collectionPath), ...constraints)
}
