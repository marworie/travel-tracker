namespace TravelTracker.Api.Models;

public class Trip
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Note { get; set; }
    public int StopCount { get; set; } // listede gösterilen durak sayısı
}

public class TripStop
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public int StopOrder { get; set; }
    public string CountryIso { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public DateTime? StopDate { get; set; }
    public string? Note { get; set; }
}

// Gezi + durakları (detay sayfası için)
public class TripDetail : Trip
{
    public List<TripStop> Stops { get; set; } = new();
}

public class SaveTripRequest
{
    public string Title { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Note { get; set; }
}

public class AddStopRequest
{
    public string CountryIso { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public DateTime? StopDate { get; set; }
    public string? Note { get; set; }
}
