using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;

        public TenantController(ITenantService tenantService)
        {
            _tenantService = tenantService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var tenants = _tenantService.GetAll();
            if (tenants == null || tenants.Count == 0)
            {
                return NotFound("No tenants found.");
            }
            return Ok(tenants);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var tenant = _tenantService.GetById(id);
            if (tenant == null)
            {
                return NotFound($"Tenant with ID {id} not found.");
            }
            return Ok(tenant);
        }

        [HttpPost]
        public IActionResult Add([FromBody] Tenant tenant)
        {
            if (tenant == null)
            {
                return BadRequest("Tenant data is null.");
            }
            _tenantService.Add(tenant);
            return Ok("Tenant added successfully.");
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Tenant tenant)
        {
            if (tenant == null || tenant.TenantId != id)
            {
                return BadRequest("Tenant data is invalid or ID mismatch.");
            }
            _tenantService.Update(tenant);
            return Ok("Tenant updated successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _tenantService.Delete(id);
            return Ok("Tenant deleted successfully.");
        }
    }
}
