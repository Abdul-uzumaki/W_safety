import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for existing session on mount
        const storedUser = localStorage.getItem('safeher_user')
        const storedToken = localStorage.getItem('safeher_token')

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem('safeher_user')
                localStorage.removeItem('safeher_token')
            }
        }
        setIsLoading(false)
    }, [])

    const login = (userData, token) => {
        setUser(userData)
        localStorage.setItem('safeher_user', JSON.stringify(userData))
        localStorage.setItem('safeher_token', token)
    }

    const logout = () => {
        const token = localStorage.getItem('safeher_token')
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        // Call backend logout
        if (token) {
            fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).catch(() => { })
        }

        setUser(null)
        localStorage.removeItem('safeher_user')
        localStorage.removeItem('safeher_token')
    }

    const isAuthenticated = !!user

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
