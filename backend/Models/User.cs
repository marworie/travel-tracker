namespace TravelTracker.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? HomeCity { get; set; }
    public string? Bio { get; set; }
    public string HomeCountryIso { get; set; } = "792";
    public DateTime CreatedAt { get; set; }
}

// Giriş ve kayıt formundan gelen veri
public class AuthRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// Başarılı giriş/kayıt sonrası frontend'e dönen cevap
public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}

public class UserProfile
{
    public string Username { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? HomeCity { get; set; }
    public string? Bio { get; set; }
    public string HomeCountryIso { get; set; } = "792";
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileRequest
{
    public string Username { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? HomeCity { get; set; }
    public string? Bio { get; set; }
    public string HomeCountryIso { get; set; } = "792";
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
