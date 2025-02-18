using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Business.Concrete
{
    public class TenantManager : ITenantService
    {
        private readonly ITenantDal _tenantDal;
        private readonly IApartmentDal _apartmentDal;
        private readonly IPaymentDal _paymentDal;
        private readonly IBuildingDal _buildingDal;

        public TenantManager(ITenantDal tenantDal, IApartmentDal apartmentDal, IPaymentDal paymentDal, IBuildingDal buildingDal)
        {
            _tenantDal = tenantDal;
            _apartmentDal = apartmentDal;
            _paymentDal = paymentDal;
            _buildingDal = buildingDal;
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

        public void AddFromDto(TenantDto tenantDto)
        {
            if (tenantDto == null)
            {
                throw new ArgumentNullException(nameof(tenantDto), "TenantDto cannot be null.");
            }

            var nameParts = tenantDto.FullName.Split(' ');
            var tenant = new Tenant
            {
                FirstName = nameParts.Length > 0 ? nameParts[0] : string.Empty,
                LastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : string.Empty,
                Email = tenantDto.Email,
                PhoneNumber = tenantDto.PhoneNumber,
                Role = tenantDto.Role,
                IsActive = tenantDto.IsActive,
                MonthlyRent = tenantDto.MonthlyRent,
                MonthlyDues = tenantDto.MonthlyDues,
                ApartmentId = (int)tenantDto.ApartmentId!,
                LeaseStartDate = tenantDto.LeaseStartDate,
                LeaseEndDate = tenantDto.LeaseEndDate
            };

            Add(tenant);
        }

        public void Update(Tenant tenant)
        {
            if (tenant == null)
            {
                throw new ArgumentNullException(nameof(tenant), "Tenant cannot be null.");
            }

            _tenantDal.Update(tenant);
        }

        public void UpdateFromDto(TenantDto tenantDto)
        {
            if (tenantDto == null)
            {
                throw new ArgumentNullException(nameof(tenantDto), "TenantDto cannot be null.");
            }

            var existingTenant = GetById(tenantDto.Id);
            if (existingTenant == null)
            {
                throw new KeyNotFoundException($"Tenant with ID {tenantDto.Id} not found.");
            }

            var nameParts = tenantDto.FullName.Split(' ');
            existingTenant.FirstName = nameParts.Length > 0 ? nameParts[0] : string.Empty;
            existingTenant.LastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : string.Empty;
            existingTenant.Email = tenantDto.Email;
            existingTenant.PhoneNumber = tenantDto.PhoneNumber;
            existingTenant.Role = tenantDto.Role;
            existingTenant.IsActive = tenantDto.IsActive;
            existingTenant.MonthlyRent = tenantDto.MonthlyRent;
            existingTenant.MonthlyDues = tenantDto.MonthlyDues;
            existingTenant.ApartmentId = (int)tenantDto.ApartmentId!;
            existingTenant.LeaseStartDate = tenantDto.LeaseStartDate;
            existingTenant.LeaseEndDate = tenantDto.LeaseEndDate;

            Update(existingTenant);
        }

        public void Delete(int id)
        {
            var tenant = _tenantDal.Get(t => t.Id == id);
            if (tenant == null)
            {
                throw new KeyNotFoundException($"Tenant with ID {id} not found.");
            }

            _tenantDal.Delete(tenant);
        }

        public Tenant? GetById(int id)
        {
            return _tenantDal.Get(t => t.Id == id);
        }

        public TenantDto? GetTenantDtoById(int id)
        {
            var tenant = GetById(id);
            if (tenant == null) return null;

            return MapToTenantDto(tenant);
        }

        public List<TenantDto>? GetAllTenantDtos()
        {
            var tenants = _tenantDal.GetAll();
            if (tenants == null) return null;

            return tenants.Select(MapToTenantDto).ToList();
        }

        public List<Tenant>? GetByBuildingId(int buildingId)
        {
            // Önce binadaki tüm daireleri bul
            var apartments = _apartmentDal.GetAll(a => a.BuildingId == buildingId);
            if (apartments == null) return null;

            // Dairelerde oturan kiracıları bul
            var apartmentIds = apartments.Select(a => a.Id).ToList();
            return _tenantDal.GetAll(t => apartmentIds.Contains(t.ApartmentId));
        }

        public List<Tenant>? GetByUserId(int userId)
        {
            return _tenantDal.GetAll(t => t.Id == userId);
        }

        public Tenant? Get(Expression<Func<Tenant, bool>> filter)
        {
            return _tenantDal.Get(filter);
        }

        private TenantDto MapToTenantDto(Tenant tenant)
        {
            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            var payments = _paymentDal.GetAll(p => p.UserId == tenant.Id);

            var tenantDto = new TenantDto
            {
                Id = tenant.Id,
                FullName = $"{tenant.FirstName ?? string.Empty} {tenant.LastName ?? string.Empty}".Trim(),
                Email = tenant.Email ?? string.Empty,
                PhoneNumber = tenant.PhoneNumber ?? string.Empty,
                Role = tenant.Role ?? string.Empty,
                IsActive = tenant.IsActive,
                ApartmentId = tenant.ApartmentId,
                LeaseStartDate = tenant.LeaseStartDate,
                LeaseEndDate = tenant.LeaseEndDate,
                MonthlyRent = tenant.MonthlyRent,
                MonthlyDues = tenant.MonthlyDues
            };

            return tenantDto;
        }

        private TenantDetailDto MapToTenantDetailDto(Tenant tenant)
        {
            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            var building = apartment != null ? _buildingDal.Get(b => b.Id == apartment.BuildingId) : null;
            var payments = _paymentDal.GetAll(p => p.UserId == tenant.Id);

            return new TenantDetailDto
            {
                Id = tenant.Id,
                FullName = $"{tenant.FirstName ?? string.Empty} {tenant.LastName ?? string.Empty}".Trim(),
                Email = tenant.Email ?? string.Empty,
                PhoneNumber = tenant.PhoneNumber ?? string.Empty,
                IsActive = tenant.IsActive,
                ApartmentId = tenant.ApartmentId,
                BuildingName = building?.BuildingName ?? "Atanmamış",
                UnitNumber = apartment?.UnitNumber ?? 0,
                LeaseStartDate = tenant.LeaseStartDate,
                LeaseEndDate = tenant.LeaseEndDate,
                MonthlyRent = tenant.MonthlyRent,
                MonthlyDues = tenant.MonthlyDues,
                LastPaymentDate = payments?.OrderByDescending(p => p.PaymentDate).FirstOrDefault()?.PaymentDate
            };
        }

        private TenantListDto MapToTenantListDto(Tenant tenant)
        {
            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            var building = apartment != null ? _buildingDal.Get(b => b.Id == apartment.BuildingId) : null;

            return new TenantListDto
            {
                Id = tenant.Id,
                FullName = $"{tenant.FirstName ?? string.Empty} {tenant.LastName ?? string.Empty}".Trim(),
                Email = tenant.Email ?? string.Empty,
                PhoneNumber = tenant.PhoneNumber ?? string.Empty,
                IsActive = tenant.IsActive,
                ApartmentId = tenant.ApartmentId,
                BuildingName = building?.BuildingName ?? "Atanmamış",
                UnitNumber = apartment?.UnitNumber ?? 0
            };
        }

        private TenantWithPaymentsDto MapToTenantWithPaymentsDto(Tenant tenant)
        {
            var detailDto = MapToTenantDetailDto(tenant);
            var payments = _paymentDal.GetAll(p => p.UserId == tenant.Id);

            return new TenantWithPaymentsDto
            {
                Id = detailDto.Id,
                FullName = detailDto.FullName,
                Email = detailDto.Email,
                PhoneNumber = detailDto.PhoneNumber,
                IsActive = detailDto.IsActive,
                ApartmentId = detailDto.ApartmentId,
                BuildingName = detailDto.BuildingName,
                UnitNumber = detailDto.UnitNumber,
                LeaseStartDate = detailDto.LeaseStartDate,
                LeaseEndDate = detailDto.LeaseEndDate,
                MonthlyRent = detailDto.MonthlyRent,
                MonthlyDues = detailDto.MonthlyDues,
                LastPaymentDate = detailDto.LastPaymentDate,
                Payments = payments?.Select(p => new PaymentHistoryDto
                {
                    Id = p.Id,
                    PaymentType = p.PaymentType.ToString().ToLower(),
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    IsPaid = p.IsPaid,
                    Description = p.Description ?? string.Empty
                }).ToList() ?? new List<PaymentHistoryDto>()
            };
        }

        public TenantWithPaymentsDto? GetTenantWithPayments(int id)
        {
            var tenant = GetById(id);
            if (tenant == null) return null;

            return MapToTenantWithPaymentsDto(tenant);
        }

        public List<PaymentHistoryDto>? GetTenantPayments(int id)
        {
            var tenant = GetById(id);
            if (tenant == null) return null;

            var payments = _paymentDal.GetAll(p => p.UserId == tenant.Id);
            if (payments == null) return null;

            return payments.Select(p => new PaymentHistoryDto
            {
                Id = p.Id,
                PaymentType = p.PaymentType.ToString().ToLower(),
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                IsPaid = p.IsPaid,
                Description = p.Description ?? string.Empty
            }).ToList();
        }

        public List<TenantListDto>? GetAllTenants()
        {
            var tenants = _tenantDal.GetAll();
            if (tenants == null) return null;

            return tenants.Select(MapToTenantListDto).ToList();
        }

        public TenantDetailDto? GetTenantById(int id)
        {
            var tenant = GetById(id);
            if (tenant == null) return null;

            return MapToTenantDetailDto(tenant);
        }
    }
}
