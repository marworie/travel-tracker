using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IWishRepository
{
    Task<IEnumerable<WishPlace>> GetAllAsync(int userId);
    Task<WishPlace> CreateAsync(int userId, SaveWishRequest req);
    Task<WishPlace?> ToggleDoneAsync(int userId, int id);
    Task<bool> DeleteAsync(int userId, int id);
}

public class WishRepository : IWishRepository
{
    private readonly string _connectionString;

    public WishRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // Önce gidilmemişler, sonra önceliği yüksek olanlar
    public async Task<IEnumerable<WishPlace>> GetAllAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<WishPlace>(
            "SELECT * FROM WishPlaces WHERE UserId = @userId ORDER BY IsDone, Priority DESC, CreatedAt DESC",
            new { userId });
    }

    public async Task<WishPlace> CreateAsync(int userId, SaveWishRequest req)
    {
        const string sql = @"
            INSERT INTO WishPlaces (UserId, Name, CountryIso, City, Category, Priority, EstimatedBudget, Currency, BestSeason, Note)
            OUTPUT INSERTED.*
            VALUES (@userId, @Name, @CountryIso, @City, @Category, @Priority, @EstimatedBudget, @Currency, @BestSeason, @Note);";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<WishPlace>(sql, new
        {
            userId, req.Name, req.CountryIso, req.City, req.Category, req.Priority,
            req.EstimatedBudget, req.Currency, req.BestSeason, req.Note
        });
    }

    // Gidildi / gidilmedi arasında geçiş; gidildiyse tarihini de kaydet
    public async Task<WishPlace?> ToggleDoneAsync(int userId, int id)
    {
        const string sql = @"
            UPDATE WishPlaces
            SET IsDone = 1 - IsDone,
                DoneAt = CASE WHEN IsDone = 0 THEN SYSDATETIME() ELSE NULL END
            OUTPUT INSERTED.*
            WHERE Id = @id AND UserId = @userId;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<WishPlace>(sql, new { userId, id });
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("DELETE FROM WishPlaces WHERE Id = @id AND UserId = @userId", new { userId, id }) > 0;
    }
}