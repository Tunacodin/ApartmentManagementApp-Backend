using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Business.Concrete
{
    public class ApartmentManager : IApartmentService
    {
        private readonly IApartmentDal _apartmentDal;
        private readonly IBuildingDal _buildingDal;
        private readonly IUserDal _userDal;
        private readonly ITenantDal _tenantDal;
        private readonly IPaymentDal _paymentDal;

        public ApartmentManager(
            IApartmentDal apartmentDal,
            IBuildingDal buildingDal,
            IUserDal userDal,
            ITenantDal tenantDal,
            IPaymentDal paymentDal)
        {
            _apartmentDal = apartmentDal;
            _buildingDal = buildingDal;
            _userDal = userDal;
            _tenantDal = tenantDal;
            _paymentDal = paymentDal;
        }

        public void Add(Apartment apartment)
        {
            // İş kuralları kontrolü
            if (apartment.RentAmount < 0 || apartment.DepositAmount < 0)
                throw new ArgumentException("Rent and deposit amounts cannot be negative");

            _apartmentDal.Add(apartment);
        }

        public void Update(Apartment apartment)
        {
            _apartmentDal.Update(apartment);
        }

        public void Delete(int id)
        {
            var apartment = _apartmentDal.Get(a => a.Id == id);
            if (apartment != null)
                _apartmentDal.Delete(apartment);
        }

        public Apartment? Get(Expression<Func<Apartment, bool>> filter)
        {
            return _apartmentDal.Get(filter);
        }

        public List<Apartment>? GetAll()
        {
            return _apartmentDal.GetAll();
        }

        public List<Apartment>? GetByBuildingId(int buildingId)
        {
            return _apartmentDal.GetAll(a => a.BuildingId == buildingId);
        }

        public List<Apartment>? GetByOwnerId(int ownerId)
        {
            return _apartmentDal.GetAll(a => a.OwnerId == ownerId);
        }

        public async Task<ApiResponse<List<ApartmentListDto>>> GetAllAsync()
        {
            var apartments = await _apartmentDal.GetAllAsync();
            if (apartments == null || !apartments.Any())
            {
                return ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.ApartmentNotFound);
            }

            var apartmentDtos = new List<ApartmentListDto>();
            foreach (var apartment in apartments)
            {
                var building = await _buildingDal.GetByIdAsync(apartment.BuildingId);
                var owner = await _userDal.GetByIdAsync(apartment.OwnerId);
                var tenant = await _tenantDal.GetAsync(t => t.ApartmentId == apartment.Id);

                apartmentDtos.Add(new ApartmentListDto
                {
                    Id = apartment.Id,
                    BuildingName = building?.BuildingName ?? "Atanmamış",
                    UnitNumber = apartment.UnitNumber,
                    Floor = apartment.Floor,
                    Type = apartment.Type,
                    RentAmount = apartment.RentAmount,
                    Status = apartment.Status,
                    OwnerName = owner != null ? $"{owner.FirstName} {owner.LastName}" : "Atanmamış",
                    TenantName = tenant != null ? $"{tenant.FirstName} {tenant.LastName}" : "Boş"
                });
            }

            return ApiResponse<List<ApartmentListDto>>.SuccessResult(Messages.ApartmentsListed, apartmentDtos);
        }

        public async Task<ApiResponse<ApartmentDetailDto>> GetByIdAsync(int id)
        {
            try
            {
                var apartment = await _apartmentDal.GetByIdAsync(id);
                if (apartment == null)
                {
                    return ApiResponse<ApartmentDetailDto>.ErrorResult(Messages.ApartmentNotFound);
                }

                var building = await _buildingDal.GetByIdAsync(apartment.BuildingId);
                var owner = await _userDal.GetByIdAsync(apartment.OwnerId);
                var tenant = await _tenantDal.GetAsync(t => t.ApartmentId == apartment.Id);
                var payments = await _paymentDal.GetAllAsync(p => p.ApartmentId == apartment.Id);

                var apartmentDto = new ApartmentDetailDto
                {
                    Id = apartment.Id,
                    BuildingId = apartment.BuildingId,
                    BuildingName = building?.BuildingName ?? "Bilinmiyor",
                    OwnerId = apartment.OwnerId,
                    OwnerName = $"{owner?.FirstName} {owner?.LastName}".Trim(),
                    OwnerContact = owner?.PhoneNumber ?? "",
                    UnitNumber = apartment.UnitNumber,
                    Floor = apartment.Floor,
                    Type = apartment.Type,
                    RentAmount = apartment.RentAmount,
                    DepositAmount = apartment.DepositAmount,
                    HasBalcony = apartment.HasBalcony,
                    Notes = apartment.Notes,
                    Status = apartment.Status,
                    CreatedAt = apartment.CreatedAt,
                    IsActive = apartment.IsActive,
                    CurrentTenant = tenant != null ? new TenantInfoDto
                    {
                        TenantId = tenant.Id,
                        FullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                        PhoneNumber = tenant.PhoneNumber,
                        Email = tenant.Email ?? "",
                        LeaseStartDate = tenant.LeaseStartDate,
                        LeaseEndDate = tenant.LeaseEndDate
                    } : null,
                    RecentPayments = payments?.Select(p => new PaymentSummaryDto
                    {
                        PaymentId = p.Id,
                        PaymentType = p.PaymentType,
                        Amount = p.Amount,
                        PaymentDate = p.PaymentDate,
                        IsPaid = p.IsPaid
                    }).ToList() ?? new List<PaymentSummaryDto>()
                };

                return ApiResponse<ApartmentDetailDto>.SuccessResult(Messages.Retrieved, apartmentDto);
            }
            catch (DbUpdateException dbEx)
            {
                return ApiResponse<ApartmentDetailDto>.ErrorResult($"Veritabanı güncelleme hatası: {dbEx.Message}");
            }
            catch (Exception ex)
            {
                return ApiResponse<ApartmentDetailDto>.ErrorResult($"Daire bilgileri getirilirken bir hata oluştu: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<ApartmentListDto>>> GetByBuildingIdAsync(int buildingId)
        {
            var building = await _buildingDal.GetByIdAsync(buildingId);
            if (building == null)
            {
                return ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.BuildingNotFound);
            }

            var apartments = await _apartmentDal.GetAllAsync(a => a.BuildingId == buildingId);
            if (apartments == null || !apartments.Any())
            {
                return ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.ApartmentNotFound);
            }

            var apartmentDtos = new List<ApartmentListDto>();
            foreach (var apartment in apartments)
            {
                var owner = await _userDal.GetByIdAsync(apartment.OwnerId);
                var tenant = await _tenantDal.GetAsync(t => t.ApartmentId == apartment.Id);

                apartmentDtos.Add(new ApartmentListDto
                {
                    Id = apartment.Id,
                    BuildingName = building.BuildingName,
                    UnitNumber = apartment.UnitNumber,
                    Floor = apartment.Floor,
                    Type = apartment.Type,
                    RentAmount = apartment.RentAmount,
                    Status = apartment.Status,
                    OwnerName = owner != null ? $"{owner.FirstName} {owner.LastName}" : "Atanmamış",
                    TenantName = tenant != null ? $"{tenant.FirstName} {tenant.LastName}" : "Boş"
                });
            }

            return ApiResponse<List<ApartmentListDto>>.SuccessResult(Messages.ApartmentsListed, apartmentDtos);
        }

        public async Task<ApiResponse<List<ApartmentListDto>>> GetByOwnerIdAsync(int ownerId)
        {
            var owner = await _userDal.GetByIdAsync(ownerId);
            if (owner == null)
            {
                return ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.OwnerNotFound);
            }

            var apartments = await _apartmentDal.GetAllAsync(a => a.OwnerId == ownerId);
            if (apartments == null || !apartments.Any())
            {
                return ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.ApartmentNotFound);
            }

            var apartmentDtos = new List<ApartmentListDto>();
            foreach (var apartment in apartments)
            {
                var building = await _buildingDal.GetByIdAsync(apartment.BuildingId);
                var tenant = await _tenantDal.GetAsync(t => t.ApartmentId == apartment.Id);

                apartmentDtos.Add(new ApartmentListDto
                {
                    Id = apartment.Id,
                    BuildingName = building?.BuildingName ?? "Atanmamış",
                    UnitNumber = apartment.UnitNumber,
                    Floor = apartment.Floor,
                    Type = apartment.Type,
                    RentAmount = apartment.RentAmount,
                    Status = apartment.Status,
                    OwnerName = $"{owner.FirstName} {owner.LastName}",
                    TenantName = tenant != null ? $"{tenant.FirstName} {tenant.LastName}" : "Boş"
                });
            }

            return ApiResponse<List<ApartmentListDto>>.SuccessResult(Messages.ApartmentsListed, apartmentDtos);
        }

        public async Task<ApiResponse<ApartmentDto>> AddAsync(ApartmentDto apartmentDto)
        {
            // Bina kontrolü
            var building = await _buildingDal.GetByIdAsync(apartmentDto.BuildingId);
            if (building == null)
            {
                return ApiResponse<ApartmentDto>.ErrorResult(Messages.BuildingNotFound);
            }

            // Aynı binada aynı daire numarası kontrolü
            var existingApartment = await _apartmentDal.GetAsync(
                a => a.BuildingId == apartmentDto.BuildingId &&
                     a.UnitNumber == apartmentDto.UnitNumber);

            if (existingApartment != null)
            {
                return ApiResponse<ApartmentDto>.ErrorResult("Bu daire numarası bu binada zaten mevcut.");
            }

            var apartment = new Apartment
            {
                BuildingId = apartmentDto.BuildingId,
                OwnerId = apartmentDto.OwnerId,
                UnitNumber = apartmentDto.UnitNumber,
                Floor = apartmentDto.Floor,
                Type = apartmentDto.Type,
                RentAmount = apartmentDto.RentAmount,
                DepositAmount = apartmentDto.DepositAmount,
                HasBalcony = apartmentDto.HasBalcony,
                Notes = apartmentDto.Notes,
                Status = "available",
                CreatedAt = DateTime.Now,
                IsActive = true
            };

            await _apartmentDal.AddAsync(apartment);
            apartmentDto.Id = apartment.Id;

            return ApiResponse<ApartmentDto>.SuccessResult(Messages.ApartmentAdded, apartmentDto);
        }

        public async Task<ApiResponse<ApartmentDto>> UpdateAsync(ApartmentDto apartmentDto)
        {
            var existingApartment = await _apartmentDal.GetByIdAsync(apartmentDto.Id);
            if (existingApartment == null)
            {
                return ApiResponse<ApartmentDto>.ErrorResult(Messages.ApartmentNotFound);
            }

            // Bina değişiyorsa kontrol et
            if (existingApartment.BuildingId != apartmentDto.BuildingId)
            {
                var building = await _buildingDal.GetByIdAsync(apartmentDto.BuildingId);
                if (building == null)
                {
                    return ApiResponse<ApartmentDto>.ErrorResult(Messages.BuildingNotFound);
                }

                // Yeni binada aynı daire numarası var mı?
                var duplicateApartment = await _apartmentDal.GetAsync(
                    a => a.BuildingId == apartmentDto.BuildingId &&
                         a.UnitNumber == apartmentDto.UnitNumber &&
                         a.Id != apartmentDto.Id);

                if (duplicateApartment != null)
                {
                    return ApiResponse<ApartmentDto>.ErrorResult("Bu daire numarası yeni binada zaten mevcut.");
                }
            }

            existingApartment.BuildingId = apartmentDto.BuildingId;
            existingApartment.OwnerId = apartmentDto.OwnerId;
            existingApartment.UnitNumber = apartmentDto.UnitNumber;
            existingApartment.Floor = apartmentDto.Floor;
            existingApartment.Type = apartmentDto.Type;
            existingApartment.RentAmount = apartmentDto.RentAmount;
            existingApartment.DepositAmount = apartmentDto.DepositAmount;
            existingApartment.HasBalcony = apartmentDto.HasBalcony;
            existingApartment.Notes = apartmentDto.Notes;

            await _apartmentDal.UpdateAsync(existingApartment);

            return ApiResponse<ApartmentDto>.SuccessResult(Messages.ApartmentUpdated, apartmentDto);
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var apartment = await _apartmentDal.GetByIdAsync(id);
            if (apartment == null)
            {
                return ApiResponse<bool>.ErrorResult(Messages.ApartmentNotFound);
            }

            // Kiracı kontrolü
            var tenant = await _tenantDal.GetAsync(t => t.ApartmentId == id);
            if (tenant != null)
            {
                return ApiResponse<bool>.ErrorResult(Messages.ApartmentOccupied);
            }

            await _apartmentDal.DeleteAsync(apartment);
            return ApiResponse<bool>.SuccessResult(Messages.ApartmentDeleted, true);
        }

        // Diğer metodların implementasyonu...
    }
}