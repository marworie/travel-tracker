USE TravelTrackerDb;
GO

-- Diğer ülkelerde gezilen bölgeler
CREATE TABLE VisitedRegions (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    CountryIso  NVARCHAR(3)   NOT NULL,   -- ISO numeric, ör. '276' = Almanya
    RegionName  NVARCHAR(150) NOT NULL,   -- ör. 'Bayern'
    CreatedAt   DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_VisitedRegions UNIQUE (CountryIso, RegionName)
);
GO

-- Kullanıcının kendi ülkesi (varsayılan Türkiye)
ALTER TABLE Users ADD HomeCountryIso NVARCHAR(3) NOT NULL
    CONSTRAINT DF_Users_HomeCountryIso DEFAULT '792';
GO