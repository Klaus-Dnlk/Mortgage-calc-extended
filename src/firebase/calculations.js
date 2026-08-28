import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { round } from 'lodash'
import { db } from './config'

function calculationsRef(uid) {
  return collection(db, 'users', uid, 'calculations')
}

export function calculateMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12
  const numberOfPayments = years * 12
  if (monthlyRate === 0) return round(principal / numberOfPayments, 2)
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  return round(payment, 2)
}

export async function saveCalculation(uid, data) {
  const initialLoan = Number(data.initialLoan)
  const downPayment = Number(data.downPayment)
  const loanTerm = Number(data.loanTerm)
  const loanApr = Number(data.loanApr)
  const monthlyPayment =
    data.monthlyPayment ??
    calculateMonthlyPayment(initialLoan, loanApr, loanTerm)

  const payload = {
    bankId: data.bankId || null,
    bankName: data.bankName || '',
    initialLoan,
    downPayment,
    loanTerm,
    loanApr,
    monthlyPayment,
    totalPayment: round(monthlyPayment * loanTerm * 12, 2),
    createdAt: data.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (data.id) {
    await setDoc(doc(db, 'users', uid, 'calculations', data.id), payload, {
      merge: true,
    })
    return data.id
  }

  const ref = await addDoc(calculationsRef(uid), payload)
  return ref.id
}

export function subscribeCalculations(uid, onData, onError) {
  const q = query(calculationsRef(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
        }
      })
      onData(items)
    },
    onError,
  )
}

export async function deleteCalculation(uid, calcId) {
  await deleteDoc(doc(db, 'users', uid, 'calculations', calcId))
}

/** Start of demo history window (~2 weeks) — matches a newly created cloud project. */
export function demoJoinedAtDate() {
  const d = new Date()
  d.setDate(d.getDate() - 14)
  d.setHours(10, 0, 0, 0)
  return d
}

/**
 * Seeds ~28 varied calculations over the last ~2 weeks.
 * Idempotent: fixed doc ids seed-01 … seed-28.
 */
export async function seedDemoCalculations(uid) {
  const banks = [
    { id: 'demo-a', name: 'PrivatBank Demo', rate: 12.5, term: 20 },
    { id: 'demo-b', name: 'Oschadbank Demo', rate: 13.2, term: 25 },
    { id: 'demo-c', name: 'Monobank Demo', rate: 11.8, term: 15 },
    { id: 'demo-d', name: 'Raiffeisen Demo', rate: 14.0, term: 30 },
    { id: 'demo-e', name: 'Ukrsibbank Demo', rate: 12.0, term: 20 },
    { id: 'demo-f', name: 'Pumb Demo', rate: 15.5, term: 10 },
    { id: 'demo-g', name: 'Credit Agricole Demo', rate: 11.2, term: 25 },
  ]

  const loanVariants = [
    80000, 100000, 120000, 150000, 180000, 200000, 220000, 250000, 280000,
    300000, 350000, 400000, 450000, 500000,
  ]
  const downRatios = [0.1, 0.15, 0.2, 0.25, 0.3]

  const now = new Date()
  const start = demoJoinedAtDate()
  const batch = writeBatch(db)
  const profileRef = doc(db, 'users', uid)

  batch.set(
    profileRef,
    {
      joinedAt: Timestamp.fromDate(start),
      demoHistorySeededAt: serverTimestamp(),
      demoHistoryNote:
        'Demo seed uses ~2 weeks of activity aligned with a new cloud project — not fake multi-month history.',
    },
    { merge: true },
  )

  const count = 28
  for (let i = 0; i < count; i += 1) {
    const bank = banks[i % banks.length]
    const initialLoan = loanVariants[i % loanVariants.length]
    const downPayment = round(initialLoan * downRatios[i % downRatios.length], 2)
    const loanApr = round(bank.rate + ((i % 5) - 2) * 0.15, 2)
    const loanTerm = Math.max(5, bank.term + ((i % 3) - 1) * 5)
    const monthlyPayment = calculateMonthlyPayment(initialLoan, loanApr, loanTerm)

    const created = new Date(start)
    const spanMs = now.getTime() - start.getTime()
    created.setTime(start.getTime() + Math.floor((spanMs * (i + 1)) / (count + 1)))
    created.setHours(9 + (i % 8), (i * 7) % 60, 0, 0)

    const calcRef = doc(
      db,
      'users',
      uid,
      'calculations',
      `seed-${String(i + 1).padStart(2, '0')}`,
    )
    batch.set(calcRef, {
      bankId: bank.id,
      bankName: bank.name,
      initialLoan,
      downPayment,
      loanTerm,
      loanApr,
      monthlyPayment,
      totalPayment: round(monthlyPayment * loanTerm * 12, 2),
      createdAt: Timestamp.fromDate(created),
      updatedAt: Timestamp.fromDate(created),
      source: 'demo-seed',
    })
  }

  await batch.commit()
  return count
}
