using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface INotificationService
    {
        Task<ApiResponse<List<Notification>>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 10);
        Task<ApiResponse<List<Notification>>> GetUnreadNotificationsAsync(int userId);
        Task<ApiResponse<int>> GetUnreadCountAsync(int userId);
        Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId);
        Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId);
        Task<ApiResponse<Notification>> CreateNotificationAsync(Notification notification);
        Task<ApiResponse<bool>> DeleteNotificationAsync(int notificationId);
    }
}