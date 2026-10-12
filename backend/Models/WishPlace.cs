namespace TravelTracker.Api.Models;

public class WishPlace
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CountryIso { get; set; } = string.Empty;
    public string? City { get; set; }
    public string Category { get; set; } = string.Empty;
    public byte Priority { get; set; }
    public decimal? EstimatedBudget { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? BestSeason { get; set; }
    public string? Note { get; set; }
    public bool IsDone { get; set; }
    public DateTime? DoneAt { get; set; }
}

public class SaveWishRequest
{
    public string Name { get; set; } = string.Empty;
    public string CountryIso { get; set; } = string.Empty;
    public string? City { get; set; }
    public string Category { get; set; } = string.Empty;
    public byte Priority { get; set; } = 2;
    public decimal? EstimatedBudget { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? BestSeason { get; set; }
    public string? Note { get; set; }
}