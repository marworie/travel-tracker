using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/regions")]
public class RegionsController : ControllerBase
{
    private readonly IRegionRepository _repo;
    public RegionsController(IRegionRepository repo) => _repo = repo;

    // GET api/regions/276 → ["Bayern", "Berlin"]
    [HttpGet("{countryIso}")]
    public async Task<IActionResult> Get(string countryIso) =>
        Ok(await _repo.GetVisitedAsync(countryIso));

    // POST api/regions/276/toggle  { "regionName": "Bayern" }
    [HttpPost("{countryIso}/toggle")]
    public async Task<IActionResult> Toggle(string countryIso, [FromBody] ToggleRegionRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.RegionName)) return BadRequest("Bölge adı boş olamaz.");
        var isVisited = await _repo.ToggleAsync(countryIso, req.RegionName.Trim());
        return Ok(new { isVisited });
    }
}