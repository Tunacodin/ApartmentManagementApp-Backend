using Core.Utilities.Results;
using Entities.Concrete;


namespace Business.Abstract
{
    public interface IBuildingService
    {
        // Sync methods
        List<Building> GetAll();
        Building GetById(int id);
        void Add(Building building);
        void Update(Building building);
        void Delete(int id);

        // Async methods
        Task<ApiResponse<List<Building>>> GetAllAsync();
        Task<ApiResponse<Building>> GetByIdAsync(int id);
        Task<ApiResponse<Building>> AddAsync(Building building);
        Task<ApiResponse<Building>> UpdateAsync(Building building);
        Task<ApiResponse<bool>> DeleteAsync(int id);
        Task<ApiResponse<Building>> UpdateImageAsync(int id, string imageId, string imageUrl);
    }
}
