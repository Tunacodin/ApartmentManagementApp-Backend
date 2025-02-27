using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs.Reports;


namespace DataAccess.Abstract
{
    public interface IBuildingDal : IEntityRepository<Building>
    {
        Task<OccupancyRatesDto> GetOccupancyRatesAsync(int adminId);
    }
}
