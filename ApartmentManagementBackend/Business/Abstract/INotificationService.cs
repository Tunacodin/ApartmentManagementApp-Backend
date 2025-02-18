using System.Collections.Generic;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface INotificationService
    {
        void Add(Notification notification);
        void Update(Notification notification);
        void Delete(int id);
        List<Notification> GetAll();
        List<Notification> GetByUserId(int userId);
        List<Notification> GetUnread(int userId);
        void MarkAsRead(int notificationId, int userId);
    }
}