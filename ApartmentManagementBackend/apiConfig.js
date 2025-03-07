import { API_BASE_URL } from '@env';

const apiConfig = {
  admin: {
    getAll: `${API_BASE_URL}/admin`,
    getById: (id) => `${API_BASE_URL}/admin/${id}`,
    initializeFirstAdmin: `${API_BASE_URL}/admin/initialize`,
    add: `${API_BASE_URL}/admin`,
    update: (id) => `${API_BASE_URL}/admin/${id}`,
    delete: (id) => `${API_BASE_URL}/admin/${id}`,
    getDashboard: (adminId) => `${API_BASE_URL}/admin/dashboard/${adminId}`,
    getManagedBuildings: (adminId) => `${API_BASE_URL}/admin/${adminId}/buildings`,
    assignBuilding: (adminId, buildingId) => `${API_BASE_URL}/admin/${adminId}/buildings/${buildingId}/assign`,
    unassignBuilding: (adminId, buildingId) => `${API_BASE_URL}/admin/${adminId}/buildings/${buildingId}/unassign`,
    getRecentActivities: (adminId) => `${API_BASE_URL}/admin/${adminId}/activities`,
    getFinancialSummaries: (adminId) => `${API_BASE_URL}/admin/${adminId}/financial-summaries`,
    updateProfile: (adminId) => `${API_BASE_URL}/admin/${adminId}/profile`,
    updatePassword: (adminId) => `${API_BASE_URL}/admin/${adminId}/password`,
    updateContact: (adminId) => `${API_BASE_URL}/admin/${adminId}/contact`,
    getStatistics: (adminId) => `${API_BASE_URL}/admin/${adminId}/statistics`,
    createNotification: `${API_BASE_URL}/admin/notifications`,
    scheduleMeeting: `${API_BASE_URL}/admin/meetings`,
    assignOwner: (apartmentId, ownerId) => `${API_BASE_URL}/admin/apartments/${apartmentId}/owner/${ownerId}`,
    assignTenant: (apartmentId, tenantId) => `${API_BASE_URL}/admin/apartments/${apartmentId}/tenant/${tenantId}`,
    approveTenantRequest: (requestId) => `${API_BASE_URL}/admin/tenant-requests/${requestId}/approve`,
    rejectTenantRequest: (requestId) => `${API_BASE_URL}/admin/tenant-requests/${requestId}/reject`,
  },

  adminReports: {
    getMonthlyIncome: (adminId) => `${API_BASE_URL}/adminreports/monthly-income/${adminId}`,
    getPaymentStatistics: (adminId) => `${API_BASE_URL}/adminreports/payment-statistics/${adminId}`,
    getComplaintAnalytics: (adminId) => `${API_BASE_URL}/adminreports/${adminId}/reports/complaints`,
    getOccupancyRates: (adminId) => `${API_BASE_URL}/adminreports/${adminId}/reports/occupancy`,
    getMeetingStatistics: (adminId) => `${API_BASE_URL}/adminreports/${adminId}/reports/meetings`,
    getDetailedPaymentStatistics: (adminId) => `${API_BASE_URL}/adminreports/detailed-payment-statistics/${adminId}`,
  },

  apartment: {
    getAll: `${API_BASE_URL}/apartment`,
    getById: (id) => `${API_BASE_URL}/apartment/${id}`,
    getByBuildingId: (buildingId) => `${API_BASE_URL}/apartment/building/${buildingId}`,
    getByOwnerId: (ownerId) => `${API_BASE_URL}/apartment/owner/${ownerId}`,
    add: `${API_BASE_URL}/apartment`,
    update: (id) => `${API_BASE_URL}/apartment/${id}`,
    delete: (id) => `${API_BASE_URL}/apartment/${id}`,
  },

  building: {
    getAll: `${API_BASE_URL}/buildings`,
    getById: (id) => `${API_BASE_URL}/buildings/${id}`,
    add: `${API_BASE_URL}/buildings`,
    update: (id) => `${API_BASE_URL}/buildings/${id}`,
    delete: (id) => `${API_BASE_URL}/buildings/${id}`,
  },

  cardInfo: {
    getAllByUserId: (userId) => `${API_BASE_URL}/cardinfo/user/${userId}`,
    getById: (id) => `${API_BASE_URL}/cardinfo/${id}`,
    add: `${API_BASE_URL}/cardinfo/add`,
    delete: (id) => `${API_BASE_URL}/cardinfo/${id}`,
  },

  complaint: {
    getBuildingComplaints: (buildingId) => `${API_BASE_URL}/complaint/building/${buildingId}`,
    getById: (id) => `${API_BASE_URL}/complaint/${id}`,
    getUserComplaints: (userId) => `${API_BASE_URL}/complaint/user/${userId}`,
    create: `${API_BASE_URL}/complaint`,
    resolve: (id, adminId) => `${API_BASE_URL}/complaint/${id}/resolve?adminId=${adminId}`,
    delete: (id) => `${API_BASE_URL}/complaint/${id}`,
    getActiveComplaintsCount: (buildingId) => `${API_BASE_URL}/complaint/building/${buildingId}/active/count`,
  },

  contract: {
    getContractSummary: (id) => `${API_BASE_URL}/contract/${id}/summary`,
    getExpiringContracts: `${API_BASE_URL}/contract/expiring`,
  },

  meeting: {
    getBuildingMeetings: (buildingId) => `${API_BASE_URL}/meeting/building/${buildingId}`,
    getById: (id) => `${API_BASE_URL}/meeting/${id}`,
    getUpcomingMeetings: (buildingId) => `${API_BASE_URL}/meeting/building/${buildingId}/upcoming`,
    create: `${API_BASE_URL}/meeting`,
    cancel: (id) => `${API_BASE_URL}/meeting/${id}/cancel`,
    delete: (id) => `${API_BASE_URL}/meeting/${id}`,
    getUpcomingMeetingsCount: (buildingId) => `${API_BASE_URL}/meeting/building/${buildingId}/upcoming/count`,
  },

  notification: {
    getUserNotifications: (userId, page = 1, pageSize = 10) => 
      `${API_BASE_URL}/notification/user/${userId}?page=${page}&pageSize=${pageSize}`,
    getUnreadNotifications: (userId) => `${API_BASE_URL}/notification/user/${userId}/unread`,
    getUnreadCount: (userId) => `${API_BASE_URL}/notification/user/${userId}/unread/count`,
    markAsRead: (notificationId) => `${API_BASE_URL}/notification/${notificationId}/read`,
    markAllAsRead: (userId) => `${API_BASE_URL}/notification/user/${userId}/read-all`,
    create: `${API_BASE_URL}/notification`,
    delete: (id) => `${API_BASE_URL}/notification/${id}`,
  },

  survey: {
    getBuildingSurveys: (buildingId) => `${API_BASE_URL}/survey/building/${buildingId}`,
    getById: (id) => `${API_BASE_URL}/survey/${id}`,
    getActiveSurveys: (buildingId) => `${API_BASE_URL}/survey/building/${buildingId}/active`,
    getStatistics: (id) => `${API_BASE_URL}/survey/${id}/statistics`,
    submitResponse: `${API_BASE_URL}/survey/submit`,
    getUserSurveys: (userId) => `${API_BASE_URL}/survey/user/${userId}`,
    create: `${API_BASE_URL}/survey`,
    update: `${API_BASE_URL}/survey`,
    delete: (id) => `${API_BASE_URL}/survey/${id}`,
  },

  tenant: {
    getAll: `${API_BASE_URL}/tenant`,
    getById: (id) => `${API_BASE_URL}/tenant/${id}`,
    getTenantPayments: (id) => `${API_BASE_URL}/tenant/${id}/payments`,
    getTenantWithPayments: (id) => `${API_BASE_URL}/tenant/${id}/with-payments`,
    add: `${API_BASE_URL}/tenant`,
    update: (id) => `${API_BASE_URL}/tenant/${id}`,
    delete: (id) => `${API_BASE_URL}/tenant/${id}`,
  },

  user: {
    login: `${API_BASE_URL}/user/login`,
    getAll: `${API_BASE_URL}/user`,
    getById: (id) => `${API_BASE_URL}/user/${id}`,
    add: `${API_BASE_URL}/user`,
    update: (id) => `${API_BASE_URL}/user/${id}`,
    delete: (id) => `${API_BASE_URL}/user/${id}`,
  },

  userProfile: {
    getProfile: (userId) => `${API_BASE_URL}/userprofile/${userId}`,
    updateProfileImage: (userId) => `${API_BASE_URL}/userprofile/${userId}/profile-image`,
    removeProfileImage: (userId) => `${API_BASE_URL}/userprofile/${userId}/profile-image`,
    updateDescription: (userId) => `${API_BASE_URL}/userprofile/${userId}/description`,
    updateDisplayName: (userId) => `${API_BASE_URL}/userprofile/${userId}/display-name`,
    updateProfile: (userId) => `${API_BASE_URL}/userprofile/${userId}`,
  },
};

export default apiConfig;

// Fetch kullanarak login örneği
const login = async (email, password) => {
  try {
    const response = await fetch(apiConfig.user.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Axios kullanarak bildirim alma örneği
const getUserNotifications = async (userId, page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(apiConfig.notification.getUserNotifications(userId, page, pageSize));
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
