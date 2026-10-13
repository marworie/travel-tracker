namespace TravelTracker.Api.Models;

public class Trip
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Note { get; set; }
    public int DayCount { get; set; }
    public int StopCount { get; set; } // listede gösterilen durak sayısı
    public decimal? Budget { get; set; }
    public string Currency { get; set; } = "TRY";
    public int TravelerCount { get; set; } = 1;
    public byte? Rating { get; set; }
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
    public decimal? Latitude { get; set; }   // şehir tablosunda bulunamazsa boş kalır
    public decimal? Longitude { get; set; }
}

// Gezi + durakları (detay sayfası için)
public class TripDetail : Trip
{
    public List<TripStop> Stops { get; set; } = new();
    public List<TripActivity> Activities { get; set; } = new();
    public List<TripExpense> Expenses { get; set; } = new();
    public List<TripBooking> Bookings { get; set; } = new();
    public List<TripNote> Notes { get; set; } = new();
    public List<TripFile> Files { get; set; } = new();
}

public class SaveTripRequest
{
    public string Title { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Note { get; set; }
    public int DayCount { get; set; } = 1;
}

public class AddStopRequest
{
    public string CountryIso { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public DateTime? StopDate { get; set; }
    public string? Note { get; set; }
}

  // Bir günün yapılacaklarından biri
  public class TripActivity
  {
      public int Id { get; set; }
      public int TripId { get; set; }
      public int DayNumber { get; set; }
      public string Text { get; set; } = string.Empty;
      public int SortOrder { get; set; }
  }

  public class AddActivityRequest
  {
      public int DayNumber { get; set; }
      public string Text { get; set; } = string.Empty;
  }

  // Sürükle-bırak sonrası bir günün yeni sırası: [5, 2, 9] → 5 birinci, 2 ikinci, 9 üçüncü
    public class ReorderActivitiesRequest
    {
        public int DayNumber { get; set; }
        public List<int> ActivityIds { get; set; } = new();
    }

  public class SetDayCountRequest
  {
      public int DayCount { get; set; }

  }

    // ---- Bütçe ve harcamalar ----
  public class TripExpense
  {
      public int Id { get; set; }
      public int TripId { get; set; }
      public string Category { get; set; } = string.Empty;
      public string? Description { get; set; }      
      public decimal Amount { get; set; }
      public string Currency { get; set; } = string.Empty;
      public DateTime? ExpenseDate { get; set; }
  }

  public class AddExpenseRequest
  {
      public string Category { get; set; } = string.Empty;
      public string? Description { get; set; }
      public decimal Amount { get; set; }
      public string Currency { get; set; } = string.Empty;
      public DateTime? ExpenseDate { get; set; }
  }

  public class SetBudgetRequest
  {
      public decimal? Budget { get; set; }
      public string Currency { get; set; } = "TRY";
      public int TravelerCount { get; set; } = 1;
  }
  // ---- Ulaşım ve konaklama ----
  public class TripBooking
  {
      public int Id { get; set; }
      public int TripId { get; set; }
      public string Type { get; set; } = string.Empty;
      public string Title { get; set; } = string.Empty;
      public DateTime? StartAt { get; set; }
      public DateTime? EndAt { get; set; }
      public string? Reference { get; set; }
      public string? Note { get; set; }
  }

  public class AddBookingRequest
  {
      public string Type { get; set; } = string.Empty;
      public string Title { get; set; } = string.Empty;
      public DateTime? StartAt { get; set; }
      public DateTime? EndAt { get; set; }
      public string? Reference { get; set; }
      public string? Note { get; set; }
  }

    // ---- Anılar: puan, notlar, dosyalar ----
  public class SetRatingRequest
  {
      public byte? Rating { get; set; }   // null → puanı kaldır
  }

  public class TripNote
  {
      public int Id { get; set; }
      public int TripId { get; set; }
      public int? DayNumber { get; set; }
      public string Text { get; set; } = string.Empty;
      public DateTime CreatedAt { get; set; }
  }

  public class AddNoteRequest
  {
      public int? DayNumber { get; set; }
      public string Text { get; set; } = string.Empty;
  }

  public class TripFile
  {
      public int Id { get; set; }
      public int TripId { get; set; }
      public string Kind { get; set; } = string.Empty;
      public string FileName { get; set; } = string.Empty;
      public string StoredName { get; set; } = string.Empty;
      public string ContentType { get; set; } = string.Empty;
      public int SizeBytes { get; set; }
      public string? Caption { get; set; }
      public DateTime CreatedAt { get; set; }
      public string Url => $"/uploads/{StoredName}";   // tarayıcının dosyayı açacağı adres
  }