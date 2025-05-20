using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Transactions;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class TenantManager : ITenantService
    {
        private readonly ITenantDal _tenantDal;
        private readonly IApartmentDal _apartmentDal;
        private readonly IPaymentDal _paymentDal;
        private readonly IBuildingDal _buildingDal;
        private readonly IMeetingService _meetingService;
        private readonly ISurveyService _surveyService;
        private readonly IComplaintService _complaintService;
        private readonly INotificationService _notificationService;
        private readonly IAdminDal _adminDal;
        private readonly IOwnerDal _ownerDal;
        private readonly IContractDal _contractDal;
        private readonly ILogger<TenantManager> _logger;

        public TenantManager(
            ITenantDal tenantDal,
            IApartmentDal apartmentDal,
            IPaymentDal paymentDal,
            IBuildingDal buildingDal,
            IMeetingService meetingService,
            ISurveyService surveyService,
            IComplaintService complaintService,
            INotificationService notificationService,
            IAdminDal adminDal,
            IOwnerDal ownerDal,
            IContractDal contractDal,
            ILogger<TenantManager> logger)
        {
            _tenantDal = tenantDal;
            _apartmentDal = apartmentDal;
            _paymentDal = paymentDal;
            _buildingDal = buildingDal;
            _meetingService = meetingService;
            _surveyService = surveyService;
            _complaintService = complaintService;
            _notificationService = notificationService;
            _adminDal = adminDal;
            _ownerDal = ownerDal;
            _contractDal = contractDal;
            _logger = logger;
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
                ProfileImageUrl = tenant.ProfileImageUrl,
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
            var admin = building != null ? _adminDal.Get(a => a.Id == building.AdminId) : null;
            var owner = apartment != null ? _ownerDal.Get(o => o.Id == apartment.OwnerId) : null;
            var payments = _paymentDal.GetAll(p => p.UserId == tenant.Id);
            var contract = _contractDal.Get(c => c.TenantId == tenant.Id);

            return new TenantDetailDto
            {
                Id = tenant.Id,
                FullName = $"{tenant.FirstName ?? string.Empty} {tenant.LastName ?? string.Empty}".Trim(),
                Email = tenant.Email ?? string.Empty,
                PhoneNumber = tenant.PhoneNumber ?? string.Empty,
                IsActive = tenant.IsActive,
                ProfileImageUrl = tenant.ProfileImageUrl,
                ApartmentId = tenant.ApartmentId,
                BuildingName = building?.BuildingName ?? "Atanmamış",
                UnitNumber = apartment?.UnitNumber ?? 0,
                LeaseStartDate = contract?.StartDate ?? tenant.LeaseStartDate,
                LeaseEndDate = contract?.EndDate ?? tenant.LeaseEndDate,
                MonthlyRent = contract?.RentAmount ?? apartment?.RentAmount ?? tenant.MonthlyRent,
                MonthlyDues = building?.DuesAmount ?? tenant.MonthlyDues,
                LastPaymentDate = payments?.OrderByDescending(p => p.PaymentDate).FirstOrDefault()?.PaymentDate,
                ApartmentNumber = apartment?.UnitNumber ?? 0,
                BuildingId = building?.Id ?? 0,
                AdminName = admin != null ? $"{admin.FirstName} {admin.LastName}" : string.Empty,
                AdminPhone = admin?.PhoneNumber ?? string.Empty,
                AdminEmail = admin?.Email ?? string.Empty,
                OwnerName = owner != null ? $"{owner.FirstName} {owner.LastName}" : string.Empty,
                OwnerPhone = owner?.PhoneNumber ?? string.Empty,
                OwnerEmail = owner?.Email ?? string.Empty,
                DepositAmount = apartment?.DepositAmount ?? 0,
                ContractStatus = contract?.IsActive == true ? "Active" : "Inactive",
                RemainingDays = contract != null ? (int)(contract.EndDate - DateTime.Now).TotalDays : 0,
                RemainingMonths = contract != null ? (int)((contract.EndDate - DateTime.Now).TotalDays / 30) : 0,
                DaysUntilNextRent = contract != null ? (int)(contract.StartDate.AddMonths(1) - DateTime.Now).TotalDays : 0
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
                ProfileImageUrl = tenant.ProfileImageUrl,
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

            return payments
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentHistoryDto
                {
                    Id = p.Id,
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    DueDate = p.DueDate,
                    IsPaid = p.IsPaid,
                    Description = p.Description ?? string.Empty,
                    DelayedDays = p.DelayedDays,
                    DelayPenaltyAmount = p.DelayPenaltyAmount,
                    TotalAmount = p.TotalAmount ?? p.Amount
                })
                .ToList();
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
                    PaymentType = PaymentType.Rent.ToString(),
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

        public TenantDashboardDto GetTenantDashboard(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            if (apartment == null)
                throw new KeyNotFoundException($"Apartment not found for tenant {tenantId}");

            var building = _buildingDal.Get(b => b.Id == apartment.BuildingId);
            if (building == null)
                throw new KeyNotFoundException($"Building not found for apartment {apartment.Id}");

            _logger.LogInformation($"Building found - ID: {building.Id}, Name: {building.BuildingName}, Apartment BuildingId: {apartment.BuildingId}");

            var admin = _adminDal.Get(a => a.Id == building.AdminId);
            var owner = _ownerDal.Get(o => o.Id == apartment.OwnerId);
            var contract = _contractDal.Get(c => c.TenantId == tenantId);

            var dashboard = new TenantDashboardDto
            {
                Profile = new TenantProfileDto
                {
                    Id = tenant.Id,
                    FullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                    Email = tenant.Email,
                    PhoneNumber = tenant.PhoneNumber,
                    ProfileImageUrl = tenant.ProfileImageUrl,
                    IsActive = tenant.IsActive,
                    ApartmentId = apartment.Id,
                    ApartmentNumber = apartment.UnitNumber.ToString(),
                    BuildingId = building.Id,
                    BuildingName = building.BuildingName,
                    BuildingAddress = $"{building.Street} {building.BuildingNumber}, {building.Neighborhood}, {building.District}, {building.City}",
                    LeaseStartDate = tenant.LeaseStartDate,
                    LeaseEndDate = tenant.LeaseEndDate ?? DateTime.MaxValue,
                    MonthlyRent = tenant.MonthlyRent,
                    MonthlyDues = tenant.MonthlyDues,
                    TotalPayments = _paymentDal.GetAll(p => p.UserId == tenantId).Count,
                    PendingPayments = _paymentDal.GetAll(p => p.UserId == tenantId && !p.IsPaid).Count,
                    TotalComplaints = _complaintService.GetComplaintsByTenantId(tenantId).Count,
                    ActiveComplaints = _complaintService.GetComplaintsByTenantId(tenantId).Count(c => !c.IsResolved),
                    TotalMeetings = _meetingService.GetUpcomingMeetingsByBuildingId(building.Id).Count,
                    UpcomingMeetings = _meetingService.GetUpcomingMeetingsByBuildingId(building.Id).Count(m => m.StartTime > DateTime.Now),
                    RecentPayments = _paymentDal.GetAll(p => p.UserId == tenantId)
                        .OrderByDescending(p => p.PaymentDate)
                        .Take(5)
                        .Select(p => new PaymentWithUserDto
                        {
                            Id = p.Id,
                            PaymentType = p.PaymentType,
                            Amount = p.Amount,
                            PaymentDate = p.PaymentDate,
                            BuildingId = building.Id,
                            ApartmentId = p.ApartmentId,
                            UserId = p.UserId,
                            IsPaid = p.IsPaid,
                            UserFullName = p.UserFullName,
                            ProfileImageUrl = tenant.ProfileImageUrl
                        })
                        .ToList(),
                    RecentComplaints = _complaintService.GetComplaintsByTenantId(tenantId)
                        .OrderByDescending(c => c.CreatedAt)
                        .Take(5)
                        .Select(c => new ComplaintWithUserDto
                        {
                            Id = c.Id,
                            Subject = c.Title,
                            Description = c.Description,
                            CreatedAt = c.CreatedAt,
                            BuildingId = building.Id,
                            UserId = tenantId,
                            Status = c.Status == (int)ComplaintStatus.Resolved ? 1 : 0,
                            CreatedByName = $"{tenant.FirstName} {tenant.LastName}",
                            ProfileImageUrl = tenant.ProfileImageUrl
                        })
                        .ToList(),
                    UpcomingMeetingsList = _meetingService.GetUpcomingMeetingsByBuildingId(building.Id)
                        .Where(m => m.StartTime > DateTime.Now)
                        .OrderBy(m => m.StartTime)
                        .Take(5)
                        .ToList(),
                    AdminName = admin != null ? $"{admin.FirstName} {admin.LastName}" : null,
                    AdminPhone = admin?.PhoneNumber,
                    AdminEmail = admin?.Email,
                    OwnerName = owner != null ? $"{owner.FirstName} {owner.LastName}" : null,
                    OwnerPhone = owner?.PhoneNumber,
                    OwnerEmail = owner?.Email
                },
                Contract = new ContractInfoDto
                {
                    StartDate = contract?.StartDate ?? DateTime.Now,
                    EndDate = contract?.EndDate ?? DateTime.Now.AddYears(1),
                    RemainingDays = contract != null ? (int)(contract.EndDate - DateTime.Now).TotalDays : 0,
                    RemainingMonths = contract != null ? (int)((contract.EndDate - DateTime.Now).TotalDays / 30) : 0,
                    MonthlyRent = contract?.RentAmount ?? tenant.MonthlyRent,
                    MonthlyDues = building.DuesAmount,
                    ContractStatus = contract?.IsActive == true ? "Active" : "Inactive",
                    DaysUntilNextRent = contract != null ? (int)(contract.StartDate.AddMonths(1) - DateTime.Now).TotalDays : 0
                },
                Apartment = new ApartmentInfoDto
                {
                    Id = apartment.Id,
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
                    IsOccupied = apartment.IsOccupied
                },
                Building = new BuildingInfoDto
                {
                    Id = building.Id,
                    BuildingName = building.BuildingName,
                    City = building.City,
                    District = building.District,
                    Neighborhood = building.Neighborhood,
                    Street = building.Street,
                    BuildingNumber = building.BuildingNumber,
                    PostalCode = building.PostalCode,
                    HasElevator = building.HasElevator,
                    HasPlayground = building.HasPlayground,
                    HasGarden = building.HasGarden,
                    ParkingType = building.ParkingType,
                    HeatingType = building.HeatingType,
                    PoolType = building.PoolType,
                    BuildingAge = building.BuildingAge,
                    IncludedServices = new List<string>
                    {
                        building.IncludedElectric ? "Elektrik" : null,
                        building.IncludedWater ? "Su" : null,
                        building.IncludedGas ? "Doğalgaz" : null,
                        building.IncludedInternet ? "İnternet" : null
                    }.Where(s => s != null).ToList()
                },
                Admin = admin != null ? new AdminInfoDto
                {
                    FullName = $"{admin.FirstName} {admin.LastName}",
                    Email = admin.Email,
                    PhoneNumber = admin.PhoneNumber
                } : null,
                Owner = owner != null ? new OwnerInfoDto
                {
                    FullName = $"{owner.FirstName} {owner.LastName}",
                    Email = owner.Email,
                    PhoneNumber = owner.PhoneNumber,
                    IBAN = owner.IBAN,
                    BankName = owner.BankName
                } : null,
                PaymentSummary = new PaymentSummaryDto
                {
                    CurrentBalance = CalculateCurrentBalance(tenantId),
                    CurrentPenalty = CalculateCurrentPenalty(tenantId),
                    NextPaymentAmount = (contract?.RentAmount ?? tenant.MonthlyRent) + building.DuesAmount,
                    NextPaymentDate = GetNextPaymentDate(tenantId),
                    HasOverduePayments = HasOverduePayments(tenantId),
                    TotalPaidAmount = GetTotalPaidAmount(tenantId),
                    TotalPendingAmount = GetTotalPendingAmount(tenantId)
                },
                RecentPayments = _paymentDal.GetAll(p => p.UserId == tenantId)
                    .OrderByDescending(p => p.PaymentDate)
                    .Take(5)
                    .Select(p => new PaymentHistoryDto
                    {
                        Id = p.Id,
                        PaymentType = p.PaymentType,
                        Amount = p.Amount,
                        PaymentDate = p.PaymentDate,
                        IsPaid = p.IsPaid
                    })
                    .ToList(),
                RecentPenalties = GetRecentPenalties(tenantId),
                UpcomingMeetings = _meetingService.GetUpcomingMeetingsByBuildingId(building.Id)
                    .Where(m => m.StartTime > DateTime.Now)
                    .OrderBy(m => m.StartTime)
                    .Take(5)
                    .ToList(),
                ActiveSurveys = _surveyService.GetActiveSurveysByBuildingId(building.Id),
                RecentComplaints = _complaintService.GetComplaintsByTenantId(tenantId)
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(5)
                    .ToList(),
                Notifications = _notificationService.GetNotificationsByUserId(tenantId)
                    .OrderByDescending(n => n.CreatedDate)
                    .Take(10)
                    .ToList()
            };

            return dashboard;
        }

        private decimal CalculateCurrentPenalty(int tenantId)
        {
            // Geç ödenen ödemeler için ceza hesaplama
            var latePayments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                p.DueDate < DateTime.Now &&
                !p.IsPaid);

            if (latePayments == null || !latePayments.Any())
                return 0;

            decimal totalPenalty = 0;
            foreach (var payment in latePayments)
            {
                var daysLate = (DateTime.Now - payment.DueDate).Days;
                // Günlük %0.1 ceza (örnek)
                totalPenalty += payment.Amount * (decimal)(daysLate * 0.001);
            }

            return totalPenalty;
        }

        public List<NotificationDto> GetTenantNotifications(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            // Kiracıya özel bildirimleri veritabanından çek
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            return _notificationService.GetNotificationsByUserId(tenantId)
                .Where(n => !n.IsRead || n.CreatedDate >= thirtyDaysAgo)
                .OrderByDescending(n => n.CreatedDate)
                .Take(10)
                .ToList();
        }

        public List<MeetingDto> GetUpcomingMeetings(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            // Kiracının binasındaki toplantıları getir
            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            if (apartment == null)
                throw new KeyNotFoundException($"Apartment not found for tenant {tenantId}");

            return _meetingService.GetUpcomingMeetingsByBuildingId(apartment.BuildingId);
        }

        public List<SurveyDto> GetActiveSurveys(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            // Kiracının binasındaki aktif anketleri getir
            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            if (apartment == null)
                throw new KeyNotFoundException($"Apartment not found for tenant {tenantId}");

            return _surveyService.GetActiveSurveysByBuildingId(apartment.BuildingId);
        }

        public List<ComplaintDto> GetRecentComplaints(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            // Son 3 ay içindeki şikayetleri getir
            var threeMonthsAgo = DateTime.Now.AddMonths(-3);
            return _complaintService.GetComplaintsByTenantId(tenantId)
                .Where(c => c.CreatedAt >= threeMonthsAgo)
                .OrderByDescending(c => c.CreatedAt)
                .Take(5)
                .ToList();
        }

        public void CreateComplaint(int tenantId, string title, string description)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
            if (apartment == null)
                throw new KeyNotFoundException($"Apartment not found for tenant {tenantId}");

            var complaint = new ComplaintDto
            {
                Title = title,
                Description = description,
                CreatedAt = DateTime.Now,
                Status = (int)ComplaintStatus.Open,
                BuildingId = apartment.BuildingId,
                ApartmentId = apartment.Id,
                TenantId = tenantId,
                IsResolved = false,
                IsInProgress = false,
                CreatedByName = $"{tenant.FirstName} {tenant.LastName}"
            };

            _complaintService.Add(complaint);

            // Bildirim oluştur
            var notification = new NotificationDto
            {
                Title = "Yeni Şikayet",
                Message = $"Yeni bir şikayet oluşturuldu: {title}",
                CreatedDate = DateTime.Now,
                IsRead = false,
                NotificationType = "complaint",
                UserId = tenantId
            };

            _notificationService.Add(notification);
        }

        public void SubmitSurveyResponse(int tenantId, int surveyId, Dictionary<int, string> responses)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            var survey = _surveyService.GetById(surveyId);
            if (survey == null)
                throw new KeyNotFoundException($"Survey with ID {surveyId} not found.");

            // Anket yanıtlarını kaydet
            foreach (var response in responses)
            {
                var surveyResponse = new SurveyResponseDto
                {
                    SurveyId = surveyId,
                    QuestionId = response.Key,
                    Answer = response.Value,
                    TenantId = tenantId,
                    ResponseDate = DateTime.Now
                };

                _surveyService.AddResponse(surveyResponse);
            }

            // Bildirim oluştur
            var notification = new NotificationDto
            {
                Title = "Anket Yanıtı",
                Message = $"{survey.Title} anketine yanıt verdiniz",
                CreatedDate = DateTime.Now,
                IsRead = false,
                NotificationType = "survey",
                UserId = tenantId
            };

            _notificationService.Add(notification);
        }

        private List<PenaltyHistoryDto> GetRecentPenalties(int tenantId)
        {
            var penalties = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                p.PaymentType == "penalty" &&
                p.PaymentDate >= DateTime.Now.AddMonths(-3));

            return (penalties?.OrderByDescending(p => p.PaymentDate)
                .Take(5)
                .Select(p => new PenaltyHistoryDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    Description = p.Description ?? "Penalty",
                    PaymentDate = p.PaymentDate,
                    IsPaid = p.IsPaid
                })
                .ToList()) ?? new List<PenaltyHistoryDto>();
        }

        private decimal CalculateCurrentBalance(int tenantId)
        {
            var payments = _paymentDal.GetAll(p => p.UserId == tenantId && !p.IsPaid);
            return payments?.Sum(p => p.Amount) ?? 0;
        }

        private DateTime GetNextPaymentDate(int tenantId)
        {
            var payments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                !p.IsPaid &&
                p.DueDate > DateTime.Now);

            return payments?.OrderBy(p => p.DueDate)
                .FirstOrDefault()?.DueDate ?? DateTime.Now.AddMonths(1);
        }

        private bool HasOverduePayments(int tenantId)
        {
            var payments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                !p.IsPaid &&
                p.DueDate < DateTime.Now);

            return payments?.Any() ?? false;
        }

        private decimal GetTotalPaidAmount(int tenantId)
        {
            var payments = _paymentDal.GetAll(p => p.UserId == tenantId && p.IsPaid);
            return payments?.Sum(p => p.Amount) ?? 0;
        }

        private decimal GetTotalPendingAmount(int tenantId)
        {
            var payments = _paymentDal.GetAll(p => p.UserId == tenantId && !p.IsPaid);
            return payments?.Sum(p => p.Amount) ?? 0;
        }

        private int GetDaysUntilNextRent(int tenantId)
        {
            var payments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                !p.IsPaid &&
                p.DueDate > DateTime.Now);

            if (payments == null || !payments.Any())
                return 0;

            var nextPaymentDate = payments.OrderBy(p => p.DueDate).First().DueDate;
            var daysUntilNextRent = (nextPaymentDate - DateTime.Now).Days;
            return Math.Max(daysUntilNextRent, 0);
        }

        public List<PaymentDto> GetNextPayments(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            var payments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                !p.IsPaid &&
                p.DueDate >= DateTime.Now)
                .OrderBy(p => p.DueDate)
                .Take(2) // Bir sonraki kira ve aidat
                .Select(p =>
                {
                    // Gecikme kontrolü
                    var isDelayed = p.DueDate < DateTime.Now;
                    var delayedDays = isDelayed ? (DateTime.Now - p.DueDate).Days : 0;
                    var penaltyAmount = isDelayed ? CalculatePenalty(p.Amount, delayedDays) : 0;
                    var totalAmount = p.Amount + penaltyAmount;

                    return new PaymentDto
                    {
                        Id = p.Id,
                        UserId = tenant.Id,
                        UserFullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                        PaymentType = p.PaymentType,
                        Amount = p.Amount,
                        PaymentDate = p.PaymentDate,
                        DueDate = p.DueDate,
                        IsPaid = p.IsPaid,
                        Description = p.Description,
                        DelayedDays = isDelayed ? delayedDays : null,
                        DelayPenaltyAmount = isDelayed ? penaltyAmount : null,
                        TotalAmount = totalAmount
                    };
                })
                .ToList();

            return payments;
        }

        public PaymentResultDto MakePayment(int tenantId, int paymentId, PaymentRequestDto paymentRequest)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            var payment = _paymentDal.Get(p => p.Id == paymentId && p.UserId == tenantId);
            if (payment == null)
                throw new KeyNotFoundException($"Payment with ID {paymentId} not found.");

            if (payment.IsPaid)
                throw new InvalidOperationException("This payment has already been made.");

            try
            {
                // Gecikme kontrolü ve ceza hesaplama
                var isDelayed = payment.DueDate < DateTime.Now;
                var delayedDays = isDelayed ? (DateTime.Now - payment.DueDate).Days : 0;
                var penaltyAmount = isDelayed ? CalculatePenalty(payment.Amount, delayedDays) : 0;
                var totalAmount = payment.Amount + penaltyAmount;

                // Ödeme bilgilerini güncelle
                payment.IsPaid = true;
                payment.PaymentDate = DateTime.Now;
                payment.DelayedDays = isDelayed ? delayedDays : null;
                payment.DelayPenaltyAmount = isDelayed ? penaltyAmount : null;
                payment.TotalAmount = totalAmount;
                payment.Description = $"{payment.Description} - {payment.PaymentType} ödemesi yapıldı - " +
                    $"{(isDelayed ? $"Gecikme: {delayedDays} gün, Ceza: {penaltyAmount} TL, " : "")}" +
                    $"Toplam: {totalAmount} TL - {DateTime.Now:dd/MM/yyyy}";

                _paymentDal.Update(payment);

                // Admin'e bildirim gönder
                var notification = new Notification
                {
                    Title = $"Yeni {GetPaymentTypeTurkish(payment.PaymentType)} Ödemesi",
                    Message = $"{tenant.FirstName} {tenant.LastName} tarafından {GetPaymentTypeTurkish(payment.PaymentType)} ödemesi yapıldı. " +
                        $"{(isDelayed ? $"Gecikme: {delayedDays} gün, Ceza: {penaltyAmount} TL, " : "")}" +
                        $"Toplam: {totalAmount} TL",
                    UserId = tenant.AdminId ?? 0,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };
                _notificationService.CreateNotificationAsync(notification);

                return new PaymentResultDto
                {
                    PaymentId = payment.Id,
                    Amount = payment.Amount,
                    PaymentDate = payment.PaymentDate,
                    PaymentType = payment.PaymentType,
                    IsSuccessful = true,
                    DelayedDays = delayedDays,
                    DelayPenaltyAmount = penaltyAmount,
                    TotalAmount = totalAmount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error making payment for tenant {TenantId}, payment {PaymentId}", tenantId, paymentId);
                throw;
            }
        }

        private decimal CalculatePenalty(decimal amount, int delayedDays)
        {
            // Günlük %0.1 ceza (örnek)
            return amount * (decimal)(delayedDays * 0.001);
        }

        private string GetPaymentTypeTurkish(string paymentType)
        {
            return paymentType.ToLower() switch
            {
                "rent" => "Kira",
                "dues" => "Aidat",
                _ => "Ödeme"
            };
        }

        public TenantActivitiesDto GetActivities(int tenantId)
        {
            var tenant = GetById(tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");

            var activities = new TenantActivitiesDto();

            // Ödeme geçmişi
            activities.PaymentHistory = _paymentDal.GetAll(p => p.UserId == tenantId && p.IsPaid)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentWithUserDto
                {
                    Id = p.Id,
                    UserId = tenant.Id,
                    UserFullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    DueDate = p.DueDate,
                    IsPaid = p.IsPaid,
                    Description = p.Description,
                    DelayedDays = p.DelayedDays,
                    DelayPenaltyAmount = p.DelayPenaltyAmount,
                    TotalAmount = p.TotalAmount
                })
                .ToList();

            // Bekleyen ödemeler
            activities.PendingPayments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                !p.IsPaid &&
                p.DueDate < DateTime.Now)
                .OrderBy(p => p.DueDate)
                .Select(p => new PaymentWithUserDto
                {
                    Id = p.Id,
                    UserId = tenant.Id,
                    UserFullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    DueDate = p.DueDate,
                    IsPaid = p.IsPaid,
                    Description = p.Description,
                    DelayedDays = (DateTime.Now - p.DueDate).Days,
                    DelayPenaltyAmount = CalculatePenalty(p.Amount, (DateTime.Now - p.DueDate).Days),
                    TotalAmount = p.Amount + CalculatePenalty(p.Amount, (DateTime.Now - p.DueDate).Days)
                })
                .ToList();

            // Yaklaşan ödemeler
            activities.UpcomingPayments = _paymentDal.GetAll(p =>
                p.UserId == tenantId &&
                !p.IsPaid &&
                p.DueDate >= DateTime.Now)
                .OrderBy(p => p.DueDate)
                .Select(p => new PaymentWithUserDto
                {
                    Id = p.Id,
                    UserId = tenant.Id,
                    UserFullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    DueDate = p.DueDate,
                    IsPaid = p.IsPaid,
                    Description = p.Description,
                    DelayedDays = null,
                    DelayPenaltyAmount = null,
                    TotalAmount = p.Amount
                })
                .ToList();

            // Toplantı geçmişi
            activities.MeetingHistory = _meetingService.GetMeetingsByTenantId(tenantId)
                .OrderByDescending(m => m.StartTime)
                .Select(m => new MeetingDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    StartTime = m.StartTime,
                    EndTime = m.EndTime,
                    Location = m.Location,
                    Status = m.Status,
                    CreatedAt = m.CreatedAt
                })
                .ToList();

            // Anket geçmişi
            activities.SurveyHistory = _surveyService.GetSurveysByTenantId(tenantId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new SurveyDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt
                })
                .ToList();

            // Şikayet geçmişi
            activities.ComplaintHistory = _complaintService.GetComplaintsByTenantId(tenantId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ComplaintDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToList();

            return activities;
        }

        public List<TenantListDto>? GetTenantsByBuilding(int buildingId)
        {
            try
            {
                // Önce binadaki tüm daireleri bul
                var apartments = _apartmentDal.GetAll(a => a.BuildingId == buildingId);
                if (apartments == null) return null;

                // Dairelerde oturan kiracıları bul
                var apartmentIds = apartments.Select(a => a.Id).ToList();
                var tenants = _tenantDal.GetAll(t => apartmentIds.Contains(t.ApartmentId));
                if (tenants == null) return null;

                // TenantListDto'ya dönüştür
                return tenants.Select(MapToTenantListDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tenants for building {BuildingId}", buildingId);
                return null;
            }
        }
    }
}
