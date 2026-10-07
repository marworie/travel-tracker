namespace TravelTracker.Api.Models;

public class UnescoSite
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // cultural / natural / mixed
    public short YearInscribed { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool InDanger { get; set; }
    public bool IsWanted { get; set; }
    public bool IsVisited { get; set; }
    public string? CountryIso { get; set; } // sadece "saved" listesinde dolu
}

public class UnescoCountry
{
    public string CountryIso { get; set; } = string.Empty;
    public int SiteCount { get; set; }
}
