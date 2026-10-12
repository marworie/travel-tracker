USE TravelTrackerDb;
GO

-- Geziye 1–5 arası puan
ALTER TABLE Trips ADD Rating TINYINT NULL CONSTRAINT CK_Trips_Rating CHECK (Rating BETWEEN 1 AND 5);
GO

-- Gezi günlüğü: notlar (isteğe bağlı olarak bir güne bağlı)
CREATE TABLE TripNotes (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    TripId     INT            NOT NULL REFERENCES Trips(Id) ON DELETE CASCADE,
    DayNumber  INT            NULL,
    Text       NVARCHAR(2000) NOT NULL,
    CreatedAt  DATETIME2      NOT NULL DEFAULT SYSDATETIME()
);
GO

-- Yüklenen fotoğraflar ve belgeler (dosyanın kendisi diskte, burada sadece bilgisi)
CREATE TABLE TripFiles (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    TripId       INT           NOT NULL REFERENCES Trips(Id) ON DELETE CASCADE,
    Kind         VARCHAR(10)   NOT NULL,   -- photo, document
    FileName     NVARCHAR(255) NOT NULL,   -- kullanıcının yüklediği orijinal ad
    StoredName   VARCHAR(100)  NOT NULL,   -- diskteki ad: rastgele GUID + uzantı
    ContentType  VARCHAR(100)  NOT NULL,
    SizeBytes    INT           NOT NULL,
    Caption      NVARCHAR(200) NULL,
    CreatedAt    DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE INDEX IX_TripNotes_Trip ON TripNotes (TripId);
CREATE INDEX IX_TripFiles_Trip ON TripFiles (TripId);
GO