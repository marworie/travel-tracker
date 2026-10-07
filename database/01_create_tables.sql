-- =============================================
-- Seyahat Takip Uygulaması - Veritabanı Kurulumu
-- SQL Server
-- =============================================

CREATE DATABASE TravelTrackerDb;
GO

USE TravelTrackerDb;
GO

-- ---------------------------------------------
-- Ülkeler (dünya haritası)
-- IsoNumeric: world-atlas haritasındaki ülke id'si (ör. Türkiye = '792')
-- Ülke listesi daha sonra harita verisinden otomatik doldurulacak
-- ---------------------------------------------
CREATE TABLE Countries (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    IsoNumeric  CHAR(3)        NOT NULL UNIQUE,
    Name        NVARCHAR(100)  NOT NULL,
    IsVisited   BIT            NOT NULL DEFAULT 0,
    VisitedAt   DATE           NULL
);
GO

-- ---------------------------------------------
-- İller (Türkiye haritası)
-- PlateCode: plaka kodu (1-81)
-- ---------------------------------------------
CREATE TABLE Cities (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    PlateCode   TINYINT        NOT NULL UNIQUE,
    Name        NVARCHAR(50)   NOT NULL,
    IsVisited   BIT            NOT NULL DEFAULT 0,
    VisitedAt   DATE           NULL
);
GO

-- ---------------------------------------------
-- Gezilecek yerler listesi
-- Ya bir ülkeye ya da bir ile bağlanır
-- ---------------------------------------------
CREATE TABLE WishlistItems (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(150)  NOT NULL,   -- ör. "Peri Bacaları", "Galata Kulesi"
    Note        NVARCHAR(500)  NULL,
    CountryId   INT            NULL REFERENCES Countries(Id),
    CityId      INT            NULL REFERENCES Cities(Id),
    IsDone      BIT            NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_Wishlist_OneTarget CHECK (
        (CountryId IS NOT NULL AND CityId IS NULL) OR
        (CountryId IS NULL AND CityId IS NOT NULL)
    )
);
GO

-- ---------------------------------------------
-- 81 il
-- ---------------------------------------------
INSERT INTO Cities (PlateCode, Name) VALUES
(1, N'Adana'), (2, N'Adıyaman'), (3, N'Afyonkarahisar'), (4, N'Ağrı'), (5, N'Amasya'),
(6, N'Ankara'), (7, N'Antalya'), (8, N'Artvin'), (9, N'Aydın'), (10, N'Balıkesir'),
(11, N'Bilecik'), (12, N'Bingöl'), (13, N'Bitlis'), (14, N'Bolu'), (15, N'Burdur'),
(16, N'Bursa'), (17, N'Çanakkale'), (18, N'Çankırı'), (19, N'Çorum'), (20, N'Denizli'),
(21, N'Diyarbakır'), (22, N'Edirne'), (23, N'Elazığ'), (24, N'Erzincan'), (25, N'Erzurum'),
(26, N'Eskişehir'), (27, N'Gaziantep'), (28, N'Giresun'), (29, N'Gümüşhane'), (30, N'Hakkari'),
(31, N'Hatay'), (32, N'Isparta'), (33, N'Mersin'), (34, N'İstanbul'), (35, N'İzmir'),
(36, N'Kars'), (37, N'Kastamonu'), (38, N'Kayseri'), (39, N'Kırklareli'), (40, N'Kırşehir'),
(41, N'Kocaeli'), (42, N'Konya'), (43, N'Kütahya'), (44, N'Malatya'), (45, N'Manisa'),
(46, N'Kahramanmaraş'), (47, N'Mardin'), (48, N'Muğla'), (49, N'Muş'), (50, N'Nevşehir'),
(51, N'Niğde'), (52, N'Ordu'), (53, N'Rize'), (54, N'Sakarya'), (55, N'Samsun'),
(56, N'Siirt'), (57, N'Sinop'), (58, N'Sivas'), (59, N'Tekirdağ'), (60, N'Tokat'),
(61, N'Trabzon'), (62, N'Tunceli'), (63, N'Şanlıurfa'), (64, N'Uşak'), (65, N'Van'),
(66, N'Yozgat'), (67, N'Zonguldak'), (68, N'Aksaray'), (69, N'Bayburt'), (70, N'Karaman'),
(71, N'Kırıkkale'), (72, N'Batman'), (73, N'Şırnak'), (74, N'Bartın'), (75, N'Ardahan'),
(76, N'Iğdır'), (77, N'Yalova'), (78, N'Karabük'), (79, N'Kilis'), (80, N'Osmaniye'),
(81, N'Düzce');
GO
