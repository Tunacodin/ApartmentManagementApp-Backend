using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;

namespace Business.Concrete
{
    public class NotificationManager : INotificationService
    {
        private readonly INotificationDal _notificationDal;

        public NotificationManager(INotificationDal notificationDal)
        {
            _notificationDal = notificationDal;
        }

        public void Add(Notification notification)
        {
            notification.CreatedAt = DateTime.Now;
            _notificationDal.Add(notification);
        }

        public void Update(Notification notification)
        {
            _notificationDal.Update(notification);
        }

        public void Delete(int id)
        {
            var notification = _notificationDal.Get(n => n.Id == id);
            if (notification != null)
                _notificationDal.Delete(notification);
        }

        public List<Notification> GetAll()
        {
            return _notificationDal.GetAll();
        }

        public List<Notification> GetByUserId(int userId)
        {
            return _notificationDal.GetAll(n => n.UserId == userId);
        }

        public List<Notification> GetUnread(int userId)
        {
            return _notificationDal.GetAll(n => n.UserId == userId && !n.IsRead);
        }

        public void MarkAsRead(int notificationId, int userId)
        {
            var notification = _notificationDal.Get(n => n.Id == notificationId && n.UserId == userId);
            if (notification != null)
            {
                notification.IsRead = true;
                _notificationDal.Update(notification);
            }
        }
    }
} 