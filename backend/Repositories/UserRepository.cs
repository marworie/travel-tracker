using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User> CreateAsync(string username, string passwordHash);
    Task<User?> GetByIdAsync(int id);
    Task UpdateProfileAsync(int id, UpdateProfileRequest req);
    Task UpdatePasswordAsync(int id, string passwordHash);
}

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @username", new { username });
    }

    public async Task<User> CreateAsync(string username, string passwordHash)
    {
        const string sql = @"
            INSERT INTO Users (Username, PasswordHash)
            OUTPUT INSERTED.*
            VALUES (@username, @passwordHash);";

        using var db = CreateConnection();
        return await db.QuerySingleAsync<User>(sql, new { username, passwordHash });
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<User>("SELECT * FROM Users WHERE Id = @id", new { id });
    }

    public async Task UpdateProfileAsync(int id, UpdateProfileRequest req)
    {
        using var db = CreateConnection();
        await db.ExecuteAsync(
            "UPDATE Users SET Username = @Username, DisplayName = @DisplayName, HomeCity = @HomeCity, Bio = @Bio, HomeCountryIso = @HomeCountryIso WHERE Id = @id",
            new { id, req.Username, req.DisplayName, req.HomeCity, req.Bio, req.HomeCountryIso });
    }

    public async Task UpdatePasswordAsync(int id, string passwordHash)
    {
        using var db = CreateConnection();
        await db.ExecuteAsync("UPDATE Users SET PasswordHash = @passwordHash WHERE Id = @id", new { id, passwordHash });
    }
}
