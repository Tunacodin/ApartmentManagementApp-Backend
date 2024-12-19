using Core.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Core.DataAccess
{
    public class EfEntityRepositoryBase<TEntity, TContext> : IEntityRepository<TEntity>

        where TEntity : class, IEntity, new()
        where TContext : DbContext, new()
    {
        public async Task AddAsync(TEntity entity)
        {
            await using var context = new TContext();
            context.Entry(entity).State = EntityState.Added;
            await context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TEntity entity)
        {

            await using var context = new TContext();
            context.Entry(entity).State = EntityState.Deleted;
            await context.SaveChangesAsync();

        }

        public async Task<TEntity> GetAsync(Expression<Func<TEntity, bool>> filter)
        {
            await using var context = new TContext();
            return await context.Set<TEntity>().SingleOrDefaultAsync(filter);
        }

        public async Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>> filter = null)
        {
            await using var context = new TContext();
            return filter == null
                ? await context.Set<TEntity>().ToListAsync()
                : await context.Set<TEntity>().Where(filter).ToListAsync();
        }

        public async Task UpdateAsync(TEntity entity)
        {
            await using var context = new TContext();
            context.Entry(entity).State = EntityState.Modified;
            await context.SaveChangesAsync();
        }

        public void Add(TEntity entity)
        {
            using var context = new TContext();
            context.Entry(entity).State = EntityState.Added;
            context.SaveChanges();
        }

        public void Delete(TEntity entity)
        {
            using var context = new TContext();
            context.Entry(entity).State = EntityState.Deleted;
            context.SaveChanges();
        }

        public TEntity Get(Expression<Func<TEntity, bool>> filter)
        {
            using var context = new TContext();
            return context.Set<TEntity>().SingleOrDefault(filter);
        }

        public List<TEntity> GetAll(Expression<Func<TEntity, bool>> filter = null)
        {
            using var context = new TContext();
            return filter == null
                ? context.Set<TEntity>().ToList()
                : context.Set<TEntity>().Where(filter).ToList();
        }

        public void Update(TEntity entity)
        {
            using var context = new TContext();
            context.Entry(entity).State = EntityState.Modified;
            context.SaveChanges();
        }
    }
}
