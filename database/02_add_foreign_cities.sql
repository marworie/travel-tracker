-- =============================================
-- Yurt dışı şehirler tablosu
-- Bir ülkenin içinde gezilen şehirler (ör. Fransa → Paris, Lyon)
-- =============================================
USE TravelTrackerDb;
GO

CREATE TABLE ForeignCities (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    CountryId   INT            NOT NULL REFERENCES Countries(Id),
    Name        NVARCHAR(100)  NOT NULL,
    CreatedAt   DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_ForeignCities_Country_Name UNIQUE (CountryId, Name)
);
GO
