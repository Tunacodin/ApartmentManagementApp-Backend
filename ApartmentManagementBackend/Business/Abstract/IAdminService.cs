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
    }
}
