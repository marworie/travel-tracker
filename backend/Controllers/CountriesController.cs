using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CountriesController : ControllerBase
{
    private readonly ICountryRepository _repo;

    public CountriesController(ICountryRepository repo) => _repo = repo;

    // GET api/countries  → sadece gidilen ülkeler
    [HttpGet]
    public async Task<IActionResult> GetVisited() => Ok(await _repo.GetVisitedAsync());

    // POST api/countries/792/toggle   body: { "name": "Turkey" }
    [HttpPost("{isoNumeric}/toggle")]
    public async Task<IActionResult> Toggle(string isoNumeric, [FromBody] ToggleCountryRequest request)
    {
        if (isoNumeric.Length != 3 || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Geçersiz ülke bilgisi.");

        var country = await _repo.ToggleVisitedAsync(isoNumeric, request.Name);
        return Ok(country);
    }
}
