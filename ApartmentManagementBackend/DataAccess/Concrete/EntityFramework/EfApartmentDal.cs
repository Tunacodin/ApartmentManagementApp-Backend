using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Entities.DTOs.Reports;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfApartmentDal : EfEntityRepositoryBase<Apartment, ApartmentManagementDbContext>, IApartmentDal
    {
        public EfApartmentDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        public async Task<OccupancyRatesDto> GetOccupancyRatesAsync(int adminId)
        {
            var totalUnits = await _context.Apartments
                .CountAsync(a => a.BuildingId == adminId);
            var occupiedUnits = await _context.Apartments
                .CountAsync(a => a.BuildingId == adminId && a.IsOccupied);
            
            return new OccupancyRatesDto
            {
                TotalUnits = totalUnits,
                OccupiedUnits = occupiedUnits,
                VacantUnits = totalUnits - occupiedUnits,
                Percentage = totalUnits > 0 ? (double)occupiedUnits / totalUnits * 100 : 0
            };
        }
    }
}