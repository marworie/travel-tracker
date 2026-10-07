namespace TravelTracker.Api.Models;

public class ForeignCity
{
    public int Id { get; set; }
    public int CountryId { get; set; }
    public string IsoNumeric { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

// Frontend'den şehir eklerken gelen veri
public class AddForeignCityRequest
{
    public string IsoNumeric { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public string CityName { get; set; } = string.Empty;
}
