using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using System.Collections.Generic;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardInfoController : ControllerBase
    {
        private readonly ICardInfoService _cardInfoService;

        public CardInfoController(ICardInfoService cardInfoService)
        {
            _cardInfoService = cardInfoService;
        }

        // Get all cards for a user
        [HttpGet("user/{userId}")]
        public IActionResult GetAllByUserId(int userId)
        {
            var cards = _cardInfoService.GetAllByUserId(userId);
            if (cards == null || cards.Count == 0)
            {
                return NotFound("No cards found for the specified user.");
            }
            return Ok(cards);
        }

        // Get card by ID
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var card = _cardInfoService.GetById(id);
            if (card == null)
            {
                return NotFound($"Card with ID {id} not found.");
            }
            return Ok(card);
        }

        // Add a new card
        [HttpPost("add")]
        public IActionResult Add([FromBody] CardInfo cardInfo)
        {
            if (cardInfo == null)
            {
                return BadRequest("Card data is null.");
            }

            // Validating required fields
            if (string.IsNullOrWhiteSpace(cardInfo.CardHolder) ||
                string.IsNullOrWhiteSpace(cardInfo.CardNumber) ||
                string.IsNullOrWhiteSpace(cardInfo.ExpirationDate) ||
                string.IsNullOrWhiteSpace(cardInfo.CVV))
            {
                return BadRequest("CardHolder, CardNumber, ExpirationDate, and CVV are required.");
            }

            // Additional validation: Card number length
            if (cardInfo.CardNumber.Length != 16)
            {
                return BadRequest("CardNumber must be 16 digits.");
            }

            try
            {
                _cardInfoService.Add(cardInfo);
                return CreatedAtAction(nameof(Add), new { id = cardInfo.CardId }, cardInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Delete a card
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var card = _cardInfoService.GetById(id);
            if (card == null)
            {
                return NotFound($"Card with ID {id} not found.");
            }
            _cardInfoService.Delete(card);
            return Ok("Card deleted successfully.");
        }
    }
}
