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

        public AdminManager(IUserDal userDal, IBuildingDal buildingDal, ITenantDal tenantDal)
        {
            _userDal = userDal;
            _buildingDal = buildingDal;
            _tenantDal = tenantDal;
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
            var user = _userDal.Get(u => u.UserId == userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            _userDal.Delete(user);
        }

        public void DeleteBuilding(int buildingId)
        {
            var building = _buildingDal.Get(b => b.BuildingId == buildingId);
            if (building == null)
            {
                throw new KeyNotFoundException($"Building with ID {buildingId} not found.");
            }
            _buildingDal.Delete(building);
        }

        public void DeleteTenant(int tenantId)
        {
            var tenant = _tenantDal.Get(t => t.TenantId == tenantId);
            if (tenant == null)
            {
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");
            }
            _tenantDal.Delete(tenant);
        }
    }
}
