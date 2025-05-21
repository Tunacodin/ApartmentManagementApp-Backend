using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class NotificationManager : INotificationService
    {
        private readonly INotificationDal _notificationDal;
        private readonly ILogger<NotificationManager> _logger;

        public NotificationManager(INotificationDal notificationDal, ILogger<NotificationManager> logger)
        {
            _notificationDal = notificationDal;
            _logger = logger;
        }

        public async Task<ApiResponse<List<Notification>>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 10)
        {
            try
            {
                var notifications = await _notificationDal.GetNotificationsByUserIdAsync(userId, page, pageSize);
                return ApiResponse<List<Notification>>.SuccessResult(Messages.NotificationsListed, notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user notifications");
                return ApiResponse<List<Notification>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<Notification>>> GetUnreadNotificationsAsync(int userId)
        {
            try
            {
                var notifications = await _notificationDal.GetUnreadNotificationsAsync(userId);
                return ApiResponse<List<Notification>>.SuccessResult(Messages.NotificationsListed, notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread notifications");
                return ApiResponse<List<Notification>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<int>> GetUnreadCountAsync(int userId)
        {
            try
            {
                var count = await _notificationDal.GetUnreadCountAsync(userId);
                return ApiResponse<int>.SuccessResult(Messages.Success, count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return ApiResponse<int>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId)
        {
            try
            {
                await _notificationDal.MarkAsReadAsync(notificationId);
                return ApiResponse<bool>.SuccessResult(Messages.NotificationMarkedAsRead, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId)
        {
            try
            {
                await _notificationDal.MarkAllAsReadAsync(userId);
                return ApiResponse<bool>.SuccessResult(Messages.AllNotificationsMarkedAsRead, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Notification>> CreateBuildingNotificationsAsync(NotificationCreateDto notificationDto)
        {
            try
            {
                Notification lastCreatedNotification = null;

                // Eğer BuildingIds listesi boşsa, tek kullanıcıya bildirim gönder
                if (notificationDto.BuildingIds == null || !notificationDto.BuildingIds.Any())
                {
                    var notification = new Notification
                    {
                        Title = notificationDto.Title,
                        Message = notificationDto.Message,
                        CreatedByAdminId = notificationDto.CreatedByAdminId,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        UserId = 0 // Tüm kullanıcılar için
                    };

                    await _notificationDal.AddAsync(notification);
                    lastCreatedNotification = notification;
                }
                else
                {
                    // Her bina için ayrı bildirim oluştur
                    foreach (var buildingId in notificationDto.BuildingIds)
                    {
                        var notification = new Notification
                        {
                            Title = notificationDto.Title,
                            Message = notificationDto.Message,
                            CreatedByAdminId = notificationDto.CreatedByAdminId,
                            CreatedAt = DateTime.Now,
                            IsRead = false,
                            UserId = 0 // Bina geneli bildirimler için UserId = 0
                        };

                        await _notificationDal.AddAsync(notification);
                        lastCreatedNotification = notification;
                    }
                }

                return ApiResponse<Notification>.SuccessResult(Messages.NotificationCreated, lastCreatedNotification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating building notifications");
                return ApiResponse<Notification>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<Notification>>> GetBuildingNotificationsAsync(int buildingId, int page = 1, int pageSize = 10)
        {
            try
            {
                var notifications = await _notificationDal.GetNotificationsByBuildingIdAsync(buildingId, page, pageSize);
                return ApiResponse<List<Notification>>.SuccessResult(Messages.NotificationsListed, notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building notifications for buildingId: {BuildingId}", buildingId);
                return ApiResponse<List<Notification>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public List<NotificationDto> GetNotificationsByUserId(int userId)
        {
            try
            {
                var notifications = _notificationDal.GetAll(n => n.UserId == userId);
                return notifications.Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    CreatedDate = n.CreatedAt,
                    IsRead = n.IsRead,
                    NotificationType = "general",
                    UserId = n.UserId
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications by user ID");
                return new List<NotificationDto>();
            }
        }

        public NotificationDto GetById(int id)
        {
            try
            {
                var notification = _notificationDal.Get(n => n.Id == id);
                if (notification == null)
                    return null;

                return new NotificationDto
                {
                    Id = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    CreatedDate = notification.CreatedAt,
                    IsRead = notification.IsRead,
                    NotificationType = "general",
                    UserId = notification.UserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification by ID");
                return null;
            }
        }

        public void Add(NotificationDto notificationDto)
        {
            try
            {
                var notification = new Notification
                {
                    Title = notificationDto.Title,
                    Message = notificationDto.Message,
                    UserId = notificationDto.UserId,
                    CreatedAt = notificationDto.CreatedDate,
                    IsRead = notificationDto.IsRead,
                    CreatedByAdminId = 1 // Default admin ID, should be passed from the caller
                };

                _notificationDal.Add(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding notification");
                throw;
            }
        }

        public void Update(NotificationDto notificationDto)
        {
            try
            {
                var notification = _notificationDal.Get(n => n.Id == notificationDto.Id);
                if (notification == null)
                    throw new KeyNotFoundException($"Notification with ID {notificationDto.Id} not found");

                notification.Title = notificationDto.Title;
                notification.Message = notificationDto.Message;
                notification.IsRead = notificationDto.IsRead;

                _notificationDal.Update(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification");
                throw;
            }
        }

        public void Delete(int id)
        {
            try
            {
                var notification = _notificationDal.Get(n => n.Id == id);
                if (notification != null)
                    _notificationDal.Delete(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                throw;
            }
        }

        public void MarkAsRead(int notificationId)
        {
            try
            {
                var notification = _notificationDal.Get(n => n.Id == notificationId);
                if (notification != null)
                {
                    notification.IsRead = true;
                    _notificationDal.Update(notification);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                throw;
            }
        }

        public async Task<ApiResponse<bool>> DeleteNotificationAsync(int notificationId)
        {
            try
            {
                var notification = await _notificationDal.GetByIdAsync(notificationId);
                if (notification == null)
                    return ApiResponse<bool>.ErrorResult(Messages.NotificationNotFound);

                await _notificationDal.DeleteAsync(notification);
                return ApiResponse<bool>.SuccessResult(Messages.NotificationDeleted, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }
    }
}