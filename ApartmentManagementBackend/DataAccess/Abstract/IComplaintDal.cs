using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DataAccess.Abstract
{
    public interface IComplaintDal : IEntityRepository<Complaint>
    {
        Task<List<ComplaintDetailDto>> GetComplaintDetailsAsync(int buildingId);
        Task<ComplaintDetailDto> GetComplaintDetailByIdAsync(int complaintId);
        Task<List<ComplaintDetailDto>> GetUserComplaintsAsync(int userId);
        Task<int> GetActiveComplaintsCountAsync(int buildingId);
        Task<ComplaintAnalyticsDto> GetComplaintAnalyticsAsync(int adminId);
        Task<List<Complaint>> GetListAsync(Expression<Func<Complaint, bool>> filter = null);
        Task<List<Complaint>> GetUserComplaintsByBuildingIdAsync(int buildingId, int userId);
        Task<List<ComplaintDetailDto>> GetPendingComplaintsAsync(int buildingId);
        Task<List<ComplaintDetailDto>> GetComplaintsByAdminIdAsync(int adminId);
    }
}