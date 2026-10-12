using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ICountryRepository
{
    Task<IEnumerable<Country>> GetVisitedAsync(int userId);
    Task<Country> ToggleVisitedAsync(int userId, string isoNumeric, string name);
    Task<int> GetVisitedCountAsync(int userId);
}

public class CountryRepository : ICountryRepository
{
    private readonly string _connectionString;

    public CountryRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Country>> GetVisitedAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Country>(
            "SELECT * FROM Countries WHERE UserId = @userId AND IsVisited = 1 ORDER BY Name", new { userId });
    }

    public async Task<Country> ToggleVisitedAsync(int userId, string isoNumeric, string name)
    {
        // Ülke tabloda yoksa "gidildi" olarak eklenir, varsa durumu tersine çevrilir.
        // Böylece 195 ülkeyi önceden elle eklemek gerekmiyor.
        const string sql = @"
            IF EXISTS (SELECT 1 FROM Countries WHERE UserId = @userId AND IsoNumeric = @isoNumeric)
                UPDATE Countries
                SET IsVisited = 1 - IsVisited,
                    VisitedAt = CASE WHEN IsVisited = 0 THEN CAST(GETDATE() AS DATE) ELSE NULL END
                WHERE UserId = @userId AND IsoNumeric = @isoNumeric;
            ELSE
                INSERT INTO Countries (UserId, IsoNumeric, Name, IsVisited, VisitedAt)
                VALUES (@userId, @isoNumeric, @name, 1, CAST(GETDATE() AS DATE));

            -- Ülke 'gidilmedi' yapıldıysa o ülkenin şehirleri de silinir
            DELETE fc FROM ForeignCities fc
            JOIN Countries c ON c.Id = fc.CountryId
            WHERE c.UserId = @userId AND c.IsoNumeric = @isoNumeric AND c.IsVisited = 0;

            SELECT * FROM Countries WHERE UserId = @userId AND IsoNumeric = @isoNumeric;";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<Country>(sql, new { userId, isoNumeric, name });
    }

    public async Task<int> GetVisitedCountAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Countries WHERE UserId = @userId AND IsVisited = 1", new { userId });
    }
}