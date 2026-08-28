import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'

export const AuthContext = createContext(null)

async function ensureUserProfile(user, extra = {}) {
  if (!user) return
  const ref = doc(db, 'users', user.uid)
  const existing = await getDoc(ref)
  const payload = {
    email: user.email || '',
    displayName: extra.displayName || user.displayName || '',
    updatedAt: serverTimestamp(),
    ...extra,
  }
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp()
  }
  await setDoc(ref, payload, { merge: true })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const register = useCallback(async (email, password, displayName) => {
    setError(null)
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(credential.user, { displayName })
    }
    await ensureUserProfile(credential.user, { displayName: displayName || '' })
    return credential.user
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await ensureUserProfile(credential.user)
    return credential.user
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(auth, provider)
    await ensureUserProfile(credential.user)
    return credential.user
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      clearError,
      register,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, loading, error, clearError, register, login, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
