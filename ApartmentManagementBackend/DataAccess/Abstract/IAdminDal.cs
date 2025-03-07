using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;

namespace DataAccess.Abstract
{
    public interface IAdminDal : IEntityRepository<Admin>
    {
        Task<int> GetTotalResidentsCount(int adminId);
        Task<List<Building>> GetManagedBuildings(int adminId);
        Task<int> GetBuildingApartmentCount(int buildingId);
        Task<int> GetOccupiedApartmentCount(int buildingId);
        Task<decimal> GetTotalMonthlyIncome(int adminId);
        Task<List<Payment>> GetRecentPayments(int adminId, int count = 10);
        Task<List<Complaint>> GetActiveComplaints(int adminId);
        Task<List<Meeting>> GetUpcomingMeetings(int adminId);
        Task<List<int>> GetBuildingTenants(int buildingId);
        Task<List<Complaint>> GetComplaintsByDateRange(int adminId, DateTime startDate, DateTime endDate);
        Task<List<Payment>> GetPaymentsByDateRange(int adminId, DateTime startDate, DateTime endDate);
        Task<List<Meeting>> GetMeetingsByDateRange(int adminId, DateTime startDate, DateTime endDate);
        Task<int> GetEmptyApartmentsCount(int adminId);
        Task<List<PaymentWithUserDto>> GetLastPayments(int adminId, int count = 5);
        Task<List<ComplaintWithUserDto>> GetLastComplaints(int adminId, int count = 5);
        Task<decimal> GetMonthlyIncome(int adminId, DateTime startDate, DateTime endDate);
        Task<(Building building, int complaintCount)> GetMostComplainedBuilding(int adminId);
        Task<List<string>> GetCommonComplaints(int buildingId, int count = 3);
    }
}