using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
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

        public async Task<ApiResponse<Notification>> CreateNotificationAsync(Notification notification)
        {
            try
            {
                await _notificationDal.AddAsync(notification);
                return ApiResponse<Notification>.SuccessResult(Messages.NotificationCreated, notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return ApiResponse<Notification>.ErrorResult(Messages.UnexpectedError);
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