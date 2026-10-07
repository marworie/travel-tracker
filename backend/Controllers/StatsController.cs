using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private const int TotalCountries = 195;
    private const int TotalCities = 81;

    private readonly ICityRepository _cities;
    private readonly ICountryRepository _countries;
    private readonly IForeignCityRepository _foreignCities;

    public StatsController(ICityRepository cities, ICountryRepository countries, IForeignCityRepository foreignCities)
    {
        _cities = cities;
        _countries = countries;
        _foreignCities = foreignCities;
    }

    // GET api/stats
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var visitedCities = await _cities.GetVisitedCountAsync();
        var visitedCountries = await _countries.GetVisitedCountAsync();
        var visitedForeignCities = await _foreignCities.GetCountAsync();

        return Ok(new
        {
            visitedCountries,
            totalCountries = TotalCountries,
            countryPercent = Math.Round(visitedCountries * 100.0 / TotalCountries, 1),
            visitedCities,
            totalCities = TotalCities,
            cityPercent = Math.Round(visitedCities * 100.0 / TotalCities, 1),
            visitedForeignCities
        });
    }
}
