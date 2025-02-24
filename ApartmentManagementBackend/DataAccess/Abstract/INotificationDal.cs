using Core.DataAccess;
using System.Collections.Generic;
using System.Linq.Expressions;
using Entities.Concrete;

namespace DataAccess.Abstract
{
    public interface INotificationDal : IEntityRepository<Notification>
    {
        Task<List<Notification>> GetUnreadNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int notificationId);
        Task MarkAllAsReadAsync(int userId);
        Task<List<Notification>> GetNotificationsByUserIdAsync(int userId, int page = 1, int pageSize = 10);
    }
}