using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfBuildingDal : EfEntityRepositoryBase<Building, ApartmentManagementDbContext>, IBuildingDal
    {
        public EfBuildingDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        public async Task<Building?> GetByIdAsync(int id)
        {
            return await _context.Buildings.FindAsync(id);
        }

        public async Task UpdateAsync(Building building)
        {
            _context.Buildings.Update(building);
            await _context.SaveChangesAsync();
        }
    }
}
