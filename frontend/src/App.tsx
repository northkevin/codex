import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stats } from './components/Stats'

const queryClient = new QueryClient()

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="app">
                <h1>YouTube Watch History Analysis</h1>
                <Stats />
            </div>
        </QueryClientProvider>
    )
}
