-- =============================================
-- Mutlaka görülmesi gereken yerler (Keşfet koleksiyonları)
-- Resim ve açıklamalar uygulamada Wikipedia'dan canlı çekilir
-- =============================================
USE TravelTrackerDb;
GO

CREATE TABLE Landmarks (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Collection  VARCHAR(20)    NOT NULL,   -- new7 / iconic / nature / turkey
    Name        NVARCHAR(150)  NOT NULL,   -- Türkçe ad
    WikiTitle   NVARCHAR(200)  NOT NULL,   -- İngilizce Wikipedia sayfa başlığı
    CountryIso  CHAR(3)        NOT NULL,
    City        NVARCHAR(100)  NOT NULL,
    Latitude    DECIMAL(9,5)   NOT NULL,
    Longitude   DECIMAL(9,5)   NOT NULL,
    SortOrder   INT            NOT NULL,
    IsWanted    BIT            NOT NULL DEFAULT 0,
    IsVisited   BIT            NOT NULL DEFAULT 0
);
GO
INSERT INTO Landmarks (Collection, Name, WikiTitle, CountryIso, City, Latitude, Longitude, SortOrder) VALUES
('new7',N'Çin Seddi',N'Great Wall of China','156',N'Pekin',40.43,116.57,1),
('new7',N'Petra',N'Petra','400',N'Maan',30.33,35.44,2),
('new7',N'Kurtarıcı İsa Heykeli',N'Christ the Redeemer (statue)','076',N'Rio de Janeiro',-22.95,-43.21,3),
('new7',N'Machu Picchu',N'Machu Picchu','604',N'Cusco',-13.16,-72.55,4),
('new7',N'Chichén Itzá',N'Chichen Itza','484',N'Yucatán',20.68,-88.57,5),
('new7',N'Kolezyum',N'Colosseum','380',N'Roma',41.89,12.49,6),
('new7',N'Tac Mahal',N'Taj Mahal','356',N'Agra',27.17,78.04,7),
('new7',N'Gize Piramitleri',N'Giza pyramid complex','818',N'Gize',29.98,31.13,8),
('iconic',N'Eyfel Kulesi',N'Eiffel Tower','250',N'Paris',48.858,2.294,9),
('iconic',N'Louvre Müzesi',N'Louvre','250',N'Paris',48.861,2.336,10),
('iconic',N'Mont-Saint-Michel',N'Mont-Saint-Michel','250',N'Normandiya',48.636,-1.511,11),
('iconic',N'Sagrada Família',N'Sagrada Família','724',N'Barselona',41.404,2.174,12),
('iconic',N'Elhamra Sarayı',N'Alhambra','724',N'Granada',37.176,-3.588,13),
('iconic',N'Atina Akropolisi',N'Acropolis of Athens','300',N'Atina',37.971,23.726,14),
('iconic',N'Santorini',N'Santorini','300',N'Kiklad Adaları',36.39,25.46,15),
('iconic',N'Neuschwanstein Şatosu',N'Neuschwanstein Castle','276',N'Bavyera',47.557,10.749,16),
('iconic',N'Yasak Şehir',N'Forbidden City','156',N'Pekin',39.916,116.397,17),
('iconic',N'Angkor Wat',N'Angkor Wat','116',N'Siem Reap',13.412,103.867,18),
('iconic',N'Fushimi Inari Tapınağı',N'Fushimi Inari-taisha','392',N'Kyoto',34.967,135.773,19),
('iconic',N'Bagan Tapınakları',N'Bagan','104',N'Mandalay',21.17,94.86,20),
('iconic',N'Sidney Opera Binası',N'Sydney Opera House','036',N'Sidney',-33.857,151.215,21),
('iconic',N'Özgürlük Heykeli',N'Statue of Liberty','840',N'New York',40.689,-74.045,22),
('iconic',N'Burj Khalifa',N'Burj Khalifa','784',N'Dubai',25.197,55.274,23),
('nature',N'Büyük Kanyon',N'Grand Canyon','840',N'Arizona',36.1,-112.1,24),
('nature',N'Niagara Şelalesi',N'Niagara Falls','124',N'Ontario',43.08,-79.07,25),
('nature',N'Iguazu Şelaleleri',N'Iguazu Falls','032',N'Misiones',-25.69,-54.44,26),
('nature',N'Victoria Şelalesi',N'Victoria Falls','894',N'Livingstone',-17.92,25.86,27),
('nature',N'Büyük Set Resifi',N'Great Barrier Reef','036',N'Queensland',-18.29,147.7,28),
('nature',N'Uluru',N'Uluru','036',N'Kuzey Bölgesi',-25.34,131.04,29),
('nature',N'Ha Long Körfezi',N'Ha Long Bay','704',N'Quảng Ninh',20.91,107.18,30),
('nature',N'Fuji Dağı',N'Mount Fuji','392',N'Shizuoka',35.36,138.73,31),
('nature',N'Salar de Uyuni',N'Salar de Uyuni','068',N'Potosí',-20.13,-67.49,32),
('nature',N'Plitvice Gölleri',N'Plitvice Lakes National Park','191',N'Lika',44.88,15.62,33),
('nature',N'Matterhorn',N'Matterhorn','756',N'Zermatt',45.976,7.658,34),
('nature',N'Milford Sound',N'Milford Sound','554',N'Fiordland',-44.64,167.9,35),
('nature',N'Masa Dağı',N'Table Mountain','710',N'Cape Town',-33.96,18.4,36),
('nature',N'Banff Ulusal Parkı',N'Banff National Park','124',N'Alberta',51.5,-116.0,37),
('turkey',N'Ayasofya',N'Hagia Sophia','792',N'İstanbul',41.008,28.98,38),
('turkey',N'Topkapı Sarayı',N'Topkapı Palace','792',N'İstanbul',41.011,28.983,39),
('turkey',N'Galata Kulesi',N'Galata Tower','792',N'İstanbul',41.026,28.974,40),
('turkey',N'Kapadokya',N'Cappadocia','792',N'Nevşehir',38.64,34.83,41),
('turkey',N'Pamukkale',N'Pamukkale','792',N'Denizli',37.92,29.12,42),
('turkey',N'Efes Antik Kenti',N'Ephesus','792',N'İzmir',37.94,27.34,43),
('turkey',N'Nemrut Dağı',N'Mount Nemrut','792',N'Adıyaman',37.98,38.74,44),
('turkey',N'Sümela Manastırı',N'Sümela Monastery','792',N'Trabzon',40.69,39.66,45),
('turkey',N'Ölüdeniz',N'Ölüdeniz','792',N'Muğla',36.55,29.12,46),
('turkey',N'Göbeklitepe',N'Göbekli Tepe','792',N'Şanlıurfa',37.22,38.92,47),
('turkey',N'Ani Harabeleri',N'Ani','792',N'Kars',40.51,43.57,48),
('turkey',N'Safranbolu',N'Safranbolu','792',N'Karabük',41.25,32.69,49);
GO

SELECT Collection, COUNT(*) AS YerSayisi FROM Landmarks GROUP BY Collection;
GO
