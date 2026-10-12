USE TravelTrackerDb;
GO

-- Her kullanıcı sadece kendi verisini görsün.
-- İki farklı yöntem kullanıyoruz:
--   A) Kullanıcının kendi oluşturduğu kayıtlar (gezi, dilek, bölge, ülke)  → tabloya UserId sütunu
--   B) Herkesin ortak listesi (81 il, harikalar, UNESCO)                      → ayrı "işaret" tablosu
-- Var olan kayıtlar ilk kullanıcıya (en küçük Id) verilir.

------------------------------------------------------------
-- A) UserId sütunu ekle
------------------------------------------------------------
ALTER TABLE Trips          ADD UserId INT NULL;
ALTER TABLE WishPlaces     ADD UserId INT NULL;
ALTER TABLE VisitedRegions ADD UserId INT NULL;
ALTER TABLE Countries      ADD UserId INT NULL;
GO

DECLARE @firstUser INT = (SELECT MIN(Id) FROM Users);
UPDATE Trips          SET UserId = @firstUser WHERE UserId IS NULL;
UPDATE WishPlaces     SET UserId = @firstUser WHERE UserId IS NULL;
UPDATE VisitedRegions SET UserId = @firstUser WHERE UserId IS NULL;
UPDATE Countries      SET UserId = @firstUser WHERE UserId IS NULL;
GO

ALTER TABLE Trips          ALTER COLUMN UserId INT NOT NULL;
ALTER TABLE WishPlaces     ALTER COLUMN UserId INT NOT NULL;
ALTER TABLE VisitedRegions ALTER COLUMN UserId INT NOT NULL;
ALTER TABLE Countries      ALTER COLUMN UserId INT NOT NULL;
GO

ALTER TABLE Trips          ADD CONSTRAINT FK_Trips_Users          FOREIGN KEY (UserId) REFERENCES Users(Id);
ALTER TABLE WishPlaces     ADD CONSTRAINT FK_WishPlaces_Users     FOREIGN KEY (UserId) REFERENCES Users(Id);
ALTER TABLE VisitedRegions ADD CONSTRAINT FK_VisitedRegions_Users FOREIGN KEY (UserId) REFERENCES Users(Id);
ALTER TABLE Countries      ADD CONSTRAINT FK_Countries_Users      FOREIGN KEY (UserId) REFERENCES Users(Id);
GO

-- Aynı bölge artık "kullanıcı başına" bir kez işaretlenebilir
ALTER TABLE VisitedRegions DROP CONSTRAINT UQ_VisitedRegions;
ALTER TABLE VisitedRegions ADD CONSTRAINT UQ_VisitedRegions UNIQUE (UserId, CountryIso, RegionName);
GO

-- Countries tablosunda IsoNumeric tekildi; artık her kullanıcının kendi satırı olacak.
-- Eski tekillik kuralının adı otomatik verildiği için adını sistemden bulup siliyoruz.
DECLARE @name SYSNAME;
SELECT @name = name FROM sys.key_constraints
WHERE parent_object_id = OBJECT_ID('Countries') AND type = 'UQ';
IF @name IS NOT NULL EXEC('ALTER TABLE Countries DROP CONSTRAINT ' + @name);

SET @name = NULL;
SELECT @name = name FROM sys.indexes
WHERE object_id = OBJECT_ID('Countries') AND is_unique = 1 AND is_primary_key = 0 AND is_unique_constraint = 0;
IF @name IS NOT NULL EXEC('DROP INDEX ' + @name + ' ON Countries');
GO

ALTER TABLE Countries ADD CONSTRAINT UQ_Countries_User UNIQUE (UserId, IsoNumeric);
GO

------------------------------------------------------------
-- B) Ortak listeler için işaret tabloları
------------------------------------------------------------

-- Türkiye illeri: satır varsa kullanıcı o ile gitmiş demektir
CREATE TABLE UserCities (
    UserId    INT     NOT NULL REFERENCES Users(Id),
    PlateCode TINYINT NOT NULL,
    VisitedAt DATE    NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    CONSTRAINT PK_UserCities PRIMARY KEY (UserId, PlateCode)
);

-- Keşfet'teki harikalar
CREATE TABLE UserLandmarks (
    UserId     INT NOT NULL REFERENCES Users(Id),
    LandmarkId INT NOT NULL REFERENCES Landmarks(Id) ON DELETE CASCADE,
    IsWanted   BIT NOT NULL DEFAULT 0,
    IsVisited  BIT NOT NULL DEFAULT 0,
    CONSTRAINT PK_UserLandmarks PRIMARY KEY (UserId, LandmarkId)
);

-- UNESCO mirasları
CREATE TABLE UserUnescoSites (
    UserId    INT NOT NULL REFERENCES Users(Id),
    SiteId    INT NOT NULL REFERENCES UnescoSites(Id) ON DELETE CASCADE,
    IsWanted  BIT NOT NULL DEFAULT 0,
    IsVisited BIT NOT NULL DEFAULT 0,
    CONSTRAINT PK_UserUnescoSites PRIMARY KEY (UserId, SiteId)
);
GO

-- Eski işaretleri ilk kullanıcıya taşı
DECLARE @firstUser INT = (SELECT MIN(Id) FROM Users);

INSERT INTO UserCities (UserId, PlateCode, VisitedAt)
SELECT @firstUser, PlateCode, ISNULL(VisitedAt, CAST(GETDATE() AS DATE))
FROM Cities WHERE IsVisited = 1;

INSERT INTO UserLandmarks (UserId, LandmarkId, IsWanted, IsVisited)
SELECT @firstUser, Id, IsWanted, IsVisited
FROM Landmarks WHERE IsWanted = 1 OR IsVisited = 1;

INSERT INTO UserUnescoSites (UserId, SiteId, IsWanted, IsVisited)
SELECT @firstUser, Id, IsWanted, IsVisited
FROM UnescoSites WHERE IsWanted = 1 OR IsVisited = 1;
GO

-- Not: Cities, Landmarks ve UnescoSites tablolarındaki eski IsVisited / IsWanted
-- sütunları artık kullanılmıyor. Silmedik; her şey çalışınca istersen kaldırabilirsin.