using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.DTOs.Reports;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class ReportManager : IReportService
    {
        private readonly IReportDal _reportDal;
        private readonly ILogger<ReportManager> _logger;

        public ReportManager(IReportDal reportDal, ILogger<ReportManager> logger)
        {
            _reportDal = reportDal;
            _logger = logger;
        }

        public async Task<ApiResponse<AdminReportDto>> GetAdminReportAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var report = await _reportDal.GetAdminReportAsync(adminId, buildingId);
                return ApiResponse<AdminReportDto>.SuccessResult(Messages.ReportGenerated, report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating admin report for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<AdminReportDto>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<BuildingReportSummaryDto>> GetBuildingSummaryAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var summary = await _reportDal.GetBuildingSummaryAsync(adminId, buildingId);
                return ApiResponse<BuildingReportSummaryDto>.SuccessResult(Messages.ReportGenerated, summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating building summary for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<BuildingReportSummaryDto>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<List<SurveyReportDto>>> GetRecentSurveysAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var surveys = await _reportDal.GetRecentSurveysAsync(adminId, buildingId);
                return ApiResponse<List<SurveyReportDto>>.SuccessResult(Messages.ReportGenerated, surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent surveys for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<List<SurveyReportDto>>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<List<ComplaintReportDto>>> GetRecentComplaintsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var complaints = await _reportDal.GetRecentComplaintsAsync(adminId, buildingId);
                return ApiResponse<List<ComplaintReportDto>>.SuccessResult(Messages.ReportGenerated, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent complaints for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<List<ComplaintReportDto>>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<List<TenantReportDto>>> GetRecentTenantsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var tenants = await _reportDal.GetRecentTenantsAsync(adminId, buildingId);
                return ApiResponse<List<TenantReportDto>>.SuccessResult(Messages.ReportGenerated, tenants);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent tenants for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<List<TenantReportDto>>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<List<TenantReportDto>>> GetExpiringContractsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var contracts = await _reportDal.GetExpiringContractsAsync(adminId, buildingId);
                return ApiResponse<List<TenantReportDto>>.SuccessResult(Messages.ReportGenerated, contracts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expiring contracts for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<List<TenantReportDto>>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<List<NotificationReportDto>>> GetRecentNotificationsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var notifications = await _reportDal.GetRecentNotificationsAsync(adminId, buildingId);
                return ApiResponse<List<NotificationReportDto>>.SuccessResult(Messages.ReportGenerated, notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent notifications for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<List<NotificationReportDto>>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<List<MeetingReportDto>>> GetRecentMeetingsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var meetings = await _reportDal.GetRecentMeetingsAsync(adminId, buildingId);
                return ApiResponse<List<MeetingReportDto>>.SuccessResult(Messages.ReportGenerated, meetings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent meetings for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<List<MeetingReportDto>>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }

        public async Task<ApiResponse<FinancialReportDto>> GetFinancialSummaryAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var summary = await _reportDal.GetFinancialSummaryAsync(adminId, buildingId);
                return ApiResponse<FinancialReportDto>.SuccessResult(Messages.ReportGenerated, summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial summary for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return ApiResponse<FinancialReportDto>.ErrorResult(Messages.ErrorGeneratingReport);
            }
        }
    }
}