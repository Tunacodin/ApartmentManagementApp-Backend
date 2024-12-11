using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace DataAccess.Concrete.EntityFramework
{
    //EntityFramework ORM dir bu sayede veritabanı tablolarını class gibi işleyebiliriz
    public class EfUserDal : IUserDal
    {
        public void Add(User entity)
        {
            using (var context = new ApartmentManagementDbContext())
            {
                context.Users.Add(entity);
                context.SaveChanges();
            }
        }

        public void Delete(User entity)
        {
            using (var context = new ApartmentManagementDbContext())
            {
                context.Users.Remove(entity);
                context.SaveChanges();
            }
        }

        public User Get(Expression<Func<User, bool>> filter)
        {
            using (var context = new ApartmentManagementDbContext())
            {
                return context.Users.SingleOrDefault(filter);
            }
        }

        public List<User> GetAll(Expression<Func<User, bool>> filter = null)
        {
            using (var context = new ApartmentManagementDbContext())
            {
                return filter == null
                    ? context.Users.ToList()
                    : context.Users.Where(filter).ToList();
            }
        }

        public void Update(User entity)
        {
            using (var context = new ApartmentManagementDbContext())
            {
                context.Users.Update(entity);
                context.SaveChanges();
            }
        }
    }
}
