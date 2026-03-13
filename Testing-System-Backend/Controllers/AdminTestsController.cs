using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;
using System.Linq;
using System.Threading.Tasks;

namespace Testing_System_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminTestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminTestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllTests()
        {
            try
            {
                // 🟢 YAHAN CHANGE KIYA HAI: Ab Jobs ki bajaye asli 'Tests' table se data aayega
                var tests = await _context.Tests
                    .Select(t => new
                    {
                        id = "T-" + t.Id,
                        title = t.Title,
                        date = t.Date.ToString("yyyy-MM-dd"),
                        duration = t.Duration,
                        questions = t.QuestionsCount,
                        candidates = 0, // Filhal 0, baad mein Applicants list se connect karenge
                        status = t.Status,
                        key = t.AccessKey
                    })
                    .OrderByDescending(t => t.id)
                    .ToListAsync();

                return Ok(tests);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching tests", error = ex.Message });
            }
        }
        [HttpGet("available-jobs")]
        public async Task<IActionResult> GetAvailableJobs()
        {
            try
            {
                // Dropdown ke liye sirf wo jobs la rahe hain jo active hain
                var jobs = await _context.Jobs
                    .Where(j => j.IsActive)
                    .Select(j => new
                    {
                        id = j.Id.ToString(), // Frontend string ID expect kar raha hai
                        title = j.Title,
                        bps = "11", // Agar aapke Job table mein BPS ka column hai toh j.BPS use karein, warna default 11
                        department = j.Department
                    })
                    .ToListAsync();

                return Ok(jobs);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching jobs", error = ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAssessment([FromBody] CreateTestRequest request)
        {
            try
            {
                // 🟢 YAHAN CHANGE KIYA HAI: Ab Test actually Database mein manually save hoga
                var newTest = new Test
                {
                    Title = request.Title ?? "Untitled Test",
                    Date = request.Date != default ? request.Date : System.DateTime.UtcNow,
                    Duration = request.Duration > 0 ? request.Duration : 60,
                    QuestionsCount = request.QuestionsCount > 0 ? request.QuestionsCount : 0,
                    Status = "Draft", // Default status
                    AccessKey = "BTS-" + System.Guid.NewGuid().ToString().Substring(0, 6).ToUpper(), // Random Access Key
                    JobId = request.JobId
                };

                _context.Tests.Add(newTest);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Test created successfully!", testId = newTest.Id });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error creating test", error = ex.Message });
            }
        }
    }
}