import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stats } from './components/Stats'
import './App.css'

const queryClient = new QueryClient()

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="app">
                <div className="content">
                    <header className="page-header">
                        <h1>YouTube Watch History Analysis</h1>
                    </header>
                    <Stats />
                </div>
            </div>
        </QueryClientProvider>
    )
}
