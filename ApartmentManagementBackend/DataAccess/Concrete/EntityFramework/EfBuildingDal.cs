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
            var buildings = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .ToListAsync();

            if (!buildings.Any())
                return new OccupancyRatesDto();

            var totalApartments = buildings.Sum(b => b.TotalApartments);
            
            var buildingOccupancies = new List<BuildingOccupancyDto>();
            
            foreach (var building in buildings)
            {
                var occupiedCount = await _context.Apartments
                    .CountAsync(a => a.BuildingId == building.Id && a.IsOccupied);
                    
                buildingOccupancies.Add(new BuildingOccupancyDto
                {
                    BuildingId = building.Id,
                    BuildingName = building.BuildingName,
                    TotalApartments = building.TotalApartments,
                    OccupiedApartments = occupiedCount,
                    OccupancyRate = building.TotalApartments > 0 
                        ? ((decimal)occupiedCount / building.TotalApartments) * 100 
                        : 0
                });
            }

            var totalOccupied = buildingOccupancies.Sum(b => b.OccupiedApartments);

            return new OccupancyRatesDto
            {
                TotalApartments = totalApartments,
                OccupiedApartments = totalOccupied,
                OccupancyRate = totalApartments > 0 
                    ? ((decimal)totalOccupied / totalApartments) * 100 
                    : 0,
                BuildingOccupancies = buildingOccupancies
            };
        }
    }
}
