using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IApartmentService
    {
        void Add(Apartment apartment);
        void Update(Apartment apartment);
        void Delete(int id);
        Apartment? Get(Expression<Func<Apartment, bool>> filter);
        List<Apartment>? GetAll();
        List<Apartment>? GetByBuildingId(int buildingId);
        List<Apartment>? GetByOwnerId(int ownerId);
        // Async methods
        Task<ApiResponse<List<ApartmentListDto>>> GetAllAsync();
        Task<ApiResponse<ApartmentDetailDto>> GetByIdAsync(int id);
        Task<ApiResponse<List<ApartmentListDto>>> GetByBuildingIdAsync(int buildingId);
        Task<ApiResponse<List<ApartmentListDto>>> GetByOwnerIdAsync(int ownerId);
        Task<ApiResponse<ApartmentDto>> AddAsync(ApartmentDto apartmentDto);
        Task<ApiResponse<ApartmentDto>> UpdateAsync(ApartmentDto apartmentDto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
    }

}