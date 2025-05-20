// Base URL'i tanımla
export const API_BASE_URL = "https://c740-176-240-142-80.ngrok-free.app/api";

// Endpoint'leri kategorilere ayırarak tanımla
export const API_ENDPOINTS = {
    // Admin endpoints
    ADMIN: {
        BASE: `${API_BASE_URL}/Admin`,
        GET_ALL: `${API_BASE_URL}/Admin`,
        CREATE: `${API_BASE_URL}/Admin`,
        DETAIL: (adminId) => `${API_BASE_URL}/Admin/${adminId}`,
        UPDATE: (adminId) => `${API_BASE_URL}/Admin/${adminId}`,
        DELETE: (adminId) => `${API_BASE_URL}/Admin/${adminId}`,
        DASHBOARD: (adminId) => `${API_BASE_URL}/Admin/dashboard/${adminId}`,
        BUILDINGS: (adminId) => `${API_BASE_URL}/Admin/${adminId}/buildings`,
        ASSIGN_BUILDING: (adminId, buildingId) => `${API_BASE_URL}/Admin/${adminId}/buildings/${buildingId}/assign`,
        UNASSIGN_BUILDING: (adminId, buildingId) => `${API_BASE_URL}/Admin/${adminId}/buildings/${buildingId}/unassign`,
        ACTIVITIES: (adminId) => `${API_BASE_URL}/Admin/${adminId}/activities`,
        FINANCIAL_SUMMARIES: (adminId) => `${API_BASE_URL}/Admin/${adminId}/financial-summaries`,
        UPDATE_PROFILE: (adminId) => `${API_BASE_URL}/Admin/${adminId}/profile`,
        UPDATE_PASSWORD: (adminId) => `${API_BASE_URL}/Admin/${adminId}/password`,
        UPDATE_CONTACT: (adminId) => `${API_BASE_URL}/Admin/${adminId}/contact`,
        STATISTICS: (adminId) => `${API_BASE_URL}/Admin/${adminId}/statistics`,
        NOTIFICATIONS: `${API_BASE_URL}/Admin/notifications`,
        MEETINGS: `${API_BASE_URL}/Admin/meetings`,
        ASSIGN_OWNER: (apartmentId, ownerId) => `${API_BASE_URL}/Admin/apartments/${apartmentId}/owner/${ownerId}`,
        ASSIGN_TENANT: (apartmentId, tenantId) => `${API_BASE_URL}/Admin/apartments/${apartmentId}/tenant/${tenantId}`,
        APPROVE_TENANT_REQUEST: (requestId) => `${API_BASE_URL}/Admin/tenant-requests/${requestId}/approve`,
        REJECT_TENANT_REQUEST: (requestId) => `${API_BASE_URL}/Admin/tenant-requests/${requestId}/reject`
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
        LOGIN: `${API_BASE_URL}/User/login`,
        GET_ALL: `${API_BASE_URL}/User`,
        CREATE: `${API_BASE_URL}/User`,
        DETAIL: (userId) => `${API_BASE_URL}/User/${userId}`,
        UPDATE: (userId) => `${API_BASE_URL}/User/${userId}`,
        DELETE: (userId) => `${API_BASE_URL}/User/${userId}`
    },

    // UserProfile endpoints
    USER_PROFILE: {
        DETAIL: (userId) => `${API_BASE_URL}/UserProfile/${userId}`,
        UPDATE: (userId) => `${API_BASE_URL}/UserProfile/${userId}`,
        UPDATE_PROFILE_IMAGE: (userId) => `${API_BASE_URL}/UserProfile/${userId}/profile-image`,
        DELETE_PROFILE_IMAGE: (userId) => `${API_BASE_URL}/UserProfile/${userId}/profile-image`,
        UPDATE_DESCRIPTION: (userId) => `${API_BASE_URL}/UserProfile/${userId}/description`,
        UPDATE_DISPLAY_NAME: (userId) => `${API_BASE_URL}/UserProfile/${userId}/display-name`
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
    },

    // Survey endpoints
    SURVEY: {
        BASE: `${API_BASE_URL}/Survey`,
        DETAIL: (id) => `${API_BASE_URL}/Survey/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Survey/building/${buildingId}`,
        ACTIVE: (buildingId) => `${API_BASE_URL}/Survey/building/${buildingId}/active`,
        STATISTICS: (id) => `${API_BASE_URL}/Survey/${id}/statistics`,
        SUBMIT: `${API_BASE_URL}/Survey/submit`,
        BY_USER: (userId) => `${API_BASE_URL}/Survey/user/${userId}`
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