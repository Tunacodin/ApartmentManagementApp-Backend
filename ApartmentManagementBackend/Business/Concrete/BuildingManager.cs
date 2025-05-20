using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;


namespace Business.Concrete
{
    public class BuildingManager : IBuildingService
    {
        private readonly IBuildingDal _buildingDal;
        private readonly ILogger<BuildingManager> _logger;

        public BuildingManager(IBuildingDal buildingDal, ILogger<BuildingManager> logger)
        {
            _buildingDal = buildingDal;
            _logger = logger;
        }

        public void Add(Building building)
        {
            try
            {
                if (building == null)
                    throw new ArgumentNullException(nameof(building));

                // Zorunlu alanların kontrolü
                if (string.IsNullOrEmpty(building.BuildingName))
                    throw new ArgumentException("Bina adı boş olamaz.");

                if (building.NumberOfFloors <= 0)
                    throw new ArgumentException("Kat sayısı 0'dan büyük olmalıdır.");

                if (building.TotalApartments <= 0)
                    throw new ArgumentException("Toplam daire sayısı 0'dan büyük olmalıdır.");

                // Adres bilgilerinin kontrolü
                if (string.IsNullOrEmpty(building.City) || string.IsNullOrEmpty(building.District))
                    throw new ArgumentException("Şehir ve ilçe bilgileri zorunludur.");

                _buildingDal.Add(building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding building: {ex.Message}");
                throw;
            }
        }

        public void Update(Building building)
        {
            try
            {
                if (building == null || building.Id <= 0)
                    throw new ArgumentException("Geçersiz bina bilgisi.");

                _buildingDal.Update(building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating building: {ex.Message}");
                throw;
            }
        }

        public void Delete(int id)
        {
            try
            {
                var building = _buildingDal.Get(b => b.Id == id);
                if (building == null)
                    throw new KeyNotFoundException($"ID {id} olan bina bulunamadı.");

                _buildingDal.Delete(building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting building: {ex.Message}");
                throw;
            }
        }

        public Building GetById(int id)
        {
            try
            {
                var building = _buildingDal.Get(b => b.Id == id);
                if (building == null)
                    throw new KeyNotFoundException($"ID {id} olan bina bulunamadı.");

                return building;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting building by id: {ex.Message}");
                throw;
            }
        }

        public List<Building> GetAll()
        {
            try
            {
                var buildings = _buildingDal.GetAll();
                return buildings ?? new List<Building>();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting all buildings: {ex.Message}");
                throw;
            }
        }

        // Async metodlar
        public async Task<ApiResponse<Building>> GetByIdAsync(int id)
        {
            try
            {
                var building = await _buildingDal.GetByIdAsync(id);
                if (building == null)
                    return ApiResponse<Building>.ErrorResult(Messages.BuildingNotFound);

                return ApiResponse<Building>.SuccessResult(Messages.BuildingRetrieved, building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting building by id async: {ex.Message}");
                return ApiResponse<Building>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<Building>>> GetAllAsync()
        {
            try
            {
                var buildings = await _buildingDal.GetAllAsync();
                if (buildings == null || buildings.Count == 0)
                    return ApiResponse<List<Building>>.ErrorResult(Messages.BuildingNotFound);

                return ApiResponse<List<Building>>.SuccessResult(Messages.BuildingsListed, buildings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting all buildings async: {ex.Message}");
                return ApiResponse<List<Building>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Building>> AddAsync(Building building)
        {
            try
            {
                if (building == null)
                    return ApiResponse<Building>.ErrorResult("Bina bilgileri boş olamaz");

                // Zorunlu alanların kontrolü
                if (string.IsNullOrEmpty(building.BuildingName))
                    return ApiResponse<Building>.ErrorResult("Bina adı boş olamaz.");

                if (building.NumberOfFloors <= 0)
                    return ApiResponse<Building>.ErrorResult("Kat sayısı 0'dan büyük olmalıdır.");

                if (building.TotalApartments <= 0)
                    return ApiResponse<Building>.ErrorResult("Toplam daire sayısı 0'dan büyük olmalıdır.");

                // Adres bilgilerinin kontrolü
                if (string.IsNullOrEmpty(building.City) || string.IsNullOrEmpty(building.District))
                    return ApiResponse<Building>.ErrorResult("Şehir ve ilçe bilgileri zorunludur.");

                await _buildingDal.AddAsync(building);
                return ApiResponse<Building>.SuccessResult(Messages.BuildingAdded, building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding building async: {ex.Message}");
                return ApiResponse<Building>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Building>> UpdateAsync(Building building)
        {
            try
            {
                if (building == null || building.Id <= 0)
                    return ApiResponse<Building>.ErrorResult("Geçersiz bina bilgisi");

                await _buildingDal.UpdateAsync(building);
                return ApiResponse<Building>.SuccessResult(Messages.BuildingUpdated, building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating building async: {ex.Message}");
                return ApiResponse<Building>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            try
            {
                var building = await _buildingDal.GetByIdAsync(id);
                if (building == null)
                    return ApiResponse<bool>.ErrorResult(Messages.BuildingNotFound);

                await _buildingDal.DeleteAsync(building);
                return ApiResponse<bool>.SuccessResult(Messages.BuildingDeleted, true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting building async: {ex.Message}");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Building>> UpdateImageAsync(int id, string imageId, string imageUrl)
        {
            try
            {
                var building = await _buildingDal.GetByIdAsync(id);
                if (building == null)
                    return ApiResponse<Building>.ErrorResult(Messages.BuildingNotFound);

                building.ImageId = imageId;
                building.ImageUrl = imageUrl;
                await _buildingDal.UpdateAsync(building);

                return ApiResponse<Building>.SuccessResult(Messages.BuildingUpdated, building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating building image: {ex.Message}");
                return ApiResponse<Building>.ErrorResult(Messages.UnexpectedError);
            }
        }
    }
}
