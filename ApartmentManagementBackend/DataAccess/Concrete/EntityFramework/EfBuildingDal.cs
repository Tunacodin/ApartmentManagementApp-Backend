using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfBuildingDal : EfEntityRepositoryBase<Building, ApartmentManagementDbContext>, IBuildingDal
    {
        public EfBuildingDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        public new async Task<Building?> GetByIdAsync(int id)
        {
            return await _context.Buildings.FindAsync(id);
        }

        public new async Task UpdateAsync(Building building)
        {
            _context.Buildings.Update(building);
            await _context.SaveChangesAsync();
        }

        public async Task<OccupancyRatesDto> GetOccupancyRatesAsync(int adminId)
        {
            return await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => new OccupancyRatesDto
                {
                    TotalApartments = b.TotalApartments,
                    OccupiedApartments = _context.Apartments.Count(a => a.BuildingId == b.Id && a.Status == "Occupied"),
                    OccupancyRate = (decimal)_context.Apartments.Count(a => a.BuildingId == b.Id && a.Status == "Occupied") / b.TotalApartments * 100
                })
                .FirstOrDefaultAsync() ?? new OccupancyRatesDto();
        }
    }
}
