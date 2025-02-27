using Core.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace Core.DataAccess
{
    public class EfEntityRepositoryBase<TEntity, TContext> : IEntityRepository<TEntity>
        where TEntity : class, IEntity, new()
        where TContext : DbContext
    {
        protected readonly TContext _context;

        public EfEntityRepositoryBase(TContext context)
        {
            _context = context;
        }

        public void Add(TEntity entity)
        {
            _context.Set<TEntity>().Add(entity);
            _context.SaveChanges();
        }

        public void Delete(TEntity entity)
        {
            _context.Set<TEntity>().Remove(entity);
            _context.SaveChanges();
        }

        public TEntity? Get(Expression<Func<TEntity, bool>> filter)
        {
            return _context.Set<TEntity>().FirstOrDefault(filter);
        }

        public List<TEntity> GetAll(Expression<Func<TEntity, bool>>? filter = null)
        {
            return filter != null
                ? _context.Set<TEntity>().Where(filter).ToList()
                : _context.Set<TEntity>().ToList();
        }

        public void Update(TEntity entity)
        {
            _context.Set<TEntity>().Update(entity);
            _context.SaveChanges();
        }

        // Async implementations
        public async Task<TEntity?> GetByIdAsync(int id)
        {
            return await _context.Set<TEntity>().FindAsync(id);
        }

        public async Task<TEntity?> GetAsync(Expression<Func<TEntity, bool>> filter)
        {
            try
            {
                return await _context.Set<TEntity>().FirstOrDefaultAsync(filter);
            }
            catch (InvalidOperationException ex) when (ex.InnerException is SqlException sqlEx && 
                                                      sqlEx.Message.Contains("Invalid column name"))
            {
                Console.WriteLine($"Database schema mismatch: {ex.Message}");
                return null;
            }
        }

        public async Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>>? filter = null)
        {
            try
            {
                return filter != null
                    ? await _context.Set<TEntity>().Where(filter).ToListAsync()
                    : await _context.Set<TEntity>().ToListAsync();
            }
            catch (InvalidOperationException ex) when (ex.InnerException is SqlException sqlEx && 
                                                      (sqlEx.Message.Contains("Invalid column name") || 
                                                       sqlEx.Message.Contains("doesn't exist")))
            {
                // Log the error
                Console.WriteLine($"Database schema mismatch: {ex.Message}");
                
                // Return empty list as fallback
                return new List<TEntity>();
            }
        }

        public async Task AddAsync(TEntity entity)
        {
            await _context.Set<TEntity>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TEntity entity)
        {
            _context.Set<TEntity>().Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TEntity entity)
        {
            _context.Set<TEntity>().Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
