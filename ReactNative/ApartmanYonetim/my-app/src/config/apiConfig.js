// Base URL'i tanımla
export const API_BASE_URL = "https://d1f5-78-187-59-29.ngrok-free.app/api";

// Endpoint'leri kategorilere ayırarak tanımla
export const API_ENDPOINTS = {
    // Admin endpoints
    ADMIN: {
        BASE: `${API_BASE_URL}/Admin`,
        DASHBOARD: (adminId) => `${API_BASE_URL}/admin/dashboard/${adminId}`,
        STATISTICS: (adminId) => `${API_BASE_URL}/admin/${adminId}/statistics`,
        ACTIVITIES: (adminId) => `${API_BASE_URL}/admin/${adminId}/activities`,
        FINANCIAL_SUMMARIES: (adminId) => `${API_BASE_URL}/admin/${adminId}/financial-summaries`,
        BUILDINGS: (adminId) => `${API_BASE_URL}/admin/${adminId}/buildings`,
        UPDATE_PROFILE: (adminId) => `${API_BASE_URL}/admin/${adminId}/profile`,
        UPDATE_PASSWORD: (adminId) => `${API_BASE_URL}/admin/${adminId}/password`,
        UPDATE_CONTACT: (adminId) => `${API_BASE_URL}/admin/${adminId}/contact`,
        
        // Reports
        REPORTS: {
            PAYMENT_STATS: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/payment-stats`,
            COMPLAINTS: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/complaints`,
            OCCUPANCY: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/occupancy`,
            MEETINGS: (adminId) => `${API_BASE_URL}/admin/${adminId}/reports/meetings`
        }
    },

    // Building endpoints
    BUILDING: {
        BASE: `${API_BASE_URL}/Buildings`,
        DETAIL: (id) => `${API_BASE_URL}/Buildings/${id}`,
    },

    // Apartment endpoints
    APARTMENT: {
        BASE: `${API_BASE_URL}/Apartment`,
        DETAIL: (id) => `${API_BASE_URL}/Apartment/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Apartment/building/${buildingId}`,
        BY_OWNER: (ownerId) => `${API_BASE_URL}/Apartment/owner/${ownerId}`
    },

    // Meeting endpoints
    MEETING: {
        BASE: `${API_BASE_URL}/Meeting`,
        DETAIL: (id) => `${API_BASE_URL}/Meeting/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}`,
        UPCOMING: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}/upcoming`,
        CANCEL: (id) => `${API_BASE_URL}/Meeting/${id}/cancel`,
        UPCOMING_COUNT: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}/upcoming/count`
    },

    // Notification endpoints
    NOTIFICATION: {
        BASE: `${API_BASE_URL}/Notification`,
        BY_USER: (userId) => `${API_BASE_URL}/Notification/user/${userId}`,
        UNREAD: (userId) => `${API_BASE_URL}/Notification/user/${userId}/unread`,
        UNREAD_COUNT: (userId) => `${API_BASE_URL}/Notification/user/${userId}/unread/count`,
        MARK_READ: (notificationId) => `${API_BASE_URL}/Notification/${notificationId}/read`,
        READ_ALL: (userId) => `${API_BASE_URL}/Notification/user/${userId}/read-all`
    },

    // Complaint endpoints
    COMPLAINT: {
        BASE: `${API_BASE_URL}/Complaint`,
        DETAIL: (id) => `${API_BASE_URL}/Complaint/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Complaint/building/${buildingId}`,
        BY_USER: (userId) => `${API_BASE_URL}/Complaint/user/${userId}`,
        RESOLVE: (id) => `${API_BASE_URL}/Complaint/${id}/resolve`,
        ACTIVE_COUNT: (buildingId) => `${API_BASE_URL}/Complaint/building/${buildingId}/active/count`
    },

    // User endpoints
    USER: {
        BASE: `${API_BASE_URL}/User`,
        DETAIL: (id) => `${API_BASE_URL}/User/${id}`
    },

    // Tenant endpoints
    TENANT: {
        BASE: `${API_BASE_URL}/Tenant`,
        DETAIL: (id) => `${API_BASE_URL}/Tenant/${id}`
    },

    // Card Info endpoints
    CARD_INFO: {
        BASE: `${API_BASE_URL}/CardInfo`,
        DETAIL: (id) => `${API_BASE_URL}/CardInfo/${id}`,
        ADD: `${API_BASE_URL}/CardInfo/add`,
        BY_USER: (userId) => `${API_BASE_URL}/CardInfo/user/${userId}`
    }
};

// API_ENDPOINTS tanımlandıktan sonra
console.log('\n=== API Endpoints Yapılandırması ===');
console.log('ADMIN.REPORTS:', API_ENDPOINTS.ADMIN.REPORTS);

// Axios config
export const axiosConfig = {
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Auth token yönetimi için helper fonksiyonlar
export const setAuthToken = (token) => {
    if (token) {
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosConfig.headers['Authorization'];
    }
};

// Error handling için helper fonksiyonlar
export const handleApiError = (error) => {
    if (error.response) {
        // Sunucudan gelen hata yanıtı
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
        return {
            status: error.response.status,
            message: error.response.data.message || 'Bir hata oluştu',
            data: error.response.data
        };
    } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error('API Request Error:', error.request);
        return {
            status: 0,
            message: 'Sunucuya ulaşılamıyor',
            data: null
        };
    } else {
        // İstek oluşturulurken hata oluştu
        console.error('API Error:', error.message);
        return {
            status: 0,
            message: 'İstek oluşturulamadı',
            data: null
        };
    }
};

export default {
    API_BASE_URL,
    API_ENDPOINTS,
    axiosConfig,
    setAuthToken,
    handleApiError
}; 