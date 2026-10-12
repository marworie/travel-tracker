using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace TravelTracker.Api.Repositories;

public interface IRegionRepository
{
    Task<IEnumerable<string>> GetVisitedAsync(int userId, string countryIso);
    Task<bool> ToggleAsync(int userId, string countryIso, string regionName);
}

public class RegionRepository : IRegionRepository
{
    private readonly string _connectionString;

    public RegionRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<string>> GetVisitedAsync(int userId, string countryIso)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<string>(
            "SELECT RegionName FROM VisitedRegions WHERE UserId = @userId AND CountryIso = @countryIso",
            new { userId, countryIso });
    }

    // Kayıt varsa siler (false döner), yoksa ekler (true döner)
    public async Task<bool> ToggleAsync(int userId, string countryIso, string regionName)
    {
        const string sql = @"
            IF EXISTS (SELECT 1 FROM VisitedRegions WHERE UserId = @userId AND CountryIso = @countryIso AND RegionName = @regionName)
            BEGIN
                DELETE FROM VisitedRegions WHERE UserId = @userId AND CountryIso = @countryIso AND RegionName = @regionName;
                SELECT CAST(0 AS BIT);
            END
            ELSE
            BEGIN
                INSERT INTO VisitedRegions (UserId, CountryIso, RegionName) VALUES (@userId, @countryIso, @regionName);
                SELECT CAST(1 AS BIT);
            END";

        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<bool>(sql, new { userId, countryIso, regionName });
    }
}