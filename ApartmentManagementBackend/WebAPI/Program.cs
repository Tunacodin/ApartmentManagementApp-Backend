using Business.Abstract;
using Business.Concrete;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Swagger/OpenAPI yapýlandýrmasý
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Dependency Injection (DI) Konfigürasyonu
builder.Services.AddScoped<IUserService, UserManager>();
builder.Services.AddScoped<IUserDal, EfUserDal>();
builder.Services.AddScoped<IAdminService, AdminManager>();
builder.Services.AddScoped<ITenantService, TenantManager>();
builder.Services.AddScoped<ITenantDal,EfTenantDal>(); 
builder.Services.AddScoped<IBuildingService, BuildingManager>();    
builder.Services.AddScoped<IBuildingDal,EfBuildingDal>();
builder.Services.AddScoped<ICardInfoService, CardInfoManager>();
builder.Services.AddScoped<ICardInfoDal,EfCardInfoDal>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Hata detaylarýný geliþtirme ortamýnda göster
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
