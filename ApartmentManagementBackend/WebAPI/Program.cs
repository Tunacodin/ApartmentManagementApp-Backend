using Business.Abstract;
using Business.Concrete;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Microsoft.EntityFrameworkCore;
using WebAPI.Middleware;
using Business.ValidationRules.FluentValidation;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Core.Utilities.Security.JWT;
using Core.Utilities.Security;
using AutoMapper;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddControllers();

// Add logging
builder.Services.AddLogging();

// FluentValidation configuration
builder.Services.AddFluentValidationAutoValidation()
                .AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<TenantDtoValidator>();

// Swagger/OpenAPI configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured in appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
            RequireExpirationTime = true
        };
    });

// JWT Helper servisini ekle
builder.Services.AddScoped<IJwtHelper, JwtHelper>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Dependency Injection (DI) Configuration
builder.Services.AddScoped<IAdminService, AdminManager>();
builder.Services.AddScoped<IAdminDal, EfAdminDal>();
builder.Services.AddScoped<IApartmentDal, EfApartmentDal>();
builder.Services.AddScoped<IUserDal, EfUserDal>();
builder.Services.AddScoped<IBuildingDal, EfBuildingDal>();
builder.Services.AddScoped<ITenantDal, EfTenantDal>();
builder.Services.AddScoped<INotificationDal, EfNotificationDal>();
builder.Services.AddScoped<IMeetingDal, EfMeetingDal>();
builder.Services.AddScoped<IPaymentDal, EfPaymentDal>();
builder.Services.AddScoped<IOwnerDal, EfOwnerDal>();
builder.Services.AddScoped<IComplaintDal, EfComplaintDal>();
builder.Services.AddScoped<IComplaintService, ComplaintManager>();
builder.Services.AddScoped<ISurveyDal, EfSurveyDal>();
builder.Services.AddScoped<ISurveyService, SurveyManager>();
builder.Services.AddScoped<IContractDal, EfContractDal>();
builder.Services.AddScoped<IContractService, ContractManager>();

builder.Services.AddScoped<IUserService, UserManager>();
builder.Services.AddScoped<IUserProfileService, UserProfileManager>();
builder.Services.AddScoped<IBuildingService, BuildingManager>();
builder.Services.AddScoped<ITenantService, TenantManager>();
builder.Services.AddScoped<INotificationService, NotificationManager>();
builder.Services.AddScoped<IMeetingService, MeetingManager>();
builder.Services.AddScoped<IPaymentService, PaymentManager>();
builder.Services.AddScoped<IOwnerService, OwnerManager>();
builder.Services.AddScoped<IApartmentService, ApartmentManager>();
builder.Services.AddScoped<IAdminReportsService, AdminReportsManager>();
builder.Services.AddScoped<IFinanceService, FinanceManager>();
builder.Services.AddScoped<IReportDal, EfReportDal>();
builder.Services.AddScoped<IReportService, ReportManager>();

// AutoMapper Configuration
builder.Services.AddAutoMapper(typeof(Program));

// DbContext Configuration
builder.Services.AddDbContext<ApartmentManagementDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// CORS politikasını ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Hata detaylarını geliştirme ortamında göster
    app.UseSwagger();
    app.UseSwaggerUI();

}

// CORS middleware'ini ekle
app.UseCors("AllowAll");

// Diğer middleware'ler
app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthentication(); // JWT authentication middleware'ini ekle
app.UseAuthorization();

app.MapControllers();

// Add ExceptionMiddleware
app.UseMiddleware<ExceptionMiddleware>();

app.Run();
