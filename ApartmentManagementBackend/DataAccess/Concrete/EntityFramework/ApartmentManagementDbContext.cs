using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using Microsoft.Exchange.WebServices.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class ApartmentManagementDbContext:DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=LAPTOP-0I24A1AJ\\SQLEXPRESS;Database=ApartmentManagement;Trusted_Connection=True;TrustServerCertificate=True;");


        }

        public DbSet<User> Users { get; set; }
        public DbSet<Tenant> Tenants { get; set; }

        public DbSet<Building> Buildings { get; set; }

        public DbSet<CardInfo> CardInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CardInfo>(entity =>
            {
                entity.HasKey(e => e.CardId); // Specify CardId as the primary key
            });
        }


    }
}
