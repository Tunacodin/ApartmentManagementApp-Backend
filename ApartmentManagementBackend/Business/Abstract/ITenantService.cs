using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface ITenantService
    {
        void Add(Tenant tenant);
        void AddFromDto(TenantDto tenantDto);
        void Update(Tenant tenant);
        void UpdateFromDto(TenantDto tenantDto);
        void Delete(int id);
        Tenant? GetById(int id);
        List<TenantListDto>? GetAllTenants();
        TenantDetailDto? GetTenantById(int id);
        TenantWithPaymentsDto? GetTenantWithPayments(int id);
        List<PaymentHistoryDto>? GetTenantPayments(int id);
        List<Tenant>? GetByBuildingId(int buildingId);
        List<Tenant>? GetByUserId(int userId);
        Tenant? Get(Expression<Func<Tenant, bool>> filter);
        TenantDashboardDto GetTenantDashboard(int tenantId);
        void CreateComplaint(int tenantId, string title, string description);
        void SubmitSurveyResponse(int tenantId, int surveyId, Dictionary<int, string> responses);
        List<NotificationDto> GetTenantNotifications(int tenantId);
        List<MeetingDto> GetUpcomingMeetings(int tenantId);
        List<SurveyDto> GetActiveSurveys(int tenantId);
        List<ComplaintDto> GetRecentComplaints(int tenantId);
        List<PaymentDto> GetNextPayments(int tenantId);
        Task<PaymentResultDto> MakePayment(int tenantId, int paymentId, PaymentRequestDto paymentRequest);
        List<TenantListDto>? GetTenantsByBuilding(int buildingId);
    }
}
