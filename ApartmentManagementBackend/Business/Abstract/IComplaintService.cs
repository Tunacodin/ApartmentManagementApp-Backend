using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface IComplaintService
    {
        Task<ApiResponse<List<ComplaintDetailDto>>> GetBuildingComplaintsAsync(int buildingId);
        Task<ApiResponse<ComplaintDetailDto>> GetComplaintDetailAsync(int complaintId);
        Task<ApiResponse<ComplaintDetailDto>> GetComplaintDetailByIdAsync(int complaintId);
        Task<ApiResponse<List<ComplaintDetailDto>>> GetUserComplaintsAsync(int userId);
        Task<ApiResponse<List<ComplaintDetailDto>>> GetUserComplaintsByBuildingIdAsync(int buildingId, int userId);
        Task<ApiResponse<Complaint>> CreateComplaintAsync(Complaint complaint);
        Task<ApiResponse<bool>> ProcessComplaintAsync(int complaintId, int adminId);
        Task<ApiResponse<bool>> ResolveComplaintAsync(int complaintId, int adminId, string solution);
        Task<ApiResponse<bool>> RejectComplaintAsync(int complaintId, int adminId, string reason);
        Task<ApiResponse<bool>> DeleteComplaintAsync(int complaintId);
        Task<ApiResponse<int>> GetActiveComplaintsCountAsync(int buildingId);
        Task<ApiResponse<List<ComplaintDetailDto>>> GetPendingComplaintsAsync(int buildingId);
        Task<ApiResponse<List<ComplaintDetailDto>>> GetComplaintsByAdminIdAsync(int adminId);
        List<ComplaintDto> GetComplaintsByTenantId(int tenantId);
        ComplaintDto GetById(int id);
        void Add(ComplaintDto complaint);
        void Update(ComplaintDto complaint);
        void Delete(int id);
    }
}