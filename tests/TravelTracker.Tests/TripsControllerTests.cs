using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelTracker.Api.Controllers;
using TravelTracker.Api.Models;
using TravelTracker.Api.Repositories;

namespace TravelTracker.Tests;

public class TripsControllerTests
{
    private const int UserId = 7;

    // Gerçek veritabanı yerine sahte (mock) bir repository kullanıyoruz.
    // Böylece sadece controller'daki kuralları test etmiş oluyoruz.
    private readonly Mock<ITripRepository> _repo = new();
    private readonly TripsController _controller;

    public TripsControllerTests()
    {
        _controller = new TripsController(_repo.Object, new Mock<IWebHostEnvironment>().Object);
        TestHelpers.SignIn(_controller, UserId);
    }

    // ---------- Gezi oluşturma ----------

    [Fact]
    public async Task Create_EmptyTitle_ReturnsBadRequest()
    {
        var result = await _controller.Create(new SaveTripRequest { Title = "   " });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_EndDateBeforeStartDate_ReturnsBadRequest()
    {
        var req = new SaveTripRequest
        {
            Title = "Karadeniz",
            StartDate = new DateTime(2026, 10, 10),
            EndDate = new DateTime(2026, 10, 5),
        };

        var result = await _controller.Create(req);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(61)]
    public async Task Create_DayCountOutOfRange_ReturnsBadRequest(int dayCount)
    {
        var result = await _controller.Create(new SaveTripRequest { Title = "Karadeniz", DayCount = dayCount });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_Valid_SavesForCurrentUserWithTrimmedTitle()
    {
        _repo.Setup(r => r.CreateAsync(UserId, It.IsAny<SaveTripRequest>()))
             .ReturnsAsync(new Trip { Id = 1, Title = "Karadeniz" });

        var result = await _controller.Create(new SaveTripRequest { Title = "  Karadeniz  ", DayCount = 3 });

        Assert.IsType<OkObjectResult>(result);
        // Repository giriş yapan kullanıcının id'siyle ve boşlukları silinmiş başlıkla çağrıldı mı?
        _repo.Verify(r => r.CreateAsync(UserId, It.Is<SaveTripRequest>(q => q.Title == "Karadeniz")), Times.Once);
    }

    [Fact]
    public async Task Create_InvalidRequest_NeverCallsRepository()
    {
        await _controller.Create(new SaveTripRequest { Title = "" });

        _repo.Verify(r => r.CreateAsync(It.IsAny<int>(), It.IsAny<SaveTripRequest>()), Times.Never);
    }

    // ---------- Harcama ekleme ----------

    private static AddExpenseRequest ValidExpense() => new()
    {
        Category = "food",
        Amount = 250,
        Currency = "try",
    };

    [Fact]
    public async Task AddExpense_SomeoneElsesTrip_ReturnsNotFound()
    {
        _repo.Setup(r => r.OwnsTripAsync(UserId, 99)).ReturnsAsync(false);

        var result = await _controller.AddExpense(99, ValidExpense());

        Assert.IsType<NotFoundResult>(result);
        _repo.Verify(r => r.AddExpenseAsync(It.IsAny<int>(), It.IsAny<AddExpenseRequest>()), Times.Never);
    }

    [Fact]
    public async Task AddExpense_UnknownCategory_ReturnsBadRequest()
    {
        _repo.Setup(r => r.OwnsTripAsync(UserId, 3)).ReturnsAsync(true);
        var req = ValidExpense();
        req.Category = "shopping";

        var result = await _controller.AddExpense(3, req);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddExpense_EmptyDescription_IsSavedAsNull_AndCurrencyUppercased()
    {
        _repo.Setup(r => r.OwnsTripAsync(UserId, 3)).ReturnsAsync(true);
        _repo.Setup(r => r.AddExpenseAsync(3, It.IsAny<AddExpenseRequest>()))
             .ReturnsAsync(new TripExpense());
        var req = ValidExpense();
        req.Description = "   ";

        await _controller.AddExpense(3, req);

        _repo.Verify(r => r.AddExpenseAsync(3, It.Is<AddExpenseRequest>(e =>
            e.Description == null && e.Currency == "TRY")), Times.Once);
    }

    // ---------- Puan ----------

    [Theory]
    [InlineData((byte)0)]
    [InlineData((byte)6)]
    public async Task SetRating_OutOfRange_ReturnsBadRequest(byte rating)
    {
        _repo.Setup(r => r.OwnsTripAsync(UserId, 3)).ReturnsAsync(true);

        var result = await _controller.SetRating(3, new SetRatingRequest { Rating = rating });

        Assert.IsType<BadRequestObjectResult>(result);
    }
}