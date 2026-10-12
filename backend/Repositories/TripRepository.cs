using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ITripRepository
{
    Task<IEnumerable<TripDetail>> GetAllAsync();
    Task<TripDetail?> GetByIdAsync(int id);
    Task<Trip> CreateAsync(SaveTripRequest req);
    Task<bool> DeleteAsync(int id);
    Task<TripStop> AddStopAsync(int tripId, AddStopRequest req);
    Task<bool> DeleteStopAsync(int stopId);
    Task MoveStopAsync(int stopId, bool up);
    Task<TripActivity> AddActivityAsync(int tripId, AddActivityRequest req);
    Task<bool> DeleteActivityAsync(int activityId);
    Task SetDayCountAsync(int tripId, int dayCount);
    Task SetBudgetAsync(int tripId, SetBudgetRequest req);
    Task<TripExpense> AddExpenseAsync(int tripId, AddExpenseRequest req);
    Task<bool> DeleteExpenseAsync(int expenseId);
    Task<TripBooking> AddBookingAsync(int tripId, AddBookingRequest req);
    Task<bool> DeleteBookingAsync(int bookingId);
    Task SetRatingAsync(int tripId, byte? rating);
    Task<TripNote> AddNoteAsync(int tripId, AddNoteRequest req);
    Task<bool> DeleteNoteAsync(int noteId);
    Task<TripFile> AddFileAsync(TripFile file);
    Task<TripFile?> DeleteFileAsync(int fileId);
}

public class TripRepository : ITripRepository
{
    private readonly string _connectionString;

    public TripRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // Tüm geziler + durakları. İki sorguyu tek seferde çalıştırıp
    // durakları C# tarafında gezilere dağıtıyoruz (her gezi için ayrı sorgu atmamak için).
    public async Task<IEnumerable<TripDetail>> GetAllAsync()
    {
        const string sql = @"
            SELECT * FROM Trips
            ORDER BY CASE WHEN StartDate IS NULL THEN 1 ELSE 0 END, StartDate, Id;
            SELECT * FROM TripStops ORDER BY TripId, StopOrder;
            SELECT * FROM TripFiles WHERE Kind = 'photo' ORDER BY TripId, CreatedAt;";

        using var db = CreateConnection();
        using var multi = await db.QueryMultipleAsync(sql);

        var trips = (await multi.ReadAsync<TripDetail>()).ToList();
        var stopsByTrip = (await multi.ReadAsync<TripStop>()).ToLookup(s => s.TripId);
        var photosByTrip = (await multi.ReadAsync<TripFile>()).ToLookup(f => f.TripId);

        foreach (var trip in trips)
        {
            trip.Stops = stopsByTrip[trip.Id].ToList();
            trip.StopCount = trip.Stops.Count;
            trip.Files =  photosByTrip[trip.Id].ToList(); // Anılar sayfasındaki kapak fotoğrafı için
        }
        return trips;
    }

    // QueryMultiple: tek seferde iki sorgu çalıştırıp iki sonuç seti okuyoruz
    public async Task<TripDetail?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT * FROM Trips WHERE Id = @id;
            SELECT * FROM TripStops WHERE TripId = @id ORDER BY StopOrder;
            SELECT * FROM TripActivities WHERE TripId = @id ORDER BY DayNumber, Id;
            SELECT * FROM TripExpenses WHERE TripId = @id ORDER BY ExpenseDate, Id;
            SELECT * FROM TripBookings WHERE TripId = @id ORDER BY CASE WHEN StartAt IS NULL THEN 1 ELSE 0 END, StartAt, Id;
            SELECT * FROM TripNotes WHERE TripId = @id ORDER BY CreatedAt DESC;
            SELECT * FROM TripFiles WHERE TripId = @id ORDER BY CreatedAt DESC;";


        using var db = CreateConnection();
        using var multi = await db.QueryMultipleAsync(sql, new { id });

        var trip = await multi.ReadSingleOrDefaultAsync<TripDetail>();
        if (trip is null) return null;

        trip.Stops = (await multi.ReadAsync<TripStop>()).ToList();
        trip.StopCount = trip.Stops.Count;
        trip.Activities = (await multi.ReadAsync<TripActivity>()).ToList();
        trip.Expenses = (await multi.ReadAsync<TripExpense>()).ToList();
        trip.Bookings = (await multi.ReadAsync<TripBooking>()).ToList();
        trip.Notes = (await multi.ReadAsync<TripNote>()).ToList();
        trip.Files = (await multi.ReadAsync<TripFile>()).ToList();
        return trip;
    }

    public async Task<Trip> CreateAsync(SaveTripRequest req)
    {
        const string sql = @"
            INSERT INTO Trips (Title, StartDate, EndDate, Note, DayCount)
            OUTPUT INSERTED.*
            VALUES (@Title, @StartDate, @EndDate, @Note, @DayCount);";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<Trip>(sql, req);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var db = CreateConnection();
        // ON DELETE CASCADE sayesinde duraklar da silinir
        return await db.ExecuteAsync("DELETE FROM Trips WHERE Id = @id", new { id }) > 0;
    }

    // Yeni durak listenin sonuna eklenir.
    // Koordinatı, aynı ülkedeki aynı isimli en kalabalık şehirden alıyoruz (bulunamazsa NULL).
    public async Task<TripStop> AddStopAsync(int tripId, AddStopRequest req)
    {
        const string sql = @"
            INSERT INTO TripStops (TripId, StopOrder, CountryIso, Place, StopDate, Note, Latitude, Longitude)
            OUTPUT INSERTED.*
            SELECT
                @tripId,
                (SELECT ISNULL(MAX(StopOrder), 0) + 1 FROM TripStops WHERE TripId = @tripId),
                @CountryIso, @Place, @StopDate, @Note,
                wc.Latitude, wc.Longitude
            FROM (SELECT 1 AS Dummy) AS d
            OUTER APPLY (
                SELECT TOP 1 Latitude, Longitude
                FROM WorldCities
                WHERE CountryIso = @CountryIso
                  AND Name COLLATE Latin1_General_CI_AI = @Place COLLATE Latin1_General_CI_AI
                ORDER BY Population DESC
            ) AS wc;";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<TripStop>(sql, new
        {
            tripId, req.CountryIso, req.Place, req.StopDate, req.Note
        });
    }

    public async Task<bool> DeleteStopAsync(int stopId)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("DELETE FROM TripStops WHERE Id = @stopId", new { stopId }) > 0;
    }

    // Durağı bir üstteki veya alttaki durakla yer değiştirir.
    // İki UPDATE'in ikisi de olsun ya da hiçbiri olmasın diye transaction kullanıyoruz.
    public async Task MoveStopAsync(int stopId, bool up)
    {
        var sql = $@"
            DECLARE @tripId INT, @order INT, @otherId INT, @otherOrder INT;

            SELECT @tripId = TripId, @order = StopOrder FROM TripStops WHERE Id = @stopId;

            SELECT TOP 1 @otherId = Id, @otherOrder = StopOrder
            FROM TripStops
            WHERE TripId = @tripId AND StopOrder {(up ? "<" : ">")} @order
            ORDER BY StopOrder {(up ? "DESC" : "ASC")};

            IF @otherId IS NOT NULL
            BEGIN
                UPDATE TripStops SET StopOrder = @otherOrder WHERE Id = @stopId;
                UPDATE TripStops SET StopOrder = @order WHERE Id = @otherId;
            END";

        using var db = CreateConnection();
        db.Open();
        using var tx = db.BeginTransaction();
        await db.ExecuteAsync(sql, new { stopId }, tx);
        tx.Commit();
    }

    public async Task<TripActivity> AddActivityAsync(int tripId, AddActivityRequest req)
    {
        const string sql = @"
            INSERT INTO TripActivities (TripId, DayNumber, Text)
            OUTPUT INSERTED.*
            VALUES (@tripId, @DayNumber, @Text);";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<TripActivity>(sql, new { tripId, req.DayNumber, req.Text });
    }

    public async Task<bool> DeleteActivityAsync(int activityId)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("DELETE FROM TripActivities WHERE Id = @activityId", new { activityId }) > 0;
    }

    // Gün sayısını değiştir. Gün azalırsa artık olmayan günlerin yapılacakları da silinir.
    public async Task SetDayCountAsync(int tripId, int dayCount)
    {
        const string sql = @"
            UPDATE Trips SET DayCount = @dayCount WHERE Id = @tripId;
            DELETE FROM TripActivities WHERE TripId = @tripId AND DayNumber > @dayCount;";

        using var db = CreateConnection();
        db.Open();
        using var tx = db.BeginTransaction();
        await db.ExecuteAsync(sql, new { tripId, dayCount }, tx);
        tx.Commit();
    }

    public async Task SetBudgetAsync(int tripId, SetBudgetRequest req)
{
    const string sql = @"
        UPDATE Trips
        SET Budget = @Budget, Currency = @Currency, TravelerCount = @TravelerCount
        WHERE Id = @tripId;";

    using var db = CreateConnection();
    await db.ExecuteAsync(sql, new { tripId, req.Budget, req.Currency, req.TravelerCount });
}

public async Task<TripExpense> AddExpenseAsync(int tripId, AddExpenseRequest req)
{
    const string sql = @"
        INSERT INTO TripExpenses (TripId, Category, Description, Amount, Currency, ExpenseDate)
        OUTPUT INSERTED.*
        VALUES (@tripId, @Category, @Description, @Amount, @Currency, @ExpenseDate);";

    using var db = CreateConnection();
    return await db.QuerySingleAsync<TripExpense>(sql, new
    {
        tripId, req.Category, req.Description, req.Amount, req.Currency, req.ExpenseDate
    });
}

public async Task<bool> DeleteExpenseAsync(int expenseId)
{
    using var db = CreateConnection();
    return await db.ExecuteAsync("DELETE FROM TripExpenses WHERE Id = @expenseId", new { expenseId }) > 0;
}

public async Task<TripBooking> AddBookingAsync(int tripId, AddBookingRequest req)
{
    const string sql = @"
        INSERT INTO TripBookings (TripId, Type, Title, StartAt, EndAt, Reference, Note)
        OUTPUT INSERTED.*
        VALUES (@tripId, @Type, @Title, @StartAt, @EndAt, @Reference, @Note);";

    using var db = CreateConnection();
    return await db.QuerySingleAsync<TripBooking>(sql, new
    {
        tripId, req.Type, req.Title, req.StartAt, req.EndAt, req.Reference, req.Note
    });
}

public async Task<bool> DeleteBookingAsync(int bookingId)
{
    using var db = CreateConnection();
    return await db.ExecuteAsync("DELETE FROM TripBookings WHERE Id = @bookingId", new { bookingId }) > 0;
}
public async Task SetRatingAsync(int tripId, byte? rating)
{
    using var db = CreateConnection();
    await db.ExecuteAsync("UPDATE Trips SET Rating = @rating WHERE Id = @tripId", new { tripId, rating });
}

public async Task<TripNote> AddNoteAsync(int tripId, AddNoteRequest req)
{
    const string sql = @"
        INSERT INTO TripNotes (TripId, DayNumber, Text)
        OUTPUT INSERTED.*
        VALUES (@tripId, @DayNumber, @Text);";

    using var db = CreateConnection();
    return await db.QuerySingleAsync<TripNote>(sql, new { tripId, req.DayNumber, req.Text });
}

public async Task<bool> DeleteNoteAsync(int noteId)
{
    using var db = CreateConnection();
    return await db.ExecuteAsync("DELETE FROM TripNotes WHERE Id = @noteId", new { noteId }) > 0;
}

public async Task<TripFile> AddFileAsync(TripFile file)
{
    const string sql = @"
        INSERT INTO TripFiles (TripId, Kind, FileName, StoredName, ContentType, SizeBytes, Caption)
        OUTPUT INSERTED.*
        VALUES (@TripId, @Kind, @FileName, @StoredName, @ContentType, @SizeBytes, @Caption);";

    using var db = CreateConnection();
    return await db.QuerySingleAsync<TripFile>(sql, file);
}

// Silinen kaydı geri döndürüyoruz ki controller diskteki dosyayı da silebilsin
public async Task<TripFile?> DeleteFileAsync(int fileId)
{
    using var db = CreateConnection();
    return await db.QuerySingleOrDefaultAsync<TripFile>(
        "DELETE FROM TripFiles OUTPUT DELETED.* WHERE Id = @fileId", new { fileId });
}

}
