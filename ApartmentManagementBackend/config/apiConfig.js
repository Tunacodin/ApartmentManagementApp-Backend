const API_BASE_URL = 'http://192.168.1.105:5000/api';

export const ADMIN_ENDPOINTS = {
    // Dashboard verileri
    GET_DASHBOARD: (adminId) => `${API_BASE_URL}/admin/dashboard/${adminId}`,
    GET_STATISTICS: (adminId) => `${API_BASE_URL}/admin/${adminId}/statistics`,
    GET_RECENT_ACTIVITIES: (adminId) => `${API_BASE_URL}/admin/${adminId}/activities`,
    GET_FINANCIAL_SUMMARIES: (adminId) => `${API_BASE_URL}/admin/${adminId}/financial-summaries`,
    GET_MANAGED_BUILDINGS: (adminId) => `${API_BASE_URL}/admin/${adminId}/buildings`,

    // Reports endpoints
    GET_MONTHLY_INCOME: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/monthly-income`,
    GET_PAYMENT_STATISTICS: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/payment-stats`,
    GET_COMPLAINT_ANALYTICS: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/complaints`,
    GET_OCCUPANCY_RATES: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/occupancy`,
    GET_MEETING_STATISTICS: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/meetings`,
    
    // Settings endpoints
    UPDATE_PROFILE: (adminId) => `${API_BASE_URL}/admin/${adminId}/profile`,
    UPDATE_PASSWORD: (adminId) => `${API_BASE_URL}/admin/${adminId}/password`,
    UPDATE_CONTACT: (adminId) => `${API_BASE_URL}/admin/${adminId}/contact`,
};

export const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
}); 