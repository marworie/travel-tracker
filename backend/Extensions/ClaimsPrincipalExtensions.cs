using System.Security.Claims;

namespace TravelTracker.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    // Token'daki kullanıcı id'sini okur. Controller'larda User.GetUserId() diye kullanılır.
    public static int GetUserId(this ClaimsPrincipal user)
        => int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}