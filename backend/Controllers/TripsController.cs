using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Extensions;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/trips")]
public class TripsController : ControllerBase
{
    private static readonly string[] BookingTypes = { "flight", "bus", "train", "ferry", "car", "hotel" };
    private static readonly string[] Categories = { "flight", "transport", "stay", "food", "activity", "personal", "other" };

    // Yüklenebilecek dosya türleri ve en büyük boyut
    private static readonly string[] PhotoTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };
    private const long MaxFileBytes = 10 * 1024 * 1024; // 10 MB

    private readonly ITripRepository _repo;
    private readonly IWebHostEnvironment _env;

    public TripsController(ITripRepository repo, IWebHostEnvironment env)
    {
        _repo = repo;
        _env = env;
    }

    private int UserId => User.GetUserId();

    // Gezi bu kullanıcıya ait değilse işlem yapılmaz (404 döner)
    private Task<bool> OwnsTrip(int tripId) => _repo.OwnsTripAsync(UserId, tripId);

    // Dosyaların kaydedileceği klasör: wwwroot/uploads
    private string UploadFolder
    {
        get
        {
            var folder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            Directory.CreateDirectory(folder); // yoksa oluştur
            return folder;
        }
    }

    // GET api/trips
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync(UserId));

    // GET api/trips/3  → gezi + durakları
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var trip = await _repo.GetByIdAsync(UserId, id);
        return trip is null ? NotFound() : Ok(trip);
    }

    // POST api/trips
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveTripRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Gezi adı gerekli.");
        if (req.StartDate.HasValue && req.EndDate.HasValue && req.EndDate < req.StartDate)
            return BadRequest("Bitiş tarihi başlangıçtan önce olamaz.");
        if (req.DayCount < 1 || req.DayCount > 60)
            return BadRequest("Gün sayısı 1 ile 60 arasında olmalı.");

        req.Title = req.Title.Trim();
        return Ok(await _repo.CreateAsync(UserId, req));
    }

    // DELETE api/trips/3
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _repo.DeleteAsync(UserId, id) ? NoContent() : NotFound();

    // POST api/trips/3/stops
    [HttpPost("{id:int}/stops")]
    public async Task<IActionResult> AddStop(int id, [FromBody] AddStopRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (req.CountryIso.Length != 3 || string.IsNullOrWhiteSpace(req.Place))
            return BadRequest("Ülke ve yer adı gerekli.");

        req.Place = req.Place.Trim();
        return Ok(await _repo.AddStopAsync(id, req));
    }

    // DELETE api/trips/stops/12
    [HttpDelete("stops/{stopId:int}")]
    public async Task<IActionResult> DeleteStop(int stopId)
        => await _repo.DeleteStopAsync(UserId, stopId) ? NoContent() : NotFound();

    // POST api/trips/stops/12/move?direction=up
    [HttpPost("stops/{stopId:int}/move")]
    public async Task<IActionResult> MoveStop(int stopId, [FromQuery] string direction)
    {
        if (direction != "up" && direction != "down")
            return BadRequest("direction 'up' veya 'down' olmalı.");

        await _repo.MoveStopAsync(UserId, stopId, direction == "up");
        return NoContent();
    }

    // POST api/trips/3/activities  { "dayNumber": 2, "text": "Ayasofya" }
    [HttpPost("{id:int}/activities")]
    public async Task<IActionResult> AddActivity(int id, [FromBody] AddActivityRequest req)
    {
        var trip = await _repo.GetByIdAsync(UserId, id); // başkasının gezisiyse null gelir
        if (trip is null) return NotFound();
        if (req.DayNumber < 1 || req.DayNumber > trip.DayCount)
            return BadRequest("Böyle bir gün yok.");
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest("Yapılacak boş olamaz.");

        req.Text = req.Text.Trim();
        return Ok(await _repo.AddActivityAsync(id, req));
    }

    // DELETE api/trips/activities/7
    [HttpDelete("activities/{activityId:int}")]
    public async Task<IActionResult> DeleteActivity(int activityId)
        => await _repo.DeleteActivityAsync(UserId, activityId) ? NoContent() : NotFound();

    // POST api/trips/activities/7/move?direction=up
    [HttpPost("activities/{activityId:int}/move")]
    public async Task<IActionResult> MoveActivity(int activityId, [FromQuery] string direction)
    {
        if (direction != "up" && direction != "down")
            return BadRequest("direction 'up' veya 'down' olmalı.");

        await _repo.MoveActivityAsync(UserId, activityId, direction == "up");
        return NoContent();
    }

    // PUT api/trips/3/activities/order  { "dayNumber": 2, "activityIds": [5, 2, 9] }
    [HttpPut("{id:int}/activities/order")]
    public async Task<IActionResult> ReorderActivities(int id, [FromBody] ReorderActivitiesRequest req)
    {
        var trip = await _repo.GetByIdAsync(UserId, id);
        if (trip is null) return NotFound();
        if (req.DayNumber < 1 || req.DayNumber > trip.DayCount) return BadRequest("Böyle bir gün yok.");

        await _repo.ReorderActivitiesAsync(id, req.DayNumber, req.ActivityIds);
        return NoContent();
    }

    // PUT api/trips/3/days  { "dayCount": 5 }
    [HttpPut("{id:int}/days")]
    public async Task<IActionResult> SetDayCount(int id, [FromBody] SetDayCountRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (req.DayCount < 1 || req.DayCount > 60)
            return BadRequest("Gün sayısı 1 ile 60 arasında olmalı.");

        await _repo.SetDayCountAsync(id, req.DayCount);
        return NoContent();
    }

    // PUT api/trips/3/budget  { "budget": 25000, "currency": "TRY", "travelerCount": 2 }
    [HttpPut("{id:int}/budget")]
    public async Task<IActionResult> SetBudget(int id, [FromBody] SetBudgetRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (req.Budget is < 0m) return BadRequest("Bütçe negatif olamaz.");
        if (req.Currency.Length != 3) return BadRequest("Para birimi 3 harfli olmalı (TRY, EUR...).");
        if (req.TravelerCount < 1 || req.TravelerCount > 50) return BadRequest("Kişi sayısı 1 ile 50 arasında olmalı.");

        req.Currency = req.Currency.ToUpperInvariant();
        await _repo.SetBudgetAsync(id, req);
        return NoContent();
    }

    // POST api/trips/3/expenses
    [HttpPost("{id:int}/expenses")]
    public async Task<IActionResult> AddExpense(int id, [FromBody] AddExpenseRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (!Categories.Contains(req.Category)) return BadRequest("Geçersiz kategori.");
        if (req.Amount <= 0) return BadRequest("Tutar sıfırdan büyük olmalı.");
        if (req.Currency.Length != 3) return BadRequest("Para birimi 3 harfli olmalı.");

        // Açıklama isteğe bağlı: boşsa NULL kaydedilir
        req.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        req.Currency = req.Currency.ToUpperInvariant();
        return Ok(await _repo.AddExpenseAsync(id, req));
    }
    // PUT api/trips/3   { "title": "Japonya 2026", "startDate": "2026-10-21", "endDate": null }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTripRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest("Gezi adı gerekli.");
        if (req.StartDate.HasValue && req.EndDate.HasValue && req.EndDate < req.StartDate)
            return BadRequest("Bitiş tarihi başlangıçtan önce olamaz.");

        req.Title = req.Title.Trim();
        var trip = await _repo.UpdateAsync(UserId, id, req);
        return trip is null ? NotFound() : Ok(trip);
    }

    // PUT api/trips/stops/12
    [HttpPut("stops/{stopId:int}")]
    public async Task<IActionResult> UpdateStop(int stopId, [FromBody] AddStopRequest req)
    {
        if (req.CountryIso.Length != 3 || string.IsNullOrWhiteSpace(req.Place))
            return BadRequest("Ülke ve yer adı gerekli.");

        req.Place = req.Place.Trim();
        req.Note = string.IsNullOrWhiteSpace(req.Note) ? null : req.Note.Trim();
        var stop = await _repo.UpdateStopAsync(UserId, stopId, req);
        return stop is null ? NotFound() : Ok(stop);
    }

    // PUT api/trips/activities/7   { "text": "Sensō-ji Tapınağı" }
    [HttpPut("activities/{activityId:int}")]
    public async Task<IActionResult> UpdateActivity(int activityId, [FromBody] UpdateActivityRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text)) return BadRequest("Yapılacak boş olamaz.");
        if (req.Text.Length > 300) return BadRequest("En fazla 300 karakter olabilir.");

        var activity = await _repo.UpdateActivityAsync(UserId, activityId, req.Text.Trim());
        return activity is null ? NotFound() : Ok(activity);
    }
    // DELETE api/trips/expenses/9
    [HttpDelete("expenses/{expenseId:int}")]
    public async Task<IActionResult> DeleteExpense(int expenseId)
        => await _repo.DeleteExpenseAsync(UserId, expenseId) ? NoContent() : NotFound();

    // POST api/trips/3/bookings
    [HttpPost("{id:int}/bookings")]
    public async Task<IActionResult> AddBooking(int id, [FromBody] AddBookingRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (!BookingTypes.Contains(req.Type)) return BadRequest("Geçersiz rezervasyon türü.");
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest("Başlık gerekli.");
        if (req.StartAt.HasValue && req.EndAt.HasValue && req.EndAt < req.StartAt)
            return BadRequest("Bitiş zamanı başlangıçtan önce olamaz.");

        req.Title = req.Title.Trim();
        req.Reference = string.IsNullOrWhiteSpace(req.Reference) ? null : req.Reference.Trim().ToUpperInvariant();
        req.Note = string.IsNullOrWhiteSpace(req.Note) ? null : req.Note.Trim();
        return Ok(await _repo.AddBookingAsync(id, req));
    }

    // DELETE api/trips/bookings/5
    [HttpDelete("bookings/{bookingId:int}")]
    public async Task<IActionResult> DeleteBooking(int bookingId)
        => await _repo.DeleteBookingAsync(UserId, bookingId) ? NoContent() : NotFound();

    // PUT api/trips/3/rating  { "rating": 5 }
    [HttpPut("{id:int}/rating")]
    public async Task<IActionResult> SetRating(int id, [FromBody] SetRatingRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (req.Rating is < 1 or > 5) return BadRequest("Puan 1 ile 5 arasında olmalı.");
        await _repo.SetRatingAsync(id, req.Rating);
        return NoContent();
    }

    // POST api/trips/3/notes  { "dayNumber": 2, "text": "..." }
    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] AddNoteRequest req)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (string.IsNullOrWhiteSpace(req.Text)) return BadRequest("Not boş olamaz.");
        if (req.Text.Length > 2000) return BadRequest("Not en fazla 2000 karakter olabilir.");

        req.Text = req.Text.Trim();
        return Ok(await _repo.AddNoteAsync(id, req));
    }

    // DELETE api/trips/notes/4
    [HttpDelete("notes/{noteId:int}")]
    public async Task<IActionResult> DeleteNote(int noteId)
        => await _repo.DeleteNoteAsync(UserId, noteId) ? NoContent() : NotFound();

    // POST api/trips/3/files   (multipart/form-data: file, kind, caption)
    [HttpPost("{id:int}/files")]
    public async Task<IActionResult> UploadFile(int id, IFormFile file, [FromForm] string kind, [FromForm] string? caption)
    {
        if (!await OwnsTrip(id)) return NotFound();
        if (file is null || file.Length == 0) return BadRequest("Dosya seçilmedi.");
        if (file.Length > MaxFileBytes) return BadRequest("Dosya en fazla 10 MB olabilir.");
        if (kind != "photo" && kind != "document") return BadRequest("Geçersiz dosya türü.");

        var isPhoto = PhotoTypes.Contains(file.ContentType);
        var isPdf = file.ContentType == "application/pdf";
        if (kind == "photo" && !isPhoto) return BadRequest("Fotoğraf olarak sadece JPG, PNG, WEBP veya GIF yüklenebilir.");
        if (kind == "document" && !isPhoto && !isPdf) return BadRequest("Belge olarak PDF veya resim yüklenebilir.");

        // Kullanıcının dosya adını diskte kullanmıyoruz: çakışma ve güvenlik için rastgele ad veriyoruz
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var storedName = $"{Guid.NewGuid():N}{extension}";

        await using (var stream = System.IO.File.Create(Path.Combine(UploadFolder, storedName)))
        {
            await file.CopyToAsync(stream);
        }

        var saved = await _repo.AddFileAsync(new TripFile
        {
            TripId = id,
            Kind = kind,
            FileName = Path.GetFileName(file.FileName),
            StoredName = storedName,
            ContentType = file.ContentType,
            SizeBytes = (int)file.Length,
            Caption = string.IsNullOrWhiteSpace(caption) ? null : caption.Trim(),
        });
        return Ok(saved);
    }

    // DELETE api/trips/files/8   → hem kaydı hem diskteki dosyayı siler
    [HttpDelete("files/{fileId:int}")]
    public async Task<IActionResult> DeleteFile(int fileId)
    {
        var deleted = await _repo.DeleteFileAsync(UserId, fileId);
        if (deleted is null) return NotFound();

        var path = Path.Combine(UploadFolder, deleted.StoredName);
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
        return NoContent();
    }
}