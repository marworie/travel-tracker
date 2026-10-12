USE TravelTrackerDb;
GO

-- İlk gün oluşturulan ama hiç kullanılmayan eski tablo
DROP TABLE IF EXISTS WishlistItems;
GO

-- Gitmek istediğim yerler
CREATE TABLE WishPlaces (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(150) NOT NULL,              -- ör. 'Kuzey ışıkları'
    CountryIso      CHAR(3)       NOT NULL,              -- ISO numeric, ör. '578' = Norveç
    City            NVARCHAR(100) NULL,                  -- ör. 'Tromsø'
    Category        VARCHAR(20)   NOT NULL,              -- nature, history, food, sea, adventure, city
    Priority        TINYINT       NOT NULL DEFAULT 2 CHECK (Priority BETWEEN 1 AND 3), -- 1 düşük, 2 orta, 3 yüksek
    EstimatedBudget DECIMAL(12,2) NULL CHECK (EstimatedBudget >= 0),
    Currency        CHAR(3)       NOT NULL DEFAULT 'TRY',
    BestSeason      VARCHAR(10)   NULL,                  -- spring, summer, autumn, winter
    Note            NVARCHAR(500) NULL,
    IsDone          BIT           NOT NULL DEFAULT 0,
    DoneAt          DATETIME2     NULL,
    CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);
GO