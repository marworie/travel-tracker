using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/foreign-cities")]
public class ForeignCitiesController : ControllerBase
{
    private readonly IForeignCityRepository _repo;

    public ForeignCitiesController(IForeignCityRepository repo) => _repo = repo;

    // GET api/foreign-cities
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

    // POST api/foreign-cities   body: { "isoNumeric": "250", "countryName": "France", "cityName": "Paris" }
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddForeignCityRequest request)
    {
        var cityName = request.CityName.Trim();

        if (request.IsoNumeric.Length != 3 || string.IsNullOrWhiteSpace(cityName))
            return BadRequest("Ülke ve şehir adı gerekli.");

        if (cityName.Length > 100)
            return BadRequest("Şehir adı en fazla 100 karakter olabilir.");

        var city = await _repo.AddAsync(request.IsoNumeric, request.CountryName, cityName);
        return Ok(city);
    }

    // DELETE api/foreign-cities/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repo.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
