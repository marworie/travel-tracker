using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly ICityRepository _repo;

    public CitiesController(ICityRepository repo) => _repo = repo;

    // GET api/cities
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

    // POST api/cities/34/toggle
    [HttpPost("{plateCode:int}/toggle")]
    public async Task<IActionResult> Toggle(int plateCode)
    {
        if (plateCode < 1 || plateCode > 81)
            return BadRequest("Plaka kodu 1 ile 81 arasında olmalı.");

        var city = await _repo.ToggleVisitedAsync((byte)plateCode);
        return city is null ? NotFound() : Ok(city);
    }
}
