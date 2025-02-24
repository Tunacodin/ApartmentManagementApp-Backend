using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingService _meetingService;
        private readonly ILogger<MeetingController> _logger;

        public MeetingController(IMeetingService meetingService, ILogger<MeetingController> logger)
        {
            _meetingService = meetingService;
            _logger = logger;
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetBuildingMeetings(int buildingId)
        {
            var result = await _meetingService.GetBuildingMeetingsAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _meetingService.GetMeetingDetailAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("building/{buildingId}/upcoming")]
        public async Task<IActionResult> GetUpcomingMeetings(int buildingId)
        {
            var result = await _meetingService.GetUpcomingMeetingsAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Meeting meeting)
        {
            var result = await _meetingService.CreateMeetingAsync(meeting);
            if (!result.Success) return BadRequest(result);
            if (result.Data == null) return StatusCode(500, "Meeting data is null");
            
            return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id, [FromBody] string reason)
        {
            var result = await _meetingService.CancelMeetingAsync(id, reason);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _meetingService.DeleteMeetingAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("building/{buildingId}/upcoming/count")]
        public async Task<IActionResult> GetUpcomingMeetingsCount(int buildingId)
        {
            var result = await _meetingService.GetUpcomingMeetingsCountAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
} 