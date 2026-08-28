/**
 * Phase 4 — message queue demo
 *
 * Producer: onCalculationCreated (Firestore write)
 * Queue:    Firebase/Google Cloud Tasks (auto queue for processCalculationTask)
 * Consumer: processCalculationTask → writes users/{uid}/meta/queueLog
 */
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { getFunctions } = require('firebase-admin/functions')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { onTaskDispatched } = require('firebase-functions/v2/tasks')
const { setGlobalOptions } = require('firebase-functions/v2')

initializeApp()
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

const TASK_FUNCTION = 'processCalculationTask'

/**
 * PRODUCER — runs when a calculation document is created.
 * Does not do heavy work itself; enqueues a Cloud Task instead.
 */
exports.onCalculationCreated = onDocumentCreated(
  'users/{uid}/calculations/{calcId}',
  async (event) => {
    const uid = event.params.uid
    const calcId = event.params.calcId
    const data = event.data?.data() || {}

    console.log('onCalculationCreated', { uid, calcId, bankName: data.bankName })

    const queue = getFunctions().taskQueue(TASK_FUNCTION)
    await queue.enqueue({
      uid,
      calcId,
      bankName: data.bankName || '',
      monthlyPayment: data.monthlyPayment ?? null,
      initialLoan: data.initialLoan ?? null,
      source: data.source || 'app',
      enqueuedAt: new Date().toISOString(),
    })

    console.log('Cloud Task enqueued', { calcId })

    const db = getFirestore()
    await db.doc(`users/${uid}/meta/queueLog`).set(
      {
        lastJob: {
          status: 'queued',
          calcId,
          bankName: data.bankName || '',
          enqueuedAt: FieldValue.serverTimestamp(),
          message: `Queued Cloud Task for calculation ${calcId}`,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  },
)

/**
 * CONSUMER / WORKER — Cloud Tasks delivers the job here asynchronously.
 */
exports.processCalculationTask = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 10,
    },
    rateLimits: {
      maxConcurrentDispatches: 5,
    },
  },
  async (req) => {
    const {
      uid,
      calcId,
      bankName,
      monthlyPayment,
      initialLoan,
      source,
      enqueuedAt,
    } = req.data || {}

    if (!uid || !calcId) {
      console.error('Invalid task payload', req.data)
      return
    }

    console.log('processCalculationTask start', { uid, calcId, bankName })

    // Simulate light async work (digest / validation / report hook)
    const digest = {
      calcId,
      bankName: bankName || '—',
      monthlyPayment,
      initialLoan,
      source: source || 'app',
      enqueuedAt: enqueuedAt || null,
      summary: `Processed mortgage calc ${calcId} (${bankName || 'no bank'})`,
    }

    const db = getFirestore()
    await db.doc(`users/${uid}/meta/queueLog`).set(
      {
        lastJob: {
          status: 'completed',
          ...digest,
          processedAt: FieldValue.serverTimestamp(),
          message: digest.summary,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    console.log('processCalculationTask done', { calcId, status: 'completed' })
  },
)
