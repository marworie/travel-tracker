using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Extensions;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/wishes")]
public class WishesController : ControllerBase
{
    private static readonly string[] Categories = { "nature", "history", "food", "sea", "adventure", "city" };
    private static readonly string[] Seasons = { "spring", "summer", "autumn", "winter" };

    private readonly IWishRepository _repo;
    public WishesController(IWishRepository repo) => _repo = repo;

    // GET api/wishes
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync(User.GetUserId()));

    // POST api/wishes
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveWishRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Yer adı gerekli.");
        if (req.CountryIso.Length != 3) return BadRequest("Ülke seçilmeli.");
        if (!Categories.Contains(req.Category)) return BadRequest("Geçersiz kategori.");
        if (req.Priority < 1 || req.Priority > 3) return BadRequest("Öncelik 1, 2 veya 3 olmalı.");
        if (req.BestSeason is not null && !Seasons.Contains(req.BestSeason)) return BadRequest("Geçersiz mevsim.");
        if (req.EstimatedBudget is < 0m) return BadRequest("Bütçe negatif olamaz.");

        req.Name = req.Name.Trim();
        req.City = string.IsNullOrWhiteSpace(req.City) ? null : req.City.Trim();
        req.Note = string.IsNullOrWhiteSpace(req.Note) ? null : req.Note.Trim();
        req.Currency = req.Currency.ToUpperInvariant();
        return Ok(await _repo.CreateAsync(User.GetUserId(), req));
    }

    // POST api/wishes/4/done  → gidildi / gidilmedi
    [HttpPost("{id:int}/done")]
    public async Task<IActionResult> ToggleDone(int id)
    {
        var wish = await _repo.ToggleDoneAsync(User.GetUserId(), id);
        return wish is null ? NotFound() : Ok(wish);
    }

    // DELETE api/wishes/4
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _repo.DeleteAsync(User.GetUserId(), id) ? NoContent() : NotFound();
}