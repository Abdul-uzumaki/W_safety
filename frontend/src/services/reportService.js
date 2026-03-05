import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
})

/**
 * Submit an incident report to the backend.
 * @param {Object} payload - form data from Report.jsx
 * @returns {Promise<{success: boolean, referenceId: string, message: string}>}
 */
export const submitReport = async (payload) => {
    const res = await api.post('/api/report', payload)
    return res.data
}
