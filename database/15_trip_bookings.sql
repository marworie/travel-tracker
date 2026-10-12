USE TravelTrackerDb;
GO

-- Ulaşım ve konaklama rezervasyonları
CREATE TABLE TripBookings (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    TripId     INT           NOT NULL REFERENCES Trips(Id) ON DELETE CASCADE,
    Type       VARCHAR(10)   NOT NULL,   -- flight, bus, train, ferry, car, hotel
    Title      NVARCHAR(150) NOT NULL,   -- ör. 'TK1861 İstanbul → Roma' veya 'Hotel Artemide'
    StartAt    DATETIME2     NULL,       -- kalkış / giriş (check-in)
    EndAt      DATETIME2     NULL,       -- varış / çıkış (check-out)
    Reference  NVARCHAR(50)  NULL,       -- PNR, rezervasyon numarası
    Note       NVARCHAR(300) NULL,
    CONSTRAINT CK_TripBookings_Dates CHECK (StartAt IS NULL OR EndAt IS NULL OR EndAt >= StartAt)
);
GO

CREATE INDEX IX_TripBookings_Trip ON TripBookings (TripId, StartAt);
GO