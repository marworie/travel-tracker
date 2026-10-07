namespace TravelTracker.Api.Models;

public class Country
{
    public int Id { get; set; }
    public string IsoNumeric { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsVisited { get; set; }
    public DateTime? VisitedAt { get; set; }
}

// Haritada bir ülkeye tıklanınca frontend'den gelen veri
public class ToggleCountryRequest
{
    public string Name { get; set; } = string.Empty;
}
