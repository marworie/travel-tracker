USE TravelTrackerDb;
GO

-- Gün içindeki yapılacakların sırası (1, 2, 3...)
ALTER TABLE TripActivities ADD SortOrder INT NOT NULL CONSTRAINT DF_TripActivities_SortOrder DEFAULT 0;
GO

-- Var olan kayıtlara eklenme sırasına göre numara ver.
-- PARTITION BY: her gezinin her günü için numaralandırma 1'den yeniden başlar.
WITH Numbered AS (
    SELECT SortOrder,
           ROW_NUMBER() OVER (PARTITION BY TripId, DayNumber ORDER BY Id) AS RowNo
    FROM TripActivities
)
UPDATE Numbered SET SortOrder = RowNo;
GO