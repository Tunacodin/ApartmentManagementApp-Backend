using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs.Reports;

namespace DataAccess.Abstract
{
    public interface IApartmentDal : IEntityRepository<Apartment>
    {
        Task<OccupancyRatesDto> GetOccupancyRatesAsync(int adminId);
    }
}