import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import numeral from 'numeral'
import useAuth from '../../hooks/useAuth'
import {
  deleteCalculation,
  demoJoinedAtDate,
  seedDemoCalculations,
  subscribeCalculations,
} from '../../firebase/calculations'
import { subscribeQueueLog } from '../../firebase/queueLog'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

function formatDate(value) {
  if (!value) return '—'
  return value.toLocaleString()
}

function Profile() {
  const { user, loading, logout } = useAuth()
  const [calculations, setCalculations] = useState([])
  const [joinedAt, setJoinedAt] = useState(null)
  const [listError, setListError] = useState('')
  const [seedStatus, setSeedStatus] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [queueJob, setQueueJob] = useState(null)

  useEffect(() => {
    if (!user) return undefined

    let cancelled = false
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!cancelled && snap.exists()) {
          const data = snap.data()
          setJoinedAt(data.joinedAt?.toDate?.() || data.createdAt?.toDate?.() || null)
        }
      } catch {
        // ignore profile read errors; list still works
      }
    })()

    const unsubscribeCalcs = subscribeCalculations(
      user.uid,
      (items) => {
        setCalculations(items)
        setListLoading(false)
        setListError('')
      },
      (err) => {
        setListError(err.message || 'Failed to load calculations')
        setListLoading(false)
      },
    )

    const unsubscribeQueue = subscribeQueueLog(
      user.uid,
      (job) => setQueueJob(job),
      () => setQueueJob(null),
    )

    return () => {
      cancelled = true
      unsubscribeCalcs()
      unsubscribeQueue()
    }
  }, [user])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Loading profile" />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedStatus('')
    try {
      const count = await seedDemoCalculations(user.uid)
      setJoinedAt(demoJoinedAtDate())
      setSeedStatus(
        `Seeded ${count} calculations over ~2 weeks (aligned with a new Firebase project).`,
      )
    } catch (err) {
      setSeedStatus(err.message || 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCalculation(user.uid, id)
    } catch (err) {
      setListError(err.message || 'Delete failed')
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 960 }}>
        <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Your cabinet
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Name:</strong> {user.displayName || '—'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {user.email || '—'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Member since (Firestore):</strong>{' '}
            {joinedAt ? formatDate(joinedAt) : '— (seed or save to set)'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Firebase Auth still shows the real signup date in Console. Only app/Firestore
            history can look older.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? 'Seeding…' : 'Seed demo history (28 calcs, ~2 weeks)'}
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => logout()}>
              Log out
            </Button>
          </Box>
          {seedStatus ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {seedStatus}
            </Alert>
          ) : null}
        </Paper>

        <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Cloud queue (Cloud Tasks)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            After you save a calculation, a Cloud Function enqueues a Task; the
            worker updates this log asynchronously (producer → queue → consumer).
          </Typography>
          {!queueJob ? (
            <Typography color="text.secondary">
              No queue jobs yet. Save a calculation on /calc (after Functions are
              deployed), then watch status here.
            </Typography>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                <strong>Status:</strong> {queueJob.status || '—'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                <strong>Calc ID:</strong> {queueJob.calcId || '—'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                <strong>Bank:</strong> {queueJob.bankName || '—'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                <strong>Message:</strong> {queueJob.message || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Queued: {formatDate(queueJob.enqueuedAt)} · Processed:{' '}
                {formatDate(queueJob.processedAt)}
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 4 }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Saved calculations ({calculations.length})
          </Typography>

          {listError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {listError}
            </Alert>
          ) : null}

          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : calculations.length === 0 ? (
            <Typography color="text.secondary">
              No saved calculations yet. Use Calculator → Save, or seed demo history.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell align="right">Loan</TableCell>
                  <TableCell align="right">Down</TableCell>
                  <TableCell align="right">Term</TableCell>
                  <TableCell align="right">APR</TableCell>
                  <TableCell align="right">Monthly</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {calculations.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell>{row.bankName || '—'}</TableCell>
                    <TableCell align="right">
                      {numeral(row.initialLoan).format('$0,0')}
                    </TableCell>
                    <TableCell align="right">
                      {numeral(row.downPayment).format('$0,0')}
                    </TableCell>
                    <TableCell align="right">{row.loanTerm}y</TableCell>
                    <TableCell align="right">{row.loanApr}%</TableCell>
                    <TableCell align="right">
                      {numeral(row.monthlyPayment).format('$0,0.00')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="Delete calculation"
                        size="small"
                        onClick={() => handleDelete(row.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default Profile
