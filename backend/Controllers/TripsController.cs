using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/trips")]
public class TripsController : ControllerBase
{
    private readonly ITripRepository _repo;

    public TripsController(ITripRepository repo) => _repo = repo;

    // GET api/trips
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

    // GET api/trips/3  → gezi + durakları
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var trip = await _repo.GetByIdAsync(id);
        return trip is null ? NotFound() : Ok(trip);
    }

    // POST api/trips
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveTripRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Gezi adı gerekli.");
        if (req.StartDate.HasValue && req.EndDate.HasValue && req.EndDate < req.StartDate)
            return BadRequest("Bitiş tarihi başlangıçtan önce olamaz.");

        req.Title = req.Title.Trim();
        return Ok(await _repo.CreateAsync(req));
    }

    // DELETE api/trips/3
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _repo.DeleteAsync(id) ? NoContent() : NotFound();

    // POST api/trips/3/stops
    [HttpPost("{id:int}/stops")]
    public async Task<IActionResult> AddStop(int id, [FromBody] AddStopRequest req)
    {
        if (req.CountryIso.Length != 3 || string.IsNullOrWhiteSpace(req.Place))
            return BadRequest("Ülke ve yer adı gerekli.");

        req.Place = req.Place.Trim();
        return Ok(await _repo.AddStopAsync(id, req));
    }

    // DELETE api/trips/stops/12
    [HttpDelete("stops/{stopId:int}")]
    public async Task<IActionResult> DeleteStop(int stopId)
        => await _repo.DeleteStopAsync(stopId) ? NoContent() : NotFound();

    // POST api/trips/stops/12/move?direction=up
    [HttpPost("stops/{stopId:int}/move")]
    public async Task<IActionResult> MoveStop(int stopId, [FromQuery] string direction)
    {
        if (direction != "up" && direction != "down")
            return BadRequest("direction 'up' veya 'down' olmalı.");

        await _repo.MoveStopAsync(stopId, direction == "up");
        return NoContent();
    }
}
