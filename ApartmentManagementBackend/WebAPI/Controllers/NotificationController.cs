using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(INotificationService notificationService, ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetBuildingNotifications(int buildingId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _notificationService.GetBuildingNotificationsAsync(buildingId, page, pageSize);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("user/{userId}/unread")]
        public async Task<IActionResult> GetUnreadNotifications(int userId)
        {
            var result = await _notificationService.GetUnreadNotificationsAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("user/{userId}/unread/count")]
        public async Task<IActionResult> GetUnreadCount(int userId)
        {
            var result = await _notificationService.GetUnreadCountAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var result = await _notificationService.MarkAsReadAsync(notificationId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            var result = await _notificationService.MarkAllAsReadAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NotificationCreateDto notificationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _notificationService.CreateBuildingNotificationsAsync(notificationDto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _notificationService.DeleteNotificationAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}