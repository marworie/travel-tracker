-- =============================================
-- Kullanıcılar (giriş ekranı için)
-- Şifreler düz metin değil, BCrypt hash olarak saklanır
-- =============================================
USE TravelTrackerDb;
GO

DROP TABLE IF EXISTS Users;
GO

CREATE TABLE Users (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Username      NVARCHAR(50)   NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(200)  NOT NULL,
    CreatedAt     DATETIME2      NOT NULL DEFAULT SYSDATETIME()
);
GO
