using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface IAdminService
    {
        List<User> GetAllUsers();                      // Tüm kullanıcıları listele
        List<Building> GetAllBuildings();              // Tüm binaları listele
        List<Tenant> GetAllTenants();                  // Tüm kiracıları listele
        void DeleteUser(int userId);                   // Kullanıcı sil
        void DeleteBuilding(int buildingId);           // Bina sil
        void DeleteTenant(int tenantId);               // Kiracı sil
        void CreateNotification(Notification notification);
        void ScheduleMeeting(Meeting meeting);
        void AssignOwnerToApartment(int ownerId, int apartmentId);
        void AssignTenantToApartment(int tenantId, int apartmentId);
        void ApproveTenantRequest(int requestId);
        void RejectTenantRequest(int requestId, string reason);
    }
}
