using TravelTracker.Api.Extensions;
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
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync(User.GetUserId()));

    // GET api/landmarks/saved
    [HttpGet("saved")]
    public async Task<IActionResult> GetSaved() => Ok(await _repo.GetSavedAsync(User.GetUserId()));

    // POST api/landmarks/5/wanted
    [HttpPost("{id:int}/wanted")]
    public async Task<IActionResult> ToggleWanted(int id)
    {
        var item = await _repo.ToggleAsync(User.GetUserId(), id, "IsWanted");
        return item is null ? NotFound() : Ok(item);
    }

    // POST api/landmarks/5/visited
    [HttpPost("{id:int}/visited")]
    public async Task<IActionResult> ToggleVisited(int id)
    {
        var item = await _repo.ToggleAsync(User.GetUserId(), id, "IsVisited");
        return item is null ? NotFound() : Ok(item);
    }
}
