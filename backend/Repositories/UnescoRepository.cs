using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IUnescoRepository
{
    Task<IEnumerable<UnescoSite>> GetByCountryAsync(int userId, string countryIso);
    Task<UnescoSite?> ToggleAsync(int userId, int id, string field);
    Task<IEnumerable<UnescoCountry>> GetCountriesAsync();
    Task<IEnumerable<UnescoSite>> GetSavedAsync(int userId);
}

public class UnescoRepository : IUnescoRepository
{
    private readonly string _connectionString;

    public UnescoRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // Miraslar herkes için aynı; ⭐ ve ✓ işaretleri UserUnescoSites tablosundan gelir
    private const string SelectSql = @"
        SELECT s.Id, s.Name, s.Category, s.YearInscribed, s.Latitude, s.Longitude, s.Url, s.InDanger,
               ISNULL(us.IsWanted, 0)  AS IsWanted,
               ISNULL(us.IsVisited, 0) AS IsVisited";

    private const string FromSql = @"
        FROM UnescoSites s
        LEFT JOIN UserUnescoSites us ON us.SiteId = s.Id AND us.UserId = @userId";

    // Bir ülkedeki tüm UNESCO mirasları (JOIN ile çoka-çok tablodan)
    public async Task<IEnumerable<UnescoSite>> GetByCountryAsync(int userId, string countryIso)
    {
        var sql = $@"
            {SelectSql}
            {FromSql}
            JOIN UnescoSiteCountries sc ON sc.SiteId = s.Id
            WHERE sc.CountryIso = @countryIso
            ORDER BY ISNULL(us.IsVisited, 0), s.Name";

        using var db = CreateConnection();
        return await db.QueryAsync<UnescoSite>(sql, new { userId, countryIso });
    }

    // field: "IsWanted" veya "IsVisited" — sadece bu ikisine izin veriyoruz
    public async Task<UnescoSite?> ToggleAsync(int userId, int id, string field)
    {
        if (field != "IsWanted" && field != "IsVisited")
            throw new ArgumentException("Geçersiz alan.");

        var sql = $@"
            IF EXISTS (SELECT 1 FROM UnescoSites WHERE Id = @id)
               AND NOT EXISTS (SELECT 1 FROM UserUnescoSites WHERE UserId = @userId AND SiteId = @id)
                INSERT INTO UserUnescoSites (UserId, SiteId) VALUES (@userId, @id);

            UPDATE UserUnescoSites SET {field} = 1 - {field}
            WHERE UserId = @userId AND SiteId = @id;

            DELETE FROM UserUnescoSites
            WHERE UserId = @userId AND SiteId = @id AND IsWanted = 0 AND IsVisited = 0;

            {SelectSql}
            {FromSql}
            WHERE s.Id = @id;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<UnescoSite>(sql, new { userId, id });
    }

    // UNESCO mirası olan ülkeler ve kaçar mirasları olduğu (herkes için aynı)
    public async Task<IEnumerable<UnescoCountry>> GetCountriesAsync()
    {
        const string sql = @"
            SELECT CountryIso, COUNT(*) AS SiteCount
            FROM UnescoSiteCountries
            GROUP BY CountryIso";

        using var db = CreateConnection();
        return await db.QueryAsync<UnescoCountry>(sql);
    }

    // ⭐ veya ✓ işaretlenmiş miraslar (ilk ülkesiyle birlikte)
    public async Task<IEnumerable<UnescoSite>> GetSavedAsync(int userId)
    {
        var sql = $@"
            {SelectSql},
                   (SELECT TOP 1 CountryIso FROM UnescoSiteCountries WHERE SiteId = s.Id) AS CountryIso
            {FromSql}
            WHERE us.IsWanted = 1 OR us.IsVisited = 1
            ORDER BY s.Name";

        using var db = CreateConnection();
        return await db.QueryAsync<UnescoSite>(sql, new { userId });
    }
}