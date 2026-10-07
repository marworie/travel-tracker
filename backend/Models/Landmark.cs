namespace TravelTracker.Api.Models;

public class Landmark
{
    public int Id { get; set; }
    public string Collection { get; set; } = string.Empty; // new7 / iconic / nature / turkey
    public string Name { get; set; } = string.Empty;
    public string WikiTitle { get; set; } = string.Empty;
    public string CountryIso { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int SortOrder { get; set; }
    public bool IsWanted { get; set; }
    public bool IsVisited { get; set; }
}
