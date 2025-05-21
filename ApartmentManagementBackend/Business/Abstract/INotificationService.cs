using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface INotificationService
    {
        Task<ApiResponse<List<Notification>>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 10);
        Task<ApiResponse<List<Notification>>> GetBuildingNotificationsAsync(int buildingId, int page = 1, int pageSize = 10);
        Task<ApiResponse<List<Notification>>> GetUnreadNotificationsAsync(int userId);
        Task<ApiResponse<int>> GetUnreadCountAsync(int userId);
        Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId);
        Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId);
        Task<ApiResponse<Notification>> CreateBuildingNotificationsAsync(NotificationCreateDto notificationDto);
        Task<ApiResponse<bool>> DeleteNotificationAsync(int notificationId);
        List<NotificationDto> GetNotificationsByUserId(int userId);
        NotificationDto GetById(int id);
        void Add(NotificationDto notification);
        void Update(NotificationDto notification);
        void Delete(int id);
        void MarkAsRead(int notificationId);
    }
}