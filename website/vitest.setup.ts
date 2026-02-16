import '@testing-library/jest-dom'

// Mock Firebase services
vi.mock('@/lib/firebase/firestore', () => ({
  db: {},
  getDocument: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getCollection: vi.fn(),
  buildQuery: vi.fn()
}))

vi.mock('@/lib/firebase/storage', () => ({
  storage: {},
  uploadFile: vi.fn(),
  getDownloadURL: vi.fn()
}))

vi.mock('@/lib/firebase/auth', () => ({
  auth: {},
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}))

// Mock Meta WhatsApp API
global.fetch = vi.fn()
