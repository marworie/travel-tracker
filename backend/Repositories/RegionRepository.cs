using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace TravelTracker.Api.Repositories;

public interface IRegionRepository
{
    Task<IEnumerable<string>> GetVisitedAsync(string countryIso);
    Task<bool> ToggleAsync(string countryIso, string regionName);
}

public class RegionRepository : IRegionRepository
{
    private readonly string _connectionString;

    public RegionRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<string>> GetVisitedAsync(string countryIso)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<string>(
            "SELECT RegionName FROM VisitedRegions WHERE CountryIso = @countryIso", new { countryIso });
    }

    // Kayıt varsa siler (false döner), yoksa ekler (true döner)
    public async Task<bool> ToggleAsync(string countryIso, string regionName)
    {
        const string sql = @"
            IF EXISTS (SELECT 1 FROM VisitedRegions WHERE CountryIso = @countryIso AND RegionName = @regionName)
            BEGIN
                DELETE FROM VisitedRegions WHERE CountryIso = @countryIso AND RegionName = @regionName;
                SELECT CAST(0 AS BIT);
            END
            ELSE
            BEGIN
                INSERT INTO VisitedRegions (CountryIso, RegionName) VALUES (@countryIso, @regionName);
                SELECT CAST(1 AS BIT);
            END";

        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<bool>(sql, new { countryIso, regionName });
    }
}