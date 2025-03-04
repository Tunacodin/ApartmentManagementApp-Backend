using Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class ApartmentManagementDbContext : DbContext
    {
        public ApartmentManagementDbContext(DbContextOptions<ApartmentManagementDbContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=LAPTOP-0I24A1AJ\\SQLEXPRESS;Database=ApartmentManagement;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Owner> Owners { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Security> Securities { get; set; }
        public DbSet<Building> Buildings { get; set; }
        public DbSet<Apartment> Apartments { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<CardInfo> CardInfos { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<Survey> Surveys { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User ve türetilmiş sınıflar için TPH konfigürasyonu
            modelBuilder.Entity<User>()
                .HasDiscriminator<string>("Role")
                .HasValue<Admin>("admin")
                .HasValue<Owner>("owner")
                .HasValue<Tenant>("tenant")
                .HasValue<Security>("security");

            // Owner için ek alanlar
            modelBuilder.Entity<Owner>().Property(o => o.IBAN);
            modelBuilder.Entity<Owner>().Property(o => o.BankName);

            // İlişkiler
            modelBuilder.Entity<Building>()
                .HasOne<Admin>()
                .WithMany()
                .HasForeignKey(b => b.AdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Apartment>()
                .HasOne<Building>()
                .WithMany()
                .HasForeignKey(a => a.BuildingId)
                .OnDelete(DeleteBehavior.Restrict);

            // Tenant ve Apartment ilişkisi
            modelBuilder.Entity<Tenant>()
                .HasOne<Apartment>()
                .WithMany()
                .HasForeignKey(t => t.ApartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment ve Apartment ilişkisi
            modelBuilder.Entity<Payment>()
                .HasOne<Apartment>()
                .WithMany()
                .HasForeignKey(p => p.ApartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne<Tenant>()
                .WithMany()
                .HasForeignKey(c => c.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne<Owner>()
                .WithMany()
                .HasForeignKey(c => c.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // CardInfo ve Payment ilişkisi
            modelBuilder.Entity<Payment>()
                .HasOne<CardInfo>()
                .WithMany()
                .HasForeignKey(p => p.CardInfoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne<Admin>()
                .WithMany()
                .HasForeignKey(n => n.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            // Index tanımlamaları
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Building>()
                .HasIndex(b => b.BuildingName);

            modelBuilder.Entity<Apartment>()
                .HasIndex(a => new { a.BuildingId, a.UnitNumber })
                .IsUnique();

            // CardInfo için index
            modelBuilder.Entity<CardInfo>()
                .HasIndex(c => new { c.UserId, c.CardNumber })
                .IsUnique();

            // Decimal property'ler için hassasiyet tanımlamaları
            modelBuilder.Entity<Contract>()
                .Property(c => c.RentAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Apartment>()
                .Property(a => a.DepositAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Apartment>()
                .Property(a => a.RentAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Building>()
                .Property(b => b.DuesAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Building>()
                .Property(b => b.OccupancyRate)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CardInfo>()
                .Property(c => c.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Tenant>()
                .Property(t => t.MonthlyDues)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Survey>()
                .HasOne<Building>()
                .WithMany()
                .HasForeignKey(s => s.BuildingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Survey>()
                .HasOne<Admin>()
                .WithMany()
                .HasForeignKey(s => s.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
