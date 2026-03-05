import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bloom-50">
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-bloom-200 border-t-bloom-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-bloom-600 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}
