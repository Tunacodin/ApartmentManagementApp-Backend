using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Transactions;

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
                throw new ArgumentNullException(nameof(tenant));

            if (tenant.MonthlyRent <= 0 || tenant.MonthlyDues <= 0)
                throw new ArgumentException("MonthlyRent and MonthlyDues must be greater than zero.");

            using (var transaction = new TransactionScope())
            {
                try
                {
                    // 1. Kiracıyı ekle
                    _tenantDal.Add(tenant);

                    // 2. Daire durumunu güncelle
                    var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
                    if (apartment != null)
                    {
                        apartment.IsOccupied = true;
                        apartment.Status = "occupied"; // Daire durumunu güncelle
                        _apartmentDal.Update(apartment);

                        // 3. Bina doluluk oranını güncelle
                        UpdateBuildingOccupancyRate(apartment.BuildingId);

                        // 4. Otomatik ödeme kayıtları oluştur
                        CreateInitialPaymentRecords(tenant);
                    }

                    transaction.Complete();
                }
                catch
                {
                    transaction.Dispose();
                    throw;
                }
            }
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
                throw new KeyNotFoundException($"Tenant with ID {id} not found.");

            using (var transaction = new TransactionScope())
            {
                try
                {
                    // 1. Gelecek ödemeleri iptal et
                    CancelFuturePayments(tenant.Id);

                    // 2. Kiracıyı sil
                    _tenantDal.Delete(tenant);

                    // 3. Daire durumunu güncelle
                    var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
                    if (apartment != null)
                    {
                        apartment.IsOccupied = false;
                        apartment.Status = "available"; // Daire durumunu güncelle
                        _apartmentDal.Update(apartment);

                        // 4. Bina doluluk oranını güncelle
                        UpdateBuildingOccupancyRate(apartment.BuildingId);
                    }

                    transaction.Complete();
                }
                catch
                {
                    transaction.Dispose();
                    throw;
                }
            }
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

        private void UpdateBuildingOccupancyRate(int buildingId)
        {
            var building = _buildingDal.Get(b => b.Id == buildingId);
            if (building == null) return;

            // Binadaki toplam daire sayısını al
            var totalApartments = building.TotalApartments;
            if (totalApartments == 0) return;

            // Binadaki dolu daire sayısını hesapla
            var apartments = _apartmentDal.GetAll(a => a.BuildingId == buildingId && a.IsOccupied);
            var occupiedApartments = apartments?.Count ?? 0;

            // Doluluk oranını hesapla ve güncelle
            building.OccupancyRate = ((decimal)occupiedApartments / totalApartments) * 100;
            _buildingDal.Update(building);
        }

        private void CreateInitialPaymentRecords(Tenant tenant)
        {
            // Kiracının başlangıç tarihinden itibaren 12 aylık ödeme kaydı oluştur
            for (int i = 0; i < 12; i++)
            {
                // Kira ödemesi
                var rentPayment = new Payment
                {
                    UserId = tenant.Id,
                    ApartmentId = tenant.ApartmentId,
                    PaymentType = "rent",
                    Amount = tenant.MonthlyRent,
                    DueDate = tenant.LeaseStartDate.AddMonths(i),
                    IsPaid = false,
                    Description = $"{tenant.LeaseStartDate.AddMonths(i).ToString("MMMM yyyy")} Kira Ödemesi"
                };
                _paymentDal.Add(rentPayment);

                // Aidat ödemesi
                var duesPayment = new Payment
                {
                    UserId = tenant.Id,
                    ApartmentId = tenant.ApartmentId,
                    PaymentType = "dues",
                    Amount = tenant.MonthlyDues,
                    DueDate = tenant.LeaseStartDate.AddMonths(i),
                    IsPaid = false,
                    Description = $"{tenant.LeaseStartDate.AddMonths(i).ToString("MMMM yyyy")} Aidat Ödemesi"
                };
                _paymentDal.Add(duesPayment);
            }
        }

        private void CancelFuturePayments(int tenantId)
        {
            // Gelecek tarihli ödenmemiş ödemeleri iptal et
            var futurePayments = _paymentDal.GetAll(p => 
                p.UserId == tenantId && 
                p.DueDate > DateTime.Now && 
                !p.IsPaid);

            if (futurePayments == null) return;

            foreach (var payment in futurePayments)
            {
                _paymentDal.Delete(payment);
            }   
        }
    }
}
