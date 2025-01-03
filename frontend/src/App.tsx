import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Stats } from './components/Stats'
import { Explorer } from './components/Explorer'
import './App.css'

const queryClient = new QueryClient()

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="app">
                    <nav className="nav-header">
                        <Link to="/">Stats</Link>
                        <Link to="/explorer">Explorer</Link>
                    </nav>

                    <div className="content">
                        <Routes>
                            <Route path="/" element={<Stats />} />
                            <Route path="/explorer" element={<Explorer />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    )
}
