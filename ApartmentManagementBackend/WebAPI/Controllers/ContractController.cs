using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Core.Utilities.Results;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractController(IContractService contractService)
        {
            _contractService = contractService;
        }

        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetContractSummary(int id)
        {
            var result = await _contractService.GetContractSummaryAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("expiring")]
        public async Task<IActionResult> GetExpiringContracts([FromQuery] int monthsThreshold = 2)
        {
            var result = await _contractService.GetExpiringContractsAsync(monthsThreshold);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Diğer endpoint'ler...
    }
} 