using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ILandmarkRepository
{
    Task<IEnumerable<Landmark>> GetAllAsync();
    Task<IEnumerable<Landmark>> GetSavedAsync();
    Task<Landmark?> ToggleAsync(int id, string field);
}

public class LandmarkRepository : ILandmarkRepository
{
    private readonly string _connectionString;

    public LandmarkRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Landmark>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Landmark>("SELECT * FROM Landmarks ORDER BY SortOrder");
    }

    // ⭐ listeye eklenen veya ✓ gidilen yerler
    public async Task<IEnumerable<Landmark>> GetSavedAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Landmark>(
            "SELECT * FROM Landmarks WHERE IsWanted = 1 OR IsVisited = 1 ORDER BY Name");
    }

    // field sadece "IsWanted" veya "IsVisited" olabilir
    public async Task<Landmark?> ToggleAsync(int id, string field)
    {
        if (field != "IsWanted" && field != "IsVisited")
            throw new ArgumentException("Geçersiz alan.");

        var sql = $@"
            UPDATE Landmarks SET {field} = 1 - {field} WHERE Id = @id;
            SELECT * FROM Landmarks WHERE Id = @id;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<Landmark>(sql, new { id });
    }
}
