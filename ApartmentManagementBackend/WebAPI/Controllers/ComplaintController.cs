using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComplaintController : ControllerBase
    {
        private readonly IComplaintService _complaintService;
        private readonly ILogger<ComplaintController> _logger;

        public ComplaintController(IComplaintService complaintService, ILogger<ComplaintController> logger)
        {
            _complaintService = complaintService;
            _logger = logger;
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetBuildingComplaints(int buildingId)
        {
            var result = await _complaintService.GetBuildingComplaintsAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _complaintService.GetComplaintDetailAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserComplaints(int userId)
        {
            var result = await _complaintService.GetUserComplaintsAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Complaint complaint)
        {
            var result = await _complaintService.CreateComplaintAsync(complaint);
            if (result.Data == null) return StatusCode(500, "Complaint data is null");

            return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
        }

        [HttpPost("{id}/resolve")]
        public async Task<IActionResult> Resolve(int id, [FromQuery] int adminId)
        {
            var result = await _complaintService.ResolveComplaintAsync(id, adminId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _complaintService.DeleteComplaintAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("building/{buildingId}/active/count")]
        public async Task<IActionResult> GetActiveComplaintsCount(int buildingId)
        {
            var result = await _complaintService.GetActiveComplaintsCountAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
} 