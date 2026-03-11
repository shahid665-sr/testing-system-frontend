using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Testing_System_Backend.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Testing_System_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminResultsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("all-results")]
        public async Task<IActionResult> GetAllResults()
        {
            try
            {
                // Un jobs ki list lana jinke applications/tests exist karte hain
                var jobsWithResults = await _context.Jobs
                    .Select(j => new
                    {
                        Id = "T-" + j.Id,
                        Name = j.Title + " (" + j.Department + ")",
                        Date = j.LastDateToApply.ToString("MMM dd, yyyy"),
                        // Yeh aggregate functions calculate kar rahe hain total, pass aur fail
                        Total = _context.TestResults.Count(tr => tr.JobId == j.Id),
                        PassCount = _context.TestResults.Count(tr => tr.JobId == j.Id && tr.Status == "Passed"),
                        FailCount = _context.TestResults.Count(tr => tr.JobId == j.Id && tr.Status == "Failed"),
                        HighScore = _context.TestResults.Where(tr => tr.JobId == j.Id).Max(tr => (int?)tr.Score) ?? 0,
                        // Merit List (Top Scorers first)
                        Merit = _context.TestResults
                            .Where(tr => tr.JobId == j.Id)
                            .Include(tr => tr.User)
                            .OrderByDescending(tr => tr.Score)
                            .Select(tr => new
                            {
                                Name = tr.User.Name,
                                RollNo = "BTS-" + tr.User.Id,
                                Score = tr.Score,
                                District = "Not Provided" // Replace with real district column if available
                            })
                            .ToList()
                    })
                    .Where(j => j.Total > 0) // Sirf wo jobs dikhayein jinme result ho
                    .ToListAsync();

                return Ok(jobsWithResults);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching results", error = ex.Message });
            }
        }
    }
}