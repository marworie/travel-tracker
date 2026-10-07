using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IUnescoRepository
{
    Task<IEnumerable<UnescoSite>> GetByCountryAsync(string countryIso);
    Task<UnescoSite?> ToggleAsync(int id, string field);
    Task<IEnumerable<UnescoCountry>> GetCountriesAsync();
    Task<IEnumerable<UnescoSite>> GetSavedAsync();
}

public class UnescoRepository : IUnescoRepository
{
    private readonly string _connectionString;

    public UnescoRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<UnescoSite>> GetByCountryAsync(string countryIso)
    {
        const string sql = @"
            SELECT s.*
            FROM UnescoSites s
            JOIN UnescoSiteCountries sc ON sc.SiteId = s.Id
            WHERE sc.CountryIso = @countryIso
            ORDER BY s.IsVisited, s.Name";

        using var db = CreateConnection();
        return await db.QueryAsync<UnescoSite>(sql, new { countryIso });
    }

    // field sadece "IsWanted" veya "IsVisited" olabilir
    public async Task<UnescoSite?> ToggleAsync(int id, string field)
    {
        if (field != "IsWanted" && field != "IsVisited")
            throw new ArgumentException("Geçersiz alan.");

        var sql = $@"
            UPDATE UnescoSites SET {field} = 1 - {field} WHERE Id = @id;
            SELECT * FROM UnescoSites WHERE Id = @id;";

        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<UnescoSite>(sql, new { id });
    }

        public async Task<IEnumerable<UnescoCountry>> GetCountriesAsync()
    {
        const string sql = @"
            SELECT CountryIso, COUNT(*) AS SiteCount
            FROM UnescoSiteCountries
            GROUP BY CountryIso";
        using var db = CreateConnection();
        return await db.QueryAsync<UnescoCountry>(sql);
    }

    public async Task<IEnumerable<UnescoSite>> GetSavedAsync()
    {
        const string sql = @"
            SELECT s.*,
                   (SELECT TOP 1 CountryIso FROM UnescoSiteCountries WHERE SiteId = s.Id) AS CountryIso
            FROM UnescoSites s
            WHERE s.IsWanted = 1 OR s.IsVisited = 1
            ORDER BY s.Name";
        using var db = CreateConnection();
        return await db.QueryAsync<UnescoSite>(sql);
    }
}