using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Core.Utilities.Results;
using Core.Constants;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardInfoController : ControllerBase
    {
        private readonly ICardInfoService _cardInfoService;
        private readonly ILogger<CardInfoController> _logger;

        public CardInfoController(ICardInfoService cardInfoService, ILogger<CardInfoController> logger)
        {
            _cardInfoService = cardInfoService;
            _logger = logger;
        }

        // Get all cards for a user
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAllByUserId(int userId)
        {
            try
            {
                _logger.LogInformation($"Getting all cards for user ID: {userId}");
                var result = await _cardInfoService.GetAllByUserIdAsync(userId);

                if (!result.Success)
                {
                    _logger.LogWarning($"No cards found for user ID: {userId}");
                    return NotFound(result);
                }

                // Kart numaralarının son 4 hanesi hariç maskeleme
                foreach (var card in result.Data)
                {
                    if (card.CardNumber?.Length >= 4)
                    {
                        card.CardNumber = "************" + card.CardNumber.Substring(card.CardNumber.Length - 4);
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting cards for user {userId}: {ex.Message}");
                return BadRequest(ApiResponse<CardInfo>.ErrorResult(Messages.UnexpectedError));
            }
        }

        // Get card by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                _logger.LogInformation($"Getting card details for ID: {id}");
                var result = await _cardInfoService.GetByIdAsync(id);

                if (!result.Success || result.Data == null)
                {
                    _logger.LogWarning($"Card not found with ID: {id}");
                    return NotFound(result);
                }

                // Kart numarasının son 4 hanesi hariç maskeleme
                if (result.Data?.CardNumber?.Length >= 4)
                {
                    result.Data.CardNumber = "************" + result.Data.CardNumber.Substring(result.Data.CardNumber.Length - 4);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting card {id}: {ex.Message}");
                return BadRequest(ApiResponse<CardInfo>.ErrorResult(Messages.UnexpectedError));
            }
        }

        // Add a new card
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] CardInfo cardInfo)
        {
            try
            {
                if (cardInfo == null)
                {
                    return BadRequest(ApiResponse<CardInfo>.ErrorResult("Kart bilgileri boş olamaz."));
                }

                // Kart numarası validasyonu
                if (string.IsNullOrEmpty(cardInfo.CardNumber) || cardInfo.CardNumber.Length != 16)
                {
                    return BadRequest(ApiResponse<CardInfo>.ErrorResult("Kart numarası 16 haneli olmalıdır."));
                }

                var result = await _cardInfoService.AddAsync(cardInfo);
                if (!result.Success || result.Data == null)
                {
                    return BadRequest(result);
                }

                // Yanıtta kart numarasını maskele
                result.Data.CardNumber = "************" + result.Data.CardNumber.Substring(12);

                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding card: {ex.Message}");
                return BadRequest(ApiResponse<CardInfo>.ErrorResult(Messages.UnexpectedError));
            }
        }

        // Delete a card
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var cardResult = await _cardInfoService.GetByIdAsync(id);
                if (!cardResult.Success || cardResult.Data == null)
                {
                    _logger.LogWarning($"Card not found with ID: {id}");
                    return NotFound(cardResult);
                }

                var result = await _cardInfoService.DeleteAsync(cardResult.Data);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting card {id}: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
}
