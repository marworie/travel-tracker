using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/world-cities")]
public class WorldCitiesController : ControllerBase
{
    private readonly IWorldCityRepository _repo;

    public WorldCitiesController(IWorldCityRepository repo) => _repo = repo;

    // GET api/world-cities?iso=250&q=pa
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string iso, [FromQuery] string? q)
    {
        if (string.IsNullOrWhiteSpace(iso) || iso.Length != 3)
            return BadRequest("Geçersiz ülke kodu.");

        return Ok(await _repo.SearchAsync(iso, q));
    }
}