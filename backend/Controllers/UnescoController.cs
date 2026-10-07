using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/unesco")]
public class UnescoController : ControllerBase
{
    private readonly IUnescoRepository _repo;

    public UnescoController(IUnescoRepository repo) => _repo = repo;

    // GET api/unesco?iso=792
    [HttpGet]
    public async Task<IActionResult> GetByCountry([FromQuery] string iso)
    {
        if (string.IsNullOrWhiteSpace(iso) || iso.Length != 3)
            return BadRequest("Geçersiz ülke kodu.");

        return Ok(await _repo.GetByCountryAsync(iso));
    }

    // GET api/unesco/countries  → mirası olan ülkeler + sayıları
    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries() => Ok(await _repo.GetCountriesAsync());

    // GET api/unesco/saved  → ⭐ veya ✓ işaretlenenler
    [HttpGet("saved")]
    public async Task<IActionResult> GetSaved() => Ok(await _repo.GetSavedAsync());

    // POST api/unesco/357/wanted  → ⭐ gitmek istiyorum
    [HttpPost("{id:int}/wanted")]
    public async Task<IActionResult> ToggleWanted(int id)
    {
        var site = await _repo.ToggleAsync(id, "IsWanted");
        return site is null ? NotFound() : Ok(site);
    }

    // POST api/unesco/357/visited  → ✓ gittim
    [HttpPost("{id:int}/visited")]
    public async Task<IActionResult> ToggleVisited(int id)
    {
        var site = await _repo.ToggleAsync(id, "IsVisited");
        return site is null ? NotFound() : Ok(site);
    }
}
