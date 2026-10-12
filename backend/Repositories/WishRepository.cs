using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IWishRepository
{
    Task<IEnumerable<WishPlace>> GetAllAsync();
    Task<WishPlace> CreateAsync(SaveWishRequest req);
    Task<WishPlace?> ToggleDoneAsync(int id);
    Task<bool> DeleteAsync(int id);
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
    public async Task<IEnumerable<WishPlace>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<WishPlace>(
            "SELECT * FROM WishPlaces ORDER BY IsDone, Priority DESC, CreatedAt DESC");
    }

    public async Task<WishPlace> CreateAsync(SaveWishRequest req)
    {
        const string sql = @"
            INSERT INTO WishPlaces (Name, CountryIso, City, Category, Priority, EstimatedBudget, Currency, BestSeason, Note)
            OUTPUT INSERTED.*
            VALUES (@Name, @CountryIso, @City, @Category, @Priority, @EstimatedBudget, @Currency, @BestSeason, @Note);";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<WishPlace>(sql, req);
    }

    // Gidildi / gidilmedi arasında geçiş; gidildiyse tarihini de kaydet
    public async Task<WishPlace?> ToggleDoneAsync(int id)
    {
        const string sql = @"
            UPDATE WishPlaces
            SET IsDone = 1 - IsDone,
                DoneAt = CASE WHEN IsDone = 0 THEN SYSDATETIME() ELSE NULL END
            OUTPUT INSERTED.*
            WHERE Id = @id;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<WishPlace>(sql, new { id });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("DELETE FROM WishPlaces WHERE Id = @id", new { id }) > 0;
    }
}