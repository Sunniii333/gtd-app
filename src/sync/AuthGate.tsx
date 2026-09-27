import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { startSync } from './cloud'
import { auth, googleProvider } from './firebase'

/** Sign-in is required (ADR 0001): the app only renders once we know whose Cloud copy to mirror. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRedirectResult(auth).catch((e: Error) => setError(e.message))
    return onAuthStateChanged(auth, setUser)
  }, [])
  useEffect(() => (user ? startSync(user.uid) : undefined), [user])

  if (user) return children
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4 text-ink">
      <div className="w-full max-w-xs border border-rule bg-surface p-6 text-center">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em]">GTD</h1>
        {user === undefined ? (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Loading…</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              // An installed app has no popups to speak of; a browser tab keeps its state with a popup.
              const standalone = matchMedia('(display-mode: standalone)').matches
              const signIn = standalone ? signInWithRedirect : signInWithPopup
              signIn(auth, googleProvider).catch((e: Error) => setError(e.message))
            }}
            className="mt-4 w-full border border-rule px-3 py-2 text-xs uppercase tracking-[0.1em] hover:bg-canvas"
          >
            Sign in with Google
          </button>
        )}
        {error && <p className="mt-3 text-xs text-pale-red-ink">{error}</p>}
      </div>
    </div>
  )
}
