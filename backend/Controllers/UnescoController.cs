using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/unesco")]
public class UnescoController : ControllerBase
{
    private readonly IUnescoRepository _repo;

    public UnescoController(IUnescoRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetByCountry([FromQuery] string iso)
    {
        if (string.IsNullOrWhiteSpace(iso) || iso.Length != 3)
            return BadRequest("Geçersiz ülke kodu.");
        return Ok(await _repo.GetByCountryAsync(iso));
    }

    [HttpPost("{id:int}/wanted")]
    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries() => Ok(await _repo.GetCountriesAsync());

    [HttpGet("saved")]
    public async Task<IActionResult> GetSaved() => Ok(await _repo.GetSavedAsync());
    public async Task<IActionResult> ToggleWanted(int id)
    {
        var site = await _repo.ToggleAsync(id, "IsWanted");
        return site is null ? NotFound() : Ok(site);
    }

    [HttpPost("{id:int}/visited")]
    public async Task<IActionResult> ToggleVisited(int id)
    {
        var site = await _repo.ToggleAsync(id, "IsVisited");
        return site is null ? NotFound() : Ok(site);
    }
}