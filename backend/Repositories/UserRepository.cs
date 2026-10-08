using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TravelTracker.Api.Models;

namespace TravelTracker.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User> CreateAsync(string username, string passwordHash);
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
}
