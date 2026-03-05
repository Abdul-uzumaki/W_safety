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

/**
 * Download the report PDF from the backend.
 * @param {string} reportId - The ID of the report to download
 * @param {string} referenceId - The reference ID for the filename
 */
export const downloadReportPDF = async (reportId, referenceId) => {
    try {
        const response = await api.get(`/api/report/${reportId}/pdf`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Incident_Report_${referenceId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('PDF Download Error:', error);
        throw new Error('Failed to download the PDF report.');
    }
}
