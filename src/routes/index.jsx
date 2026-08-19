import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import ErrorBoundary from '../components/ErrorBoundary'

const Home = lazy(() => import('../pages/Home'))
const Banks = lazy(() => import('../pages/Banks'))
const Calc = lazy(() => import('../pages/Calc'))
const PatternsDemo = lazy(() => import('../pages/PatternsDemo'))

function RouteFallback() {
    return (
        <Box
            data-testid="route-fallback"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 8,
                gap: 2,
            }}
        >
            <CircularProgress aria-label="Loading page" />
            <Typography color="text.secondary">Loading page…</Typography>
        </Box>
    )
}

function AppRoutes() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/calc" element={<Calc />} />
                    <Route path="/banks" element={<Banks />} />
                    <Route path="/patterns" element={<PatternsDemo />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    )
}

export default AppRoutes
