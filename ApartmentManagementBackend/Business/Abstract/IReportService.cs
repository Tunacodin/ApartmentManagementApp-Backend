using Core.Utilities.Results;
using Entities.DTOs.Reports;

namespace Business.Abstract
{
    public interface IReportService
    {
        Task<ApiResponse<AdminReportDto>> GetAdminReportAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<BuildingReportSummaryDto>> GetBuildingSummaryAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<List<SurveyReportDto>>> GetRecentSurveysAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<List<ComplaintReportDto>>> GetRecentComplaintsAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<List<TenantReportDto>>> GetRecentTenantsAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<List<TenantReportDto>>> GetExpiringContractsAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<List<NotificationReportDto>>> GetRecentNotificationsAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<List<MeetingReportDto>>> GetRecentMeetingsAsync(int adminId, int? buildingId = null);
        Task<ApiResponse<FinancialReportDto>> GetFinancialSummaryAsync(int adminId, int? buildingId = null);
    }
}