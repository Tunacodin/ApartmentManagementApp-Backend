using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IAdminService
    {
        // Temel CRUD işlemleri
        Task<ApiResponse<AdminDto>> AddAsync(AdminDto adminDto);
        Task<ApiResponse<AdminDto>> UpdateAsync(AdminDto adminDto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
        Task<ApiResponse<AdminDetailDto>> GetByIdAsync(int id);
        Task<ApiResponse<List<AdminListDto>>> GetAllAsync();

        // Dashboard ve Raporlama
        Task<ApiResponse<AdminDashboardDto>> GetDashboardAsync(int adminId);
        Task<ApiResponse<List<RecentActivityDto>>> GetRecentActivitiesAsync(int adminId, int count = 10);
        Task<ApiResponse<List<FinancialSummaryDto>>> GetFinancialSummariesAsync(int adminId);

        // Bina Yönetimi
        Task<ApiResponse<List<AdminManagedBuildingDto>>> GetManagedBuildingsAsync(int adminId);
        Task<ApiResponse<bool>> AssignBuildingAsync(int adminId, int buildingId);
        Task<ApiResponse<bool>> UnassignBuildingAsync(int adminId, int buildingId);

        // İstatistikler
        Task<ApiResponse<int>> GetTotalResidentsAsync(int adminId);
        Task<ApiResponse<int>> GetActiveComplaintsCountAsync(int adminId);
        Task<ApiResponse<int>> GetPendingPaymentsCountAsync(int adminId);
        Task<ApiResponse<int>> GetUpcomingMeetingsCountAsync(int adminId);

        // Profil Yönetimi
        Task<ApiResponse<bool>> UpdateProfileAsync(int adminId, string? profileImageUrl, string? description);
        Task<ApiResponse<bool>> UpdatePasswordAsync(int adminId, string currentPassword, string newPassword);
        Task<ApiResponse<bool>> UpdateContactInfoAsync(int adminId, string email, string phoneNumber);

        // Additional Operations
        void CreateNotification(Notification notification);
        void ScheduleMeeting(Meeting meeting);
        void AssignOwnerToApartment(int ownerId, int apartmentId);
        void AssignTenantToApartment(int tenantId, int apartmentId);
        void ApproveTenantRequest(int requestId);
        void RejectTenantRequest(int requestId, string reason);

        // Yeni dashboard metodları
        Task<ApiResponse<EnhancedDashboardDto>> GetEnhancedDashboardAsync(int adminId, DashboardFilterDto filter);
        Task<ApiResponse<DashboardSummaryDto>> GetDashboardSummaryAsync(int adminId);
        Task<ApiResponse<FinancialOverviewDto>> GetFinancialOverviewAsync(int adminId, DashboardFilterDto filter);
        Task<ApiResponse<List<DashboardActivityDto>>> GetFilteredActivitiesAsync(int adminId, DashboardFilterDto filter);

        void DeleteTenant(int tenantId);

        // Yeni dashboard metodları
        Task<ApiResponse<int>> GetBuildingApartmentCountAsync(int buildingId);
        Task<ApiResponse<int>> GetEmptyApartmentsCountAsync(int adminId);
        Task<ApiResponse<List<ComplaintWithUserDto>>> GetLastComplaintsAsync(int adminId, int count = 5);
        Task<ApiResponse<List<PaymentWithUserDto>>> GetLastPaymentsAsync(int adminId, int count = 5);
        Task<ApiResponse<decimal>> GetMonthlyIncomeAsync(int adminId, DateTime startDate, DateTime endDate);
        Task<ApiResponse<(Building building, int complaintCount)>> GetMostComplainedBuildingAsync(int adminId);
        Task<ApiResponse<List<string>>> GetCommonComplaintsAsync(int buildingId, int count = 3);

        // Yönetim Ekranı metodu
        Task<ApiResponse<ManagementDashboardDto>> GetManagementDashboardAsync(int adminId, ManagementFilterDto filter);

        // Bina aktiviteleri için yeni metodlar
        Task<ApiResponse<List<PaymentWithUserDto>>> GetLastPaymentsByBuildingAsync(int buildingId, int count = 10);
        Task<ApiResponse<List<ComplaintWithUserDto>>> GetLastComplaintsByBuildingAsync(int buildingId, int count = 10);
        Task<ApiResponse<List<SurveyDto>>> GetLastSurveysByBuildingAsync(int buildingId, int count = 10);
        Task<ApiResponse<List<MeetingDto>>> GetLastMeetingsByBuildingAsync(int buildingId, int count = 10);
    }
}
