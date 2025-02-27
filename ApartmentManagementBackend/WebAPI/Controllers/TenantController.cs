using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.DTOs;
using Microsoft.Extensions.Logging;
using FluentValidation;
using Core.Utilities.Results;
using Core.Constants;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;
        private readonly ILogger<TenantController> _logger;
        private readonly IValidator<TenantDto> _validator;

        public TenantController(ITenantService tenantService, ILogger<TenantController> logger, IValidator<TenantDto> validator)
        {
            _tenantService = tenantService;
            _logger = logger;
            _validator = validator;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var tenants = _tenantService.GetAllTenants();
            if (tenants == null || !tenants.Any())
            {
                return NotFound(ApiResponse<List<TenantListDto>>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<List<TenantListDto>>.SuccessResult(Messages.TenantsRetrieved, tenants));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var tenant = _tenantService.GetTenantById(id);
            if (tenant == null)
            {
                return NotFound(ApiResponse<TenantDetailDto>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<TenantDetailDto>.SuccessResult(Messages.TenantRetrieved, tenant));
        }

        [HttpGet("{id}/payments")]
        public IActionResult GetTenantPayments(int id)
        {
            var payments = _tenantService.GetTenantPayments(id);
            if (payments == null)
            {
                return NotFound(ApiResponse<List<PaymentHistoryDto>>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<List<PaymentHistoryDto>>.SuccessResult(Messages.PaymentsListed, payments));
        }

        [HttpGet("{id}/with-payments")]
        public IActionResult GetTenantWithPayments(int id)
        {
            var tenant = _tenantService.GetTenantWithPayments(id);
            if (tenant == null)
            {
                return NotFound(ApiResponse<TenantWithPaymentsDto>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<TenantWithPaymentsDto>.SuccessResult(Messages.TenantRetrieved, tenant));
        }

        [HttpPost]
        public IActionResult Add([FromBody] TenantDto tenantDto)
        {
            var validationResult = _validator.Validate(tenantDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<List<string>>.ErrorResult(Messages.ValidationFailed));
            }

            _tenantService.AddFromDto(tenantDto);
            return CreatedAtAction(nameof(GetById), new { id = tenantDto.Id },
                ApiResponse<TenantDto>.SuccessResult(Messages.TenantAdded, tenantDto));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] TenantDto tenantDto)
        {
            if (tenantDto.Id != id)
            {
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.TenantIdMismatch));
            }

            var validationResult = _validator.Validate(tenantDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<List<string>>.ErrorResult(Messages.ValidationFailed));
            }

            _tenantService.UpdateFromDto(tenantDto);
            return Ok(ApiResponse<TenantDto>.SuccessResult(Messages.TenantUpdated, tenantDto));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _tenantService.Delete(id);
            return Ok(ApiResponse<string>.SuccessResult(Messages.TenantDeleted, "Tenant deleted successfully"));
        }
    }
}
