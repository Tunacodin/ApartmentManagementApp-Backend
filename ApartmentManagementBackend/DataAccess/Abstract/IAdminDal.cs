using Core.DataAccess;
using Entities.Concrete;

namespace DataAccess.Abstract
{
    public interface IAdminDal : IEntityRepository<Admin>
    {
        Task<Admin?> GetByIdAsync(int id);
        Task<int> GetTotalResidentsCount(int adminId);
        Task<List<Building>> GetManagedBuildings(int adminId);
        Task<int> GetBuildingApartmentCount(int buildingId);
        Task<int> GetOccupiedApartmentCount(int buildingId);
        Task<decimal> GetTotalMonthlyIncome(int adminId);
        Task<List<Payment>> GetRecentPayments(int adminId, int count = 10);
        Task<List<Complaint>> GetActiveComplaints(int adminId);
        Task<List<Meeting>> GetUpcomingMeetings(int adminId);
        Task UpdateAsync(Admin admin);
    }
}