-- =============================================
-- Gezi planları ve durakları
-- =============================================
USE TravelTrackerDb;
GO

CREATE TABLE Trips (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(150)   NOT NULL,
    StartDate   DATE            NULL,
    EndDate     DATE            NULL,
    Note        NVARCHAR(1000)  NULL,
    CreatedAt   DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    -- bitiş tarihi başlangıçtan önce olamaz
    CONSTRAINT CK_Trips_Dates CHECK (StartDate IS NULL OR EndDate IS NULL OR EndDate >= StartDate)
);
GO

CREATE TABLE TripStops (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    -- gezi silinince durakları da otomatik silinir
    TripId      INT            NOT NULL REFERENCES Trips(Id) ON DELETE CASCADE,
    StopOrder   INT            NOT NULL,   -- 1, 2, 3 ... sırası
    CountryIso  CHAR(3)        NOT NULL,
    Place       NVARCHAR(200)  NOT NULL,   -- şehir veya yer adı
    StopDate    DATE           NULL,
    Note        NVARCHAR(500)  NULL
);
GO

CREATE INDEX IX_TripStops_Trip ON TripStops (TripId, StopOrder);
GO
