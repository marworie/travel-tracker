using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface ILandmarkRepository
{
    Task<IEnumerable<Landmark>> GetAllAsync(int userId);
    Task<IEnumerable<Landmark>> GetSavedAsync(int userId);
    Task<Landmark?> ToggleAsync(int userId, int id, string field);
}

public class LandmarkRepository : ILandmarkRepository
{
    private readonly string _connectionString;

    public LandmarkRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // Harikalar herkes için aynı; ⭐ ve ✓ işaretleri kullanıcıya göre UserLandmarks tablosundan gelir.
    // Kullanıcının satırı yoksa LEFT JOIN NULL döner, ISNULL ile 0 (işaretsiz) yapıyoruz.
    private const string SelectSql = @"
        SELECT l.Id, l.Collection, l.Name, l.WikiTitle, l.CountryIso, l.City,
               l.Latitude, l.Longitude, l.SortOrder,
               ISNULL(ul.IsWanted, 0)  AS IsWanted,
               ISNULL(ul.IsVisited, 0) AS IsVisited
        FROM Landmarks l
        LEFT JOIN UserLandmarks ul ON ul.LandmarkId = l.Id AND ul.UserId = @userId";

    public async Task<IEnumerable<Landmark>> GetAllAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Landmark>($"{SelectSql} ORDER BY l.SortOrder", new { userId });
    }

    // ⭐ listeye eklenen veya ✓ gidilen yerler
    public async Task<IEnumerable<Landmark>> GetSavedAsync(int userId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Landmark>(
            $"{SelectSql} WHERE ul.IsWanted = 1 OR ul.IsVisited = 1 ORDER BY l.Name", new { userId });
    }

    // field sadece "IsWanted" veya "IsVisited" olabilir
    public async Task<Landmark?> ToggleAsync(int userId, int id, string field)
    {
        if (field != "IsWanted" && field != "IsVisited")
            throw new ArgumentException("Geçersiz alan.");

        var sql = $@"
            -- Kullanıcının bu yer için satırı yoksa önce boş bir satır aç
            IF EXISTS (SELECT 1 FROM Landmarks WHERE Id = @id)
               AND NOT EXISTS (SELECT 1 FROM UserLandmarks WHERE UserId = @userId AND LandmarkId = @id)
                INSERT INTO UserLandmarks (UserId, LandmarkId) VALUES (@userId, @id);

            UPDATE UserLandmarks SET {field} = 1 - {field}
            WHERE UserId = @userId AND LandmarkId = @id;

            -- İki işaret de kalktıysa satıra gerek yok
            DELETE FROM UserLandmarks
            WHERE UserId = @userId AND LandmarkId = @id AND IsWanted = 0 AND IsVisited = 0;

            {SelectSql} WHERE l.Id = @id;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<Landmark>(sql, new { userId, id });
    }
}