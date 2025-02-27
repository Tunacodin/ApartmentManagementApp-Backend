using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class ComplaintManager : IComplaintService
    {
        private readonly IComplaintDal _complaintDal;
        private readonly ILogger<ComplaintManager> _logger;

        public ComplaintManager(IComplaintDal complaintDal, ILogger<ComplaintManager> logger)
        {
            _complaintDal = complaintDal;
            _logger = logger;
        }

        public async Task<ApiResponse<List<ComplaintDetailDto>>> GetBuildingComplaintsAsync(int buildingId)
        {
            try
            {
                var complaints = await _complaintDal.GetComplaintDetailsAsync(buildingId);
                return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building complaints");
                return ApiResponse<List<ComplaintDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<ComplaintDetailDto>> GetComplaintDetailAsync(int complaintId)
        {
            try
            {
                var complaint = await _complaintDal.GetComplaintDetailByIdAsync(complaintId);
                if (complaint == null)
                    return ApiResponse<ComplaintDetailDto>.ErrorResult(Messages.ComplaintNotFound);

                return ApiResponse<ComplaintDetailDto>.SuccessResult(Messages.ComplaintRetrieved, complaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint detail");
                return ApiResponse<ComplaintDetailDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<ComplaintDetailDto>>> GetUserComplaintsAsync(int userId)
        {
            try
            {
                var complaints = await _complaintDal.GetUserComplaintsAsync(userId);
                return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user complaints");
                return ApiResponse<List<ComplaintDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Complaint>> CreateComplaintAsync(Complaint complaint)
        {
            try
            {
                complaint.CreatedAt = DateTime.Now;
                complaint.Status = 0;
                await _complaintDal.AddAsync(complaint);
                return ApiResponse<Complaint>.SuccessResult(Messages.ComplaintCreated, complaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating complaint");
                return ApiResponse<Complaint>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> ResolveComplaintAsync(int complaintId, int adminId)
        {
            try
            {
                var complaint = await _complaintDal.GetByIdAsync(complaintId);
                if (complaint == null)
                    return ApiResponse<bool>.ErrorResult(Messages.ComplaintNotFound);

                complaint.Status = 1;
                complaint.ResolvedAt = DateTime.Now;
                complaint.ResolvedByAdminId = adminId;
                await _complaintDal.UpdateAsync(complaint);

                return ApiResponse<bool>.SuccessResult(Messages.ComplaintResolved, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving complaint");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> DeleteComplaintAsync(int complaintId)
        {
            try
            {
                var complaint = await _complaintDal.GetByIdAsync(complaintId);
                if (complaint == null)
                    return ApiResponse<bool>.ErrorResult(Messages.ComplaintNotFound);

                await _complaintDal.DeleteAsync(complaint);
                return ApiResponse<bool>.SuccessResult(Messages.ComplaintDeleted, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting complaint");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<int>> GetActiveComplaintsCountAsync(int buildingId)
        {
            try
            {
                var count = await _complaintDal.GetActiveComplaintsCountAsync(buildingId);
                return ApiResponse<int>.SuccessResult(Messages.Success, count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active complaints count");
                return ApiResponse<int>.ErrorResult(Messages.UnexpectedError);
            }
        }
    }
} 