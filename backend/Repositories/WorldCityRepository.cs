using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace TravelTracker.Api.Repositories;

public interface IWorldCityRepository
{
    Task<IEnumerable<string>> SearchAsync(string countryIso, string? query);
}

public class WorldCityRepository : IWorldCityRepository
{
    private readonly string _connectionString;

    public WorldCityRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // Ülkedeki şehirlerden, yazılan harflerle başlayan en kalabalık 10 tanesi
    public async Task<IEnumerable<string>> SearchAsync(string countryIso, string? query)
    {
        // LIKE içinde özel anlamı olan karakterleri etkisiz hale getir
        var q = (query ?? "").Trim()
            .Replace("[", "[[]")
            .Replace("%", "[%]")
            .Replace("_", "[_]");

        const string sql = @"
            SELECT TOP 10 Name
            FROM WorldCities
            WHERE CountryIso = @countryIso AND Name LIKE @q + '%'
            GROUP BY Name
            ORDER BY MAX(Population) DESC";

        using var db = CreateConnection();
        return await db.QueryAsync<string>(sql, new { countryIso, q });
    }
}
