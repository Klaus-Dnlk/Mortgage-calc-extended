import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './config'

/**
 * Live updates for the latest Cloud Tasks job result.
 * Path: users/{uid}/meta/queueLog
 */
export function subscribeQueueLog(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid, 'meta', 'queueLog'),
    (snap) => {
      if (!snap.exists()) {
        onData(null)
        return
      }
      const data = snap.data()
      const lastJob = data.lastJob || null
      onData(
        lastJob
          ? {
              ...lastJob,
              processedAt: lastJob.processedAt?.toDate?.() || null,
              enqueuedAt: lastJob.enqueuedAt?.toDate?.() || null,
            }
          : null,
      )
    },
    onError,
  )
}
