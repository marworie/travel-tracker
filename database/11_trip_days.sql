USE TravelTrackerDb;
GO

-- Gezinin kaç gün süreceği (mevcut geziler 1 gün olarak başlar)
ALTER TABLE Trips ADD DayCount INT NOT NULL
    CONSTRAINT DF_Trips_DayCount DEFAULT 1
    CONSTRAINT CK_Trips_DayCount CHECK (DayCount BETWEEN 1 AND 60);
GO

-- Her günün yapılacakları
CREATE TABLE TripActivities (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    TripId     INT           NOT NULL REFERENCES Trips(Id) ON DELETE CASCADE,
    DayNumber  INT           NOT NULL,   -- 1. gün, 2. gün ...
    Text       NVARCHAR(300) NOT NULL,   -- ör. 'Ayasofya'yı gez'
    CreatedAt  DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE INDEX IX_TripActivities_Trip ON TripActivities (TripId, DayNumber);
GO