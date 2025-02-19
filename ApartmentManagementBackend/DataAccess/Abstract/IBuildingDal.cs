using Core.DataAccess;
using Entities.Concrete;

namespace DataAccess.Abstract
{
    public interface IBuildingDal : IEntityRepository<Building>
    {
        Task<Building?> GetByIdAsync(int id);
        Task UpdateAsync(Building building);
        // Özel sorgular için metotlar eklenebilir
    }
}
