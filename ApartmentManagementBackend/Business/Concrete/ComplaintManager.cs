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
                _logger.LogInformation("Starting to get complaints for building {BuildingId}", buildingId);

                if (buildingId <= 0)
                {
                    _logger.LogWarning("Invalid buildingId: {BuildingId}", buildingId);
                    return ApiResponse<List<ComplaintDetailDto>>.ErrorResult("Geçersiz bina ID'si");
                }

                _logger.LogDebug("Calling GetComplaintDetailsAsync for building {BuildingId}", buildingId);
                var complaints = await _complaintDal.GetComplaintDetailsAsync(buildingId);

                if (complaints == null)
                {
                    _logger.LogWarning("GetComplaintDetailsAsync returned null for building {BuildingId}", buildingId);
                    return ApiResponse<List<ComplaintDetailDto>>.ErrorResult("Şikayet verileri alınamadı");
                }

                _logger.LogInformation("Retrieved {Count} complaints for building {BuildingId}", complaints.Count, buildingId);

                if (!complaints.Any())
                {
                    _logger.LogInformation("No complaints found for building {BuildingId}", buildingId);
                    return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, new List<ComplaintDetailDto>());
                }

                // Log some details about the complaints
                foreach (var complaint in complaints)
                {
                    _logger.LogDebug("Complaint {ComplaintId}: Status={Status}, UserId={UserId}, CreatedAt={CreatedAt}",
                        complaint.Id, complaint.Status, complaint.UserId, complaint.CreatedAt);
                }

                return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building complaints for buildingId: {BuildingId}. Error: {Message}, StackTrace: {StackTrace}",
                    buildingId, ex.Message, ex.StackTrace);
                return ApiResponse<List<ComplaintDetailDto>>.ErrorResult($"Şikayetler alınırken bir hata oluştu: {ex.Message}");
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
                if (complaint == null)
                {
                    _logger.LogWarning("Complaint object is null");
                    return ApiResponse<Complaint>.ErrorResult("Complaint object cannot be null");
                }

                // Set default values
                complaint.CreatedAt = DateTime.Now;
                complaint.Status = 0; // Assuming 0 is for "Open" status
                complaint.ResolvedAt = null;
                complaint.ResolvedByAdminId = null;

                // Validate required fields
                if (complaint.BuildingId <= 0)
                {
                    _logger.LogWarning($"Invalid BuildingId: {complaint.BuildingId}");
                    return ApiResponse<Complaint>.ErrorResult("Invalid BuildingId");
                }

                if (complaint.UserId <= 0)
                {
                    _logger.LogWarning($"Invalid UserId: {complaint.UserId}");
                    return ApiResponse<Complaint>.ErrorResult("Invalid UserId");
                }

                if (string.IsNullOrEmpty(complaint.Subject))
                {
                    _logger.LogWarning("Complaint subject is empty");
                    return ApiResponse<Complaint>.ErrorResult("Subject is required");
                }

                if (string.IsNullOrEmpty(complaint.Description))
                {
                    _logger.LogWarning("Complaint description is empty");
                    return ApiResponse<Complaint>.ErrorResult("Description is required");
                }

                _logger.LogInformation($"Creating complaint for Building {complaint.BuildingId} by User {complaint.UserId}");
                await _complaintDal.AddAsync(complaint);
                _logger.LogInformation($"Complaint created successfully with ID: {complaint.Id}");

                return ApiResponse<Complaint>.SuccessResult(Messages.ComplaintCreated, complaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating complaint: {Message}", ex.Message);
                return ApiResponse<Complaint>.ErrorResult($"Failed to create complaint: {ex.Message}");
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