import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Suspense } from 'react'
import { Stats } from './components/Stats'
import { Explorer } from './components/Explorer'
import { Analytics } from './components/Analytics'
import { ContentInsights } from './components/ContentInsights'
import './App.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
        },
    },
})

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="app">
                    <nav className="nav-header">
                        <Link to="/">Stats</Link>
                        <Link to="/explorer">Explorer</Link>
                        <Link to="/analytics">Analytics</Link>
                        <Link to="/insights">Content Insights</Link>
                    </nav>

                    <div className="content">
                        <Suspense fallback={<div className="loading">Loading...</div>}>
                            <Routes>
                                <Route path="/" element={<Stats />} />
                                <Route path="/explorer" element={<Explorer />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/insights" element={<ContentInsights />} />
                            </Routes>
                        </Suspense>
                    </div>
                </div>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
