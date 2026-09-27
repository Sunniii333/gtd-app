import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

// Web config is public by design; access is guarded by firestore.rules. Filled in from the Firebase console.
const projectId = 'REPLACE_ME'
const config = {
  apiKey: 'REPLACE_ME',
  // In production sign-in runs through our own domain (vercel.json proxies /__/auth to Firebase), so the
  // redirect flow works in an iOS home-screen app, where popups and third-party storage don't.
  authDomain: import.meta.env.DEV ? `${projectId}.firebaseapp.com` : location.host,
  projectId,
  appId: 'REPLACE_ME',
}

export const configured = projectId !== 'REPLACE_ME'

const app = initializeApp(config)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
/** The Device's own copy lives in IndexedDB, so the app works offline and catches up later. */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true,
})
