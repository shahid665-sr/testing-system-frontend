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
                // Database se Jobs/Tests ka data nikalna
                var tests = await _context.Jobs
                    .Select(j => new
                    {
                        id = "T-" + j.Id,
                        title = j.Title,
                        date = j.LastDateToApply.ToString("yyyy-MM-dd"),
                        duration = 60, // Agar DB me Duration column hai to j.Duration likh lein
                        questions = 50, // Static for now, ya _context.Questions.Count(q => q.JobId == j.Id)
                        candidates = _context.Applications.Count(a => a.JobId == j.Id),
                        status = j.IsActive ? "Live" : "Archived",
                        key = "BTS-" + j.Id + "KEY" // Mock Access Key
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
                // Yahan aap in rules aur test details ko apne database mein save karenge.
                // Misaal ke tor par: _context.Tests.Add(newTest); await _context.SaveChangesAsync();

                // Abhi ke liye hum success response bhej rahe hain taake frontend connect ho jaye
                return Ok(new { message = "Assessment published successfully!", jobId = request.JobId });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error publishing assessment", error = ex.Message });
            }
        }  
    }
}