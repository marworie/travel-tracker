using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/landmarks")]
public class LandmarksController : ControllerBase
{
    private readonly ILandmarkRepository _repo;

    public LandmarksController(ILandmarkRepository repo) => _repo = repo;

    // GET api/landmarks
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

    // GET api/landmarks/saved
    [HttpGet("saved")]
    public async Task<IActionResult> GetSaved() => Ok(await _repo.GetSavedAsync());

    // POST api/landmarks/5/wanted
    [HttpPost("{id:int}/wanted")]
    public async Task<IActionResult> ToggleWanted(int id)
    {
        var item = await _repo.ToggleAsync(id, "IsWanted");
        return item is null ? NotFound() : Ok(item);
    }

    // POST api/landmarks/5/visited
    [HttpPost("{id:int}/visited")]
    public async Task<IActionResult> ToggleVisited(int id)
    {
        var item = await _repo.ToggleAsync(id, "IsVisited");
        return item is null ? NotFound() : Ok(item);
    }
}
