namespace TravelTracker.Api.Models;

public class VisitedRegion
{
    public int Id { get; set; }
    public string CountryIso { get; set; } = string.Empty;
    public string RegionName { get; set; } = string.Empty;
}

public class ToggleRegionRequest
{
    public string RegionName { get; set; } = string.Empty;
}