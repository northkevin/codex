import { FallbackProps } from 'react-error-boundary'
import './ErrorFallback.css'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div role="alert" className="error-fallback">
            <h2>Something went wrong</h2>
            <pre className="error-message">{error.message}</pre>
            <button onClick={resetErrorBoundary} className="retry-button">
                Try again
            </button>
        </div>
    )
}
