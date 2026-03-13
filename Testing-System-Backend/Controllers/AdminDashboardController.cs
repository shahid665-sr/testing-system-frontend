using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;

namespace Testing_System_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Sirf Admin access kar sakta hai
    public class AdminDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetAdminOverview()
        {
            try
            {
             
                int totalCandidates = await _context.Users.CountAsync(u => u.Role == UserRole.Candidate);
                int totalQuestions = await _context.Questions.CountAsync();
                int activeTests = await _context.Jobs.CountAsync(j => j.IsActive);
                int completedTests = await _context.TestResults.CountAsync(tr => tr.Status == "Passed");

               
                int registryLimit = totalCandidates > 0 ? totalCandidates : 1;

                // 1. Live Assessments 
                var liveAssessments = await _context.Jobs
                    .Where(j => j.IsActive)
                    .Select(j => new
                    {
                        title = j.Title,
                        dept = j.Department,
                        
                        candidates = _context.Applications.Count(a => a.JobId == j.Id) + "/" + totalCandidates,
                      
                        progress = ((double)_context.Applications.Count(a => a.JobId == j.Id) * 100) / registryLimit
                    })
                    .Take(3)
                    .ToListAsync();

                // 2. Bank Distribution
                var bankDistribution = await _context.Questions
                    .GroupBy(q => q.Category)
                    .Select(g => new
                    {
                        cat = g.Key,
                        qty = g.Count()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    TotalCandidates = totalCandidates,
                    TotalQuestions = totalQuestions,
                    ActiveTests = activeTests,
                    CompletedTests = completedTests,
                    LiveAssessments = liveAssessments,
                    BankDistribution = bankDistribution
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching dashboard overview", error = ex.Message });
            }
        }
    }
    }
