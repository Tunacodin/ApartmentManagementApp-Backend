using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;

namespace DataAccess.Abstract
{
    public interface IComplaintDal : IEntityRepository<Complaint>
    {
        Task<List<ComplaintDetailDto>> GetComplaintDetailsAsync(int buildingId);
        Task<ComplaintDetailDto> GetComplaintDetailByIdAsync(int complaintId);
        Task<List<ComplaintDetailDto>> GetUserComplaintsAsync(int userId);
        Task<int> GetActiveComplaintsCountAsync(int buildingId);
        Task<ComplaintAnalyticsDto> GetComplaintAnalyticsAsync(int adminId);
    }
} 