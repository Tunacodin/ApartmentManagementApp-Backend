using Business.Abstract;
using Business.Concrete;

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
