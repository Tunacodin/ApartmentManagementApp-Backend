using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

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
    }
}
