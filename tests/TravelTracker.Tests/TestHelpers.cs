using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TravelTracker.Tests;

public static class TestHelpers
{
    // Controller'a "şu kullanıcı giriş yapmış" bilgisini veriyoruz.
    // Gerçekte bunu JWT middleware'i token'dan okuyup doldurur.
    public static void SignIn(ControllerBase controller, int userId)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        }, "Test");

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }
}