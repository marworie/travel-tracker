namespace TravelTracker.Api.Models;

public class City
{
    public int Id { get; set; }
    public byte PlateCode { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsVisited { get; set; }
    public DateTime? VisitedAt { get; set; }
}
