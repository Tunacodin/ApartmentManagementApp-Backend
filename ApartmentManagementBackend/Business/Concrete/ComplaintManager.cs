using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

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

        public async Task<ApiResponse<bool>> ProcessComplaintAsync(int complaintId, int adminId)
        {
            try
            {
                var complaint = await _complaintDal.GetByIdAsync(complaintId);
                if (complaint == null)
                    return ApiResponse<bool>.ErrorResult("Şikayet bulunamadı");

                complaint.Status = (int)ComplaintStatus.InProgress;
                complaint.ResolvedByAdminId = adminId;
                await _complaintDal.UpdateAsync(complaint);

                return ApiResponse<bool>.SuccessResult("Şikayet işleme alındı", true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing complaint");
                return ApiResponse<bool>.ErrorResult("Şikayet işleme alınırken hata oluştu");
            }
        }

        public async Task<ApiResponse<bool>> ResolveComplaintAsync(int complaintId, int adminId, string solution)
        {
            try
            {
                var complaint = await _complaintDal.GetByIdAsync(complaintId);
                if (complaint == null)
                    return ApiResponse<bool>.ErrorResult("Şikayet bulunamadı");

                complaint.Status = (int)ComplaintStatus.Resolved;
                complaint.ResolvedByAdminId = adminId;
                complaint.ResolvedAt = DateTime.Now;
                await _complaintDal.UpdateAsync(complaint);

                return ApiResponse<bool>.SuccessResult("Şikayet çözüldü", true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving complaint");
                return ApiResponse<bool>.ErrorResult("Şikayet çözülürken hata oluştu");
            }
        }

        public async Task<ApiResponse<bool>> RejectComplaintAsync(int complaintId, int adminId, string reason)
        {
            try
            {
                var complaint = await _complaintDal.GetByIdAsync(complaintId);
                if (complaint == null)
                    return ApiResponse<bool>.ErrorResult("Şikayet bulunamadı");

                complaint.Status = (int)ComplaintStatus.Rejected;
                complaint.ResolvedByAdminId = adminId;
                complaint.ResolvedAt = DateTime.Now;
                complaint.Description += $"\n\nRed Sebebi: {reason}";
                await _complaintDal.UpdateAsync(complaint);

                return ApiResponse<bool>.SuccessResult("Şikayet reddedildi", true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting complaint");
                return ApiResponse<bool>.ErrorResult("Şikayet reddedilirken hata oluştu");
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

        public async Task<ApiResponse<List<ComplaintDetailDto>>> GetPendingComplaintsAsync(int buildingId)
        {
            try
            {
                var complaints = await _complaintDal.GetPendingComplaintsAsync(buildingId);
                if (complaints == null)
                {
                    return ApiResponse<List<ComplaintDetailDto>>.ErrorResult(Messages.ComplaintsNotFound);
                }

                return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending complaints for building {BuildingId}", buildingId);
                return ApiResponse<List<ComplaintDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<ComplaintDetailDto>>> GetComplaintsByAdminIdAsync(int adminId)
        {
            try
            {
                _logger.LogInformation("Getting complaints for admin {AdminId}", adminId);

                var complaints = await _complaintDal.GetComplaintsByAdminIdAsync(adminId);
                if (complaints == null || !complaints.Any())
                {
                    _logger.LogWarning("No complaints found for admin {AdminId}", adminId);
                    return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, new List<ComplaintDetailDto>());
                }

                _logger.LogInformation("Retrieved {Count} complaints for admin {AdminId}", complaints.Count, adminId);
                return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints for admin {AdminId}", adminId);
                return ApiResponse<List<ComplaintDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public List<ComplaintDto> GetComplaintsByTenantId(int tenantId)
        {
            try
            {
                var complaints = _complaintDal.GetAll(c => c.UserId == tenantId);
                return complaints.Select(c => new ComplaintDto
                {
                    Id = c.Id,
                    Title = c.Subject,
                    Description = c.Description,
                    CreatedAt = c.CreatedAt,
                    Status = (int)(c.Status ?? (int)ComplaintStatus.Open),
                    BuildingId = c.BuildingId,
                    TenantId = c.UserId,
                    IsResolved = c.Status == (int)ComplaintStatus.Resolved,
                    IsInProgress = c.Status == (int)ComplaintStatus.InProgress,
                    ResolvedByAdminId = c.ResolvedByAdminId,
                    ResolvedAt = c.ResolvedAt,
                    CreatedByName = c.CreatedByName
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints by tenant ID");
                return new List<ComplaintDto>();
            }
        }

        public ComplaintDto GetById(int id)
        {
            try
            {
                var complaint = _complaintDal.Get(c => c.Id == id);
                if (complaint == null)
                    return null;

                return new ComplaintDto
                {
                    Id = complaint.Id,
                    Title = complaint.Subject,
                    Description = complaint.Description,
                    Status = (int)(complaint.Status ?? (int)ComplaintStatus.Open),
                    CreatedAt = complaint.CreatedAt,
                    BuildingId = complaint.BuildingId,
                    TenantId = complaint.UserId,
                    IsResolved = complaint.Status == (int)ComplaintStatus.Resolved,
                    IsInProgress = complaint.Status == (int)ComplaintStatus.InProgress,
                    ResolvedByAdminId = complaint.ResolvedByAdminId,
                    ResolvedAt = complaint.ResolvedAt,
                    CreatedByName = complaint.CreatedByName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint by ID");
                return null;
            }
        }

        public void Add(ComplaintDto complaint)
        {
            try
            {
                var newComplaint = new Complaint
                {
                    UserId = complaint.TenantId,
                    BuildingId = complaint.BuildingId,
                    Subject = complaint.Title,
                    Description = complaint.Description,
                    CreatedAt = DateTime.Now,
                    Status = complaint.Status,
                    CreatedByName = complaint.CreatedByName
                };

                _complaintDal.Add(newComplaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding complaint");
                throw;
            }
        }

        public void Update(ComplaintDto complaint)
        {
            try
            {
                var existingComplaint = _complaintDal.Get(c => c.Id == complaint.Id);
                if (existingComplaint == null)
                    throw new KeyNotFoundException($"Complaint with ID {complaint.Id} not found");

                existingComplaint.Subject = complaint.Title;
                existingComplaint.Description = complaint.Description;
                existingComplaint.Status = complaint.Status;

                if (complaint.IsResolved)
                {
                    existingComplaint.ResolvedAt = DateTime.Now;
                    existingComplaint.ResolvedByAdminId = complaint.ResolvedByAdminId;
                }

                _complaintDal.Update(existingComplaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating complaint");
                throw;
            }
        }

        public void Delete(int id)
        {
            try
            {
                var complaint = _complaintDal.Get(c => c.Id == id);
                if (complaint == null)
                    throw new KeyNotFoundException($"Complaint with ID {id} not found");

                _complaintDal.Delete(complaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting complaint");
                throw;
            }
        }

        public async Task<ApiResponse<List<ComplaintDetailDto>>> GetUserComplaintsByBuildingIdAsync(int buildingId, int userId)
        {
            try
            {
                _logger.LogInformation("Getting complaints for user {UserId} in building {BuildingId}", userId, buildingId);

                if (buildingId <= 0)
                {
                    _logger.LogWarning("Invalid buildingId: {BuildingId}", buildingId);
                    return ApiResponse<List<ComplaintDetailDto>>.ErrorResult("Geçersiz bina ID'si");
                }

                if (userId <= 0)
                {
                    _logger.LogWarning("Invalid userId: {UserId}", userId);
                    return ApiResponse<List<ComplaintDetailDto>>.ErrorResult("Geçersiz kullanıcı ID'si");
                }

                var complaints = await _complaintDal.GetUserComplaintsByBuildingIdAsync(buildingId, userId);
                if (complaints == null || !complaints.Any())
                {
                    _logger.LogWarning("No complaints found for user {UserId} in building {BuildingId}", userId, buildingId);
                    return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, new List<ComplaintDetailDto>());
                }

                var complaintDtos = complaints.Select(c => new ComplaintDetailDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    BuildingId = c.BuildingId,
                    Subject = c.Subject,
                    Description = c.Description,
                    CreatedAt = c.CreatedAt,
                    Status = c.Status ?? 0,
                    ResolvedByAdminId = c.ResolvedByAdminId,
                    ResolvedAt = c.ResolvedAt,
                    CreatedByName = c.CreatedByName ?? "Bilinmeyen Kullanıcı"
                }).ToList();

                _logger.LogInformation("Retrieved {Count} complaints for user {UserId} in building {BuildingId}",
                    complaintDtos.Count, userId, buildingId);

                return ApiResponse<List<ComplaintDetailDto>>.SuccessResult(Messages.ComplaintsListed, complaintDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints for user {UserId} in building {BuildingId}", userId, buildingId);
                return ApiResponse<List<ComplaintDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<ComplaintDetailDto>> GetComplaintDetailByIdAsync(int complaintId)
        {
            try
            {
                _logger.LogInformation("Getting complaint detail for ID {ComplaintId}", complaintId);

                if (complaintId <= 0)
                {
                    _logger.LogWarning("Invalid complaintId: {ComplaintId}", complaintId);
                    return ApiResponse<ComplaintDetailDto>.ErrorResult("Geçersiz şikayet ID'si");
                }

                var complaint = await _complaintDal.GetComplaintDetailByIdAsync(complaintId);
                if (complaint == null)
                {
                    _logger.LogWarning("No complaint found with ID {ComplaintId}", complaintId);
                    return ApiResponse<ComplaintDetailDto>.ErrorResult("Şikayet bulunamadı");
                }

                return ApiResponse<ComplaintDetailDto>.SuccessResult(Messages.ComplaintRetrieved, complaint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint detail for ID {ComplaintId}", complaintId);
                return ApiResponse<ComplaintDetailDto>.ErrorResult(Messages.UnexpectedError);
            }
        }
    }
}