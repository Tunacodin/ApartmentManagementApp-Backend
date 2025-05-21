using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Entities.DTOs;
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

        // Toplantı listeleme ve detay görüntüleme
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

        [HttpGet("building/{buildingId}/upcoming/count")]
        public async Task<IActionResult> GetUpcomingMeetingsCount(int buildingId)
        {
            var result = await _meetingService.GetUpcomingMeetingsCountAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Toplantı oluşturma
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MeetingCreateDto meetingDto)
        {
            var result = await _meetingService.CreateMeetingAsync(meetingDto);
            if (!result.Success) return BadRequest(result);
            if (result.Data == null) return StatusCode(500, "Meeting data is null");

            return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
        }

        // Toplantı iptal etme
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id, [FromBody] MeetingCancellationDto cancellationDto)
        {
            if (string.IsNullOrWhiteSpace(cancellationDto?.Reason))
            {
                return BadRequest(new { message = "İptal nedeni gereklidir." });
            }

            var result = await _meetingService.CancelMeetingAsync(id, cancellationDto.Reason);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Toplantı silme
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _meetingService.DeleteMeetingAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Katılımcı yönetimi
        [HttpPost("{id}/participants")]
        public async Task<IActionResult> AddParticipants(int id, [FromBody] List<int> participantIds)
        {
            if (participantIds == null || !participantIds.Any())
            {
                return BadRequest(new { message = "En az bir katılımcı ID'si gereklidir." });
            }

            var result = await _meetingService.AddParticipantsAsync(id, participantIds);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}/participants/{participantId}")]
        public async Task<IActionResult> RemoveParticipant(int id, int participantId)
        {
            var result = await _meetingService.RemoveParticipantAsync(id, participantId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}/participants")]
        public async Task<IActionResult> GetParticipants(int id)
        {
            var result = await _meetingService.GetParticipantsAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}