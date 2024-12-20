using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Concrete
{
    public class TenantManager : ITenantService
    {
        private readonly ITenantDal _tenantDal;

        public TenantManager(ITenantDal tenantDal)
        {
            _tenantDal = tenantDal;
        }

        public void Add(Tenant tenant)
        {
            if (tenant == null)
            {
                throw new ArgumentNullException(nameof(tenant), "Tenant cannot be null.");
            }

            // İş mantığı: Kiracının aidat ve kira bilgisi pozitif olmalı
            if (tenant.MonthlyRent <= 0 || tenant.MonthlyDues <= 0)
            {
                throw new ArgumentException("MonthlyRent and MonthlyDues must be greater than zero.");
            }

            _tenantDal.Add(tenant);
        }

        public void Update(Tenant tenant)
        {
            if (tenant == null)
            {
                throw new ArgumentNullException(nameof(tenant), "Tenant cannot be null.");
            }

            _tenantDal.Update(tenant);
        }

        public void Delete(int tenantId)
        {
            var tenant = _tenantDal.Get(t => t.TenantId == tenantId);
            if (tenant == null)
            {
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");
            }

            _tenantDal.Delete(tenant);
        }

        public Tenant GetById(int tenantId)
        {
            return _tenantDal.Get(t => t.TenantId == tenantId);
        }

        public List<Tenant> GetAll()
        {
            return _tenantDal.GetAll();
        }

        public List<Tenant> GetByBuildingId(int buildingId)
        {
            return _tenantDal.GetAll(t => t.BuildingId == buildingId);
        }

        public List<Tenant> GetByUserId(int userId)
        {
            return _tenantDal.GetAll(t => t.UserId == userId);
        }
    }
}
