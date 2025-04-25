using Entities.DTOs.Reports;

namespace DataAccess.Abstract
{
    public interface IReportDal
    {
        Task<AdminReportDto> GetAdminReportAsync(int adminId, int? buildingId = null);
        Task<BuildingReportSummaryDto> GetBuildingSummaryAsync(int adminId, int? buildingId = null);
        Task<List<SurveyReportDto>> GetRecentSurveysAsync(int adminId, int? buildingId = null);
        Task<List<ComplaintReportDto>> GetRecentComplaintsAsync(int adminId, int? buildingId = null);
        Task<List<TenantReportDto>> GetRecentTenantsAsync(int adminId, int? buildingId = null);
        Task<List<TenantReportDto>> GetExpiringContractsAsync(int adminId, int? buildingId = null);
        Task<List<NotificationReportDto>> GetRecentNotificationsAsync(int adminId, int? buildingId = null);
        Task<List<MeetingReportDto>> GetRecentMeetingsAsync(int adminId, int? buildingId = null);
        Task<FinancialReportDto> GetFinancialSummaryAsync(int adminId, int? buildingId = null);
    }
}