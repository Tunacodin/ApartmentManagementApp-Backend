using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using System.Collections.Generic;


namespace Business.Concrete
{
    public class AdminManager : IAdminService
    {
        private readonly IUserDal _userDal;
        private readonly IBuildingDal _buildingDal;
        private readonly ITenantDal _tenantDal;
        private readonly IApartmentDal _apartmentDal;
        private readonly INotificationDal _notificationDal;
        private readonly IMeetingDal _meetingDal;

        public AdminManager(
            IUserDal userDal,
            IBuildingDal buildingDal,
            ITenantDal tenantDal,
            IApartmentDal apartmentDal,
            INotificationDal notificationDal,
            IMeetingDal meetingDal)
        {
            _userDal = userDal;
            _buildingDal = buildingDal;
            _tenantDal = tenantDal;
            _apartmentDal = apartmentDal;
            _notificationDal = notificationDal;
            _meetingDal = meetingDal;
        }

        public List<User> GetAllUsers()
        {
            return _userDal.GetAll();
        }

        public List<Building> GetAllBuildings()
        {
            return _buildingDal.GetAll();
        }

        public List<Tenant> GetAllTenants()
        {
            return _tenantDal.GetAll();
        }

        public void DeleteUser(int userId)
        {
            var user = _userDal.Get(u => u.Id == userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            _userDal.Delete(user);
        }

        public void DeleteBuilding(int buildingId)
        {
            var building = _buildingDal.Get(b => b.Id == buildingId);
            if (building == null)
            {
                throw new KeyNotFoundException($"Building with ID {buildingId} not found.");
            }
            _buildingDal.Delete(building);
        }

        public void DeleteTenant(int tenantId)
        {
            var tenant = _tenantDal.Get(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");
            }
            _tenantDal.Delete(tenant);
        }

        public void AssignOwnerToApartment(int ownerId, int apartmentId)
        {
            var apartment = _apartmentDal.Get(a => a.Id == apartmentId);
            if (apartment == null)
                throw new Exception("Apartment not found");

            var owner = _userDal.Get(u => u.Id == ownerId && u.Role == "owner");
            if (owner == null)
                throw new Exception("Owner not found");

            // Daire zaten başka bir ev sahibine atanmış mı kontrol et
            if (apartment.OwnerId != 0 && apartment.OwnerId != ownerId)
                throw new Exception("Apartment already assigned to another owner");

            apartment.OwnerId = ownerId;
            _apartmentDal.Update(apartment);

            // Bildirim oluştur
            var notification = new Notification
            {
                Title = "New Apartment Assignment",
                Message = $"You have been assigned as the owner of apartment {apartment.UnitNumber}",
                UserId = ownerId,
                CreatedAt = DateTime.Now,
                CreatedByAdminId = 1, // Current admin ID should be passed
                IsRead = false
            };
            _notificationDal.Add(notification);
        }

        public void AssignTenantToApartment(int tenantId, int apartmentId)
        {
            var apartment = _apartmentDal.Get(a => a.Id == apartmentId);
            if (apartment == null)
                throw new Exception("Apartment not found");

            var tenant = _userDal.Get(u => u.Id == tenantId && u.Role == "tenant");
            if (tenant == null)
                throw new Exception("Tenant not found");

            // Daire boş mu kontrol et
            if (apartment.Status != "available")
                throw new Exception("Apartment is not available for rent");

            apartment.Status = "rented";
            _apartmentDal.Update(apartment);

            // Kiracı-daire ilişkisini kaydet
            // Bu ilişki için ayrı bir tablo kullanılabilir

            // Bildirim oluştur
            var notification = new Notification
            {
                Title = "New Tenant Assignment",
                Message = $"A new tenant has been assigned to apartment {apartment.UnitNumber}",
                UserId = apartment.OwnerId, // Ev sahibine bildir
                CreatedAt = DateTime.Now,
                CreatedByAdminId = 1, // Current admin ID should be passed
                IsRead = false
            };
            _notificationDal.Add(notification);
        }

        public void ApproveTenantRequest(int requestId)
        {
            // Kiracı talebini onayla
            // Bu işlem için ayrı bir TenantRequest entity'si oluşturulabilir
        }

        public void RejectTenantRequest(int requestId, string reason)
        {
            // Kiracı talebini reddet
        }

        public void CreateNotification(Notification notification)
        {
            notification.CreatedAt = DateTime.Now;
            _notificationDal.Add(notification);
        }

        public void ScheduleMeeting(Meeting meeting)
        {
            meeting.CreatedAt = DateTime.Now;
            _meetingDal.Add(meeting);

            // Toplantı ile ilgili tüm kullanıcılara bildirim gönder
            var notification = new Notification
            {
                Title = "New Meeting Scheduled",
                Message = $"A new meeting has been scheduled for {meeting.MeetingDate}",
                CreatedAt = DateTime.Now,
                CreatedByAdminId = 1,
                IsRead = false
            };
            _notificationDal.Add(notification);
        }
    }
}
