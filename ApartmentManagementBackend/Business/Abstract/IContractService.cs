using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Utilities.Results;
using Entities.DTOs;
namespace Business.Abstract
{
    public interface IContractService
    {
        Task<ApiResponse<ContractDto>> GetByIdAsync(int id);
        Task<ApiResponse<List<ContractDto>>> GetAllAsync();
        Task<ApiResponse<List<ContractDto>>> GetExpiringContractsAsync(int monthsThreshold = 2);
        Task<ApiResponse<ContractDto>> AddAsync(ContractDto contractDto);
        Task<ApiResponse<ContractDto>> UpdateAsync(ContractDto contractDto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
        Task<ApiResponse<ContractSummaryDto>> GetContractSummaryAsync(int contractId);
    }
}