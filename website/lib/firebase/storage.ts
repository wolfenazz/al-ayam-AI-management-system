import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata
} from 'firebase/storage'
import { storage } from './config'

export async function uploadFile(
  path: string,
  file: File,
  metadata?: { contentType?: string; customMetadata?: Record<string, string> }
): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, metadata)
  return getDownloadURL(storageRef)
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

export async function getFileMetadata(path: string) {
  const storageRef = ref(storage, path)
  return getMetadata(storageRef)
}

export function getFilePath(
  type: 'media' | 'documents' | 'profile',
  id: string,
  fileName: string
): string {
  return `${type}/${id}/${Date.now()}_${fileName}`
}
