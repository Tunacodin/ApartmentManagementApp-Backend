using Business.Abstract;
using Entities.DTOs;
using DataAccess.Abstract;
using Core.Utilities.Results;
using Core.Constants;

namespace Business.Concrete
{
    public class ContractManager : IContractService
    {
        private readonly IContractDal _contractDal;
        private readonly IUserDal _userDal;
        private readonly IApartmentDal _apartmentDal;

        public ContractManager(IContractDal contractDal, IUserDal userDal, IApartmentDal apartmentDal)
        {
            _contractDal = contractDal;
            _userDal = userDal;
            _apartmentDal = apartmentDal;
        }

        public async Task<ApiResponse<ContractSummaryDto>> GetContractSummaryAsync(int contractId)
        {
            var contract = await _contractDal.GetAsync(c => c.Id == contractId);
            if (contract == null)
                return ApiResponse<ContractSummaryDto>.ErrorResult(Messages.ContractNotFound);

            var now = DateTime.Now;
            var totalMonths = ((contract.EndDate.Year - contract.StartDate.Year) * 12) + 
                             contract.EndDate.Month - contract.StartDate.Month;
            var currentMonth = ((now.Year - contract.StartDate.Year) * 12) + 
                             now.Month - contract.StartDate.Month + 1;
            var remainingMonths = ((contract.EndDate.Year - now.Year) * 12) + 
                                contract.EndDate.Month - now.Month;

            var summary = new ContractSummaryDto
            {
                ContractId = contract.Id,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate,
                CurrentMonth = currentMonth,
                TotalMonths = totalMonths,
                RemainingMonths = remainingMonths,
                IsExpiringSoon = remainingMonths <= 2,
                MonthlyRent = contract.RentAmount,
                TotalContractValue = contract.RentAmount * totalMonths,
                RemainingPayments = contract.RentAmount * remainingMonths,
                ContractStatus = GetContractStatus(contract.StartDate, contract.EndDate, contract.IsActive)
            };

            return ApiResponse<ContractSummaryDto>.SuccessResult(Messages.ContractSummaryRetrieved, summary);
        }

        private string GetContractStatus(DateTime startDate, DateTime endDate, bool isActive)
        {
            var now = DateTime.Now;
            if (!isActive) return Messages.ContractCancelled;
            if (now < startDate) return Messages.ContractNotStarted;
            if (now > endDate) return Messages.ContractExpired;
            if ((endDate - now).TotalDays <= 60) return Messages.ContractExpiringSoon;
            return Messages.ContractActive;
        }

        public async Task<ApiResponse<ContractDto>> GetByIdAsync(int id)
        {
            var contract = await _contractDal.GetAsync(c => c.Id == id);
            if (contract == null)
                return ApiResponse<ContractDto>.ErrorResult(Messages.ContractNotFound);

            var tenant = await _userDal.GetByIdAsync(contract.TenantId);
            var owner = await _userDal.GetByIdAsync(contract.OwnerId);
            var apartment = await _apartmentDal.GetByIdAsync(contract.ApartmentId);

            var contractDto = new ContractDto
            {
                Id = contract.Id,
                TenantId = contract.TenantId,
                OwnerId = contract.OwnerId,
                ApartmentId = contract.ApartmentId,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate,
                RentAmount = contract.RentAmount,
                ContractFile = contract.ContractFile,
                IsActive = contract.IsActive
            };

            return ApiResponse<ContractDto>.SuccessResult(Messages.ContractRetrieved, contractDto);
        }

        public async Task<ApiResponse<List<ContractDto>>> GetAllAsync()
        {
            var contracts = await _contractDal.GetAllAsync();
            var contractDtos = new List<ContractDto>();

            foreach (var contract in contracts)
            {
                var contractDto = (await GetByIdAsync(contract.Id)).Data;
                if (contractDto != null)
                    contractDtos.Add(contractDto);
            }

            return ApiResponse<List<ContractDto>>.SuccessResult(Messages.ContractsListed, contractDtos);
        }

        public async Task<ApiResponse<List<ContractDto>>> GetExpiringContractsAsync(int monthsThreshold = 2)
        {
            var endDate = DateTime.Now.AddMonths(monthsThreshold);
            var contracts = await _contractDal.GetAllAsync(c => c.EndDate <= endDate && c.IsActive);
            var contractDtos = new List<ContractDto>();

            foreach (var contract in contracts)
            {
                var contractDto = (await GetByIdAsync(contract.Id)).Data;
                if (contractDto != null)
                    contractDtos.Add(contractDto);
            }

            return ApiResponse<List<ContractDto>>.SuccessResult(Messages.ContractsListed, contractDtos);
        }

        public async Task<ApiResponse<ContractDto>> AddAsync(ContractDto contractDto)
        {
            var contract = new Contract
            {
                TenantId = contractDto.TenantId,
                OwnerId = contractDto.OwnerId,
                ApartmentId = contractDto.ApartmentId,
                StartDate = contractDto.StartDate,
                EndDate = contractDto.EndDate,
                RentAmount = contractDto.RentAmount,
                ContractFile = contractDto.ContractFile,
                IsActive = true
            };

            await _contractDal.AddAsync(contract);
            contractDto.Id = contract.Id;

            return ApiResponse<ContractDto>.SuccessResult(Messages.ContractAdded, contractDto);
        }

        public async Task<ApiResponse<ContractDto>> UpdateAsync(ContractDto contractDto)
        {
            var contract = await _contractDal.GetAsync(c => c.Id == contractDto.Id);
            if (contract == null)
                return ApiResponse<ContractDto>.ErrorResult(Messages.ContractNotFound);

            contract.RentAmount = contractDto.RentAmount;
            contract.StartDate = contractDto.StartDate;
            contract.EndDate = contractDto.EndDate;
            contract.ContractFile = contractDto.ContractFile;
            contract.IsActive = contractDto.IsActive;

            await _contractDal.UpdateAsync(contract);
            return ApiResponse<ContractDto>.SuccessResult(Messages.ContractUpdated, contractDto);
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var contract = await _contractDal.GetAsync(c => c.Id == id);
            if (contract == null)
                return ApiResponse<bool>.ErrorResult(Messages.ContractNotFound);

            await _contractDal.DeleteAsync(contract);
            return ApiResponse<bool>.SuccessResult(Messages.ContractDeleted, true);
        }
    }
} 