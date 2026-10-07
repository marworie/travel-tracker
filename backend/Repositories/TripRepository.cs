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

            SELECT * FROM TripStops ORDER BY TripId, StopOrder;";

        using var db = CreateConnection();
        using var multi = await db.QueryMultipleAsync(sql);

        var trips = (await multi.ReadAsync<TripDetail>()).ToList();
        var stopsByTrip = (await multi.ReadAsync<TripStop>()).ToLookup(s => s.TripId);

        foreach (var trip in trips)
        {
            trip.Stops = stopsByTrip[trip.Id].ToList();
            trip.StopCount = trip.Stops.Count;
        }
        return trips;
    }

    // QueryMultiple: tek seferde iki sorgu çalıştırıp iki sonuç seti okuyoruz
    public async Task<TripDetail?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT * FROM Trips WHERE Id = @id;
            SELECT * FROM TripStops WHERE TripId = @id ORDER BY StopOrder;";

        using var db = CreateConnection();
        using var multi = await db.QueryMultipleAsync(sql, new { id });

        var trip = await multi.ReadSingleOrDefaultAsync<TripDetail>();
        if (trip is null) return null;

        trip.Stops = (await multi.ReadAsync<TripStop>()).ToList();
        trip.StopCount = trip.Stops.Count;
        return trip;
    }

    public async Task<Trip> CreateAsync(SaveTripRequest req)
    {
        const string sql = @"
            INSERT INTO Trips (Title, StartDate, EndDate, Note)
            OUTPUT INSERTED.*
            VALUES (@Title, @StartDate, @EndDate, @Note);";

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
}
