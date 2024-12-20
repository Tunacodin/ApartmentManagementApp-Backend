using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface ITenantService
    {
        void Add(Tenant tenant);
        void Update(Tenant tenant);
        void Delete(int tenantId);
        Tenant GetById(int tenantId);
        List<Tenant> GetAll();
        List<Tenant> GetByBuildingId(int buildingId);
        List<Tenant> GetByUserId(int userId);
    }
}
