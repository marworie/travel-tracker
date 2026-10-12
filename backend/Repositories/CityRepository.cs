using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ICityRepository
{
    Task<IEnumerable<City>> GetAllAsync(int userId);
    Task<City?> ToggleVisitedAsync(int userId, byte plateCode);
    Task<int> GetVisitedCountAsync(int userId);
}

public class CityRepository : ICityRepository
{
    private readonly string _connectionString;

    public CityRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // 81 il herkes için aynı; "gidildi mi" bilgisi kullanıcıya göre UserCities tablosundan gelir
    private const string SelectSql = @"
        SELECT c.Id, c.PlateCode, c.Name,
               CAST(CASE WHEN uc.UserId IS NULL THEN 0 ELSE 1 END AS BIT) AS IsVisited,
               uc.VisitedAt
        FROM Cities c
        LEFT JOIN UserCities uc ON uc.PlateCode = c.PlateCode AND uc.UserId = @userId";

    public async Task<IEnumerable<City>> GetAllAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<City>($"{SelectSql} ORDER BY c.PlateCode", new { userId });
    }

    public async Task<City?> ToggleVisitedAsync(int userId, byte plateCode)
    {
        // Kayıt varsa sil (gidilmedi), yoksa ekle (gidildi)
        var sql = $@"
            IF EXISTS (SELECT 1 FROM UserCities WHERE UserId = @userId AND PlateCode = @plateCode)
                DELETE FROM UserCities WHERE UserId = @userId AND PlateCode = @plateCode;
            ELSE
                INSERT INTO UserCities (UserId, PlateCode) VALUES (@userId, @plateCode);

            {SelectSql} WHERE c.PlateCode = @plateCode;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<City>(sql, new { userId, plateCode });
    }

    public async Task<int> GetVisitedCountAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM UserCities WHERE UserId = @userId", new { userId });
    }
}