USE TravelTrackerDb;
GO

-- Gezi bütçesi: tutar, para birimi ve kaç kişi gidileceği
ALTER TABLE Trips ADD
    Budget        DECIMAL(12,2) NULL,
    Currency      CHAR(3)       NOT NULL CONSTRAINT DF_Trips_Currency DEFAULT 'TRY',
    TravelerCount INT           NOT NULL CONSTRAINT DF_Trips_TravelerCount DEFAULT 1
        CONSTRAINT CK_Trips_TravelerCount CHECK (TravelerCount BETWEEN 1 AND 50);
GO

-- Harcamalar
CREATE TABLE TripExpenses (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    TripId       INT           NOT NULL REFERENCES Trips(Id) ON DELETE CASCADE,
    Category     VARCHAR(20)   NOT NULL,   -- transport, stay, food, activity, other
    Description  NVARCHAR(200) NOT NULL,
    Amount       DECIMAL(12,2) NOT NULL CHECK (Amount > 0),
    Currency     CHAR(3)       NOT NULL,   -- harcamanın yapıldığı para birimi
    ExpenseDate  DATE          NULL,
    CreatedAt    DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE INDEX IX_TripExpenses_Trip ON TripExpenses (TripId);
GO