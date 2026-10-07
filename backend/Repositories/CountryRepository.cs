using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ICountryRepository
{
    Task<IEnumerable<Country>> GetVisitedAsync();
    Task<Country> ToggleVisitedAsync(string isoNumeric, string name);
    Task<int> GetVisitedCountAsync();
}

public class CountryRepository : ICountryRepository
{
    private readonly string _connectionString;

    public CountryRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Country>> GetVisitedAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Country>(
            "SELECT * FROM Countries WHERE IsVisited = 1 ORDER BY Name");
    }

    public async Task<Country> ToggleVisitedAsync(string isoNumeric, string name)
    {
        // Ülke tabloda yoksa "gidildi" olarak eklenir, varsa durumu tersine çevrilir.
        // Böylece 195 ülkeyi önceden elle eklemek gerekmiyor.
        const string sql = @"
            IF EXISTS (SELECT 1 FROM Countries WHERE IsoNumeric = @isoNumeric)
                UPDATE Countries
                SET IsVisited = 1 - IsVisited,
                    VisitedAt = CASE WHEN IsVisited = 0 THEN CAST(GETDATE() AS DATE) ELSE NULL END
                WHERE IsoNumeric = @isoNumeric;
            ELSE
                INSERT INTO Countries (IsoNumeric, Name, IsVisited, VisitedAt)
                VALUES (@isoNumeric, @name, 1, CAST(GETDATE() AS DATE));

            -- Ülke 'gidilmedi' yapıldıysa o ülkenin şehirleri de silinir
            DELETE fc FROM ForeignCities fc
            JOIN Countries c ON c.Id = fc.CountryId
            WHERE c.IsoNumeric = @isoNumeric AND c.IsVisited = 0;

            SELECT * FROM Countries WHERE IsoNumeric = @isoNumeric;";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<Country>(sql, new { isoNumeric, name });
    }

    public async Task<int> GetVisitedCountAsync()
    {
        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Countries WHERE IsVisited = 1");
    }
}
