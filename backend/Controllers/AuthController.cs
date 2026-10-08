using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;
using TravelTracker.Api.Services;

namespace TravelTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous] // giriş ve kayıt token olmadan çalışmalı
public class AuthController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokens;

    public AuthController(IUserRepository users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest req)
    {
        var username = req.Username.Trim();

        if (username.Length < 3 || username.Length > 50)
            return BadRequest("Kullanıcı adı 3 ile 50 karakter arasında olmalı.");
        if (req.Password.Length < 6)
            return BadRequest("Şifre en az 6 karakter olmalı.");
        if (await _users.GetByUsernameAsync(username) is not null)
            return Conflict("Bu kullanıcı adı alınmış.");

        // Şifre asla düz metin saklanmaz; BCrypt her seferinde farklı "salt" ile hash'ler
        var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        var user = await _users.CreateAsync(username, hash);

        return Ok(new AuthResponse { Token = _tokens.CreateToken(user), Username = user.Username });
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest req)
    {
        var user = await _users.GetByUsernameAsync(req.Username.Trim());

        // Kullanıcı yoksa da şifre yanlışsa da aynı mesaj: hangisinin yanlış olduğunu belli etmiyoruz
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized("Kullanıcı adı veya şifre hatalı.");

        return Ok(new AuthResponse { Token = _tokens.CreateToken(user), Username = user.Username });
    }
}
