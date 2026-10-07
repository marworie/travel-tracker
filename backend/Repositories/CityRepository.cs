using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ICityRepository
{
    Task<IEnumerable<City>> GetAllAsync();
    Task<City?> ToggleVisitedAsync(byte plateCode);
    Task<int> GetVisitedCountAsync();
}

public class CityRepository : ICityRepository
{
    private readonly string _connectionString;

    public CityRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<City>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<City>("SELECT * FROM Cities ORDER BY PlateCode");
    }

    public async Task<City?> ToggleVisitedAsync(byte plateCode)
    {
        // Gidildiyse "gidilmedi", gidilmediyse "gidildi" yapar
        const string sql = @"
            UPDATE Cities
            SET IsVisited = 1 - IsVisited,
                VisitedAt = CASE WHEN IsVisited = 0 THEN CAST(GETDATE() AS DATE) ELSE NULL END
            WHERE PlateCode = @plateCode;

            SELECT * FROM Cities WHERE PlateCode = @plateCode;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<City>(sql, new { plateCode });
    }

    public async Task<int> GetVisitedCountAsync()
    {
        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Cities WHERE IsVisited = 1");
    }
}
