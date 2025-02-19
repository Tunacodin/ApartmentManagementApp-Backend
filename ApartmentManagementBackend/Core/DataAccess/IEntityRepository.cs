using Core.Concrete;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Core.DataAccess
{
    public interface IEntityRepository<T> where T : class, IEntity
    {
        // Sync methods
        T? Get(Expression<Func<T, bool>> filter);
        List<T>? GetAll(Expression<Func<T, bool>>? filter = null);
        void Add(T entity);
        void Update(T entity);
        void Delete(T entity);

        // Async methods
        Task<T?> GetByIdAsync(int id);
        Task<T?> GetAsync(Expression<Func<T, bool>> filter);
        Task<List<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }
}
