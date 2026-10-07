using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IForeignCityRepository
{
    Task<IEnumerable<ForeignCity>> GetAllAsync();
    Task<ForeignCity> AddAsync(string isoNumeric, string countryName, string cityName);
    Task<bool> DeleteAsync(int id);
    Task<int> GetCountAsync();
}

public class ForeignCityRepository : IForeignCityRepository
{
    private readonly string _connectionString;

    public ForeignCityRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // Ülke bilgisiyle birlikte (JOIN) tüm şehirler
    private const string SelectSql = @"
        SELECT fc.Id, fc.CountryId, fc.Name,
               c.IsoNumeric, c.Name AS CountryName
        FROM ForeignCities fc
        JOIN Countries c ON c.Id = fc.CountryId";

    public async Task<IEnumerable<ForeignCity>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<ForeignCity>($"{SelectSql} ORDER BY c.Name, fc.Name");
    }

    public async Task<ForeignCity> AddAsync(string isoNumeric, string countryName, string cityName)
    {
        // Bir ülkeye şehir eklendiyse o ülkeye gidilmiş demektir:
        // ülke yoksa eklenir, varsa "gidildi" yapılır.
        var sql = $@"
            IF NOT EXISTS (SELECT 1 FROM Countries WHERE IsoNumeric = @isoNumeric)
                INSERT INTO Countries (IsoNumeric, Name, IsVisited, VisitedAt)
                VALUES (@isoNumeric, @countryName, 1, CAST(GETDATE() AS DATE));
            ELSE
                UPDATE Countries
                SET IsVisited = 1,
                    VisitedAt = COALESCE(VisitedAt, CAST(GETDATE() AS DATE))
                WHERE IsoNumeric = @isoNumeric;

            DECLARE @countryId INT = (SELECT Id FROM Countries WHERE IsoNumeric = @isoNumeric);

            IF NOT EXISTS (SELECT 1 FROM ForeignCities WHERE CountryId = @countryId AND Name = @cityName)
                INSERT INTO ForeignCities (CountryId, Name) VALUES (@countryId, @cityName);

            {SelectSql}
            WHERE fc.CountryId = @countryId AND fc.Name = @cityName;";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<ForeignCity>(sql, new { isoNumeric, countryName, cityName });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var db = CreateConnection();
        var affected = await db.ExecuteAsync("DELETE FROM ForeignCities WHERE Id = @id", new { id });
        return affected > 0;
    }

    public async Task<int> GetCountAsync()
    {
        using var db = CreateConnection();
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM ForeignCities");
    }
}
