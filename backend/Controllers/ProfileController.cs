using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IUserRepository _users;
    public ProfileController(IUserRepository users) => _users = users;

    // Giriş yapan kullanıcının id'si token'ın içinden okunur
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var user = await _users.GetByIdAsync(CurrentUserId);
        if (user is null) return NotFound();
        return Ok(ToProfile(user));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest req)
    {
        var username = req.Username.Trim();
        if (username.Length < 3 || username.Length > 50)
            return BadRequest("Kullanıcı adı 3 ile 50 karakter arasında olmalı.");

        // Başka biri bu adı kullanıyorsa izin verme (kendi adını tekrar kaydetmek serbest)
        var owner = await _users.GetByUsernameAsync(username);
        if (owner is not null && owner.Id != CurrentUserId)
            return Conflict("Bu kullanıcı adı alınmış.");

        req.Username = username;
        if (string.IsNullOrWhiteSpace(req.HomeCountryIso)) req.HomeCountryIso = "792";
        req.DisplayName = Clean(req.DisplayName, 100);
        req.HomeCity = Clean(req.HomeCity, 50);
        req.Bio = Clean(req.Bio, 300);

        await _users.UpdateProfileAsync(CurrentUserId, req);
        var user = await _users.GetByIdAsync(CurrentUserId);
        return Ok(ToProfile(user!));
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var user = await _users.GetByIdAsync(CurrentUserId);
        if (user is null) return NotFound();
        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest("Mevcut şifre hatalı.");
        if (req.NewPassword.Length < 6)
            return BadRequest("Yeni şifre en az 6 karakter olmalı.");

        await _users.UpdatePasswordAsync(user.Id, BCrypt.Net.BCrypt.HashPassword(req.NewPassword));
        return NoContent();
    }

    private static UserProfile ToProfile(User u) => new()
    {
        Username = u.Username, DisplayName = u.DisplayName,
        HomeCity = u.HomeCity, Bio = u.Bio, HomeCountryIso = u.HomeCountryIso, CreatedAt = u.CreatedAt,
    };

    // Boş alan → NULL, fazla uzunsa kırp
    private static string? Clean(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        value = value.Trim();
        return value.Length > max ? value[..max] : value;
    }
}