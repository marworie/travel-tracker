using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using TravelTracker.Api.Models;
using TravelTracker.Api.Services;
using System.Security.Claims;

namespace TravelTracker.Tests;

public class TokenServiceTests
{
    // appsettings.json yerine testte ayarları elle veriyoruz
    private static TokenService CreateService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-anahtari-en-az-32-karakter-olmali-12345",
                ["Jwt:Issuer"] = "TravelTracker",
                ["Jwt:Audience"] = "TravelTracker",
                ["Jwt:ExpiresHours"] = "2",
            })
            .Build();

        return new TokenService(config);
    }

    [Fact]
    public void CreateToken_ContainsUserIdAndUsername()
    {
        var token = CreateService().CreateToken(new User { Id = 5, Username = "elif" });

        // Token'ı çözüp içine bakıyoruz (imzayı doğrulamadan)
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        // ClaimTypes.NameIdentifier token'a "nameid", ClaimTypes.Name ise "unique_name" olarak yazılır
        // Kütüphane sürümüne göre kısa ("nameid") veya uzun adla yazılabiliyor, ikisini de kabul et
        Assert.Equal("5", jwt.Claims.First(c => c.Type is "nameid" or ClaimTypes.NameIdentifier).Value);
        Assert.Equal("elif", jwt.Claims.First(c => c.Type is "unique_name" or ClaimTypes.Name).Value);
    }

    [Fact]
    public void CreateToken_ExpiresAfterConfiguredHours()
    {
        var token = CreateService().CreateToken(new User { Id = 5, Username = "elif" });
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        var expected = DateTime.UtcNow.AddHours(2);
        Assert.InRange(jwt.ValidTo, expected.AddMinutes(-1), expected.AddMinutes(1));
    }
}