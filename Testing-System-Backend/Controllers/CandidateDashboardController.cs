using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;

namespace Testing_System_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CandidateDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidateDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("overview")]
        public async Task<IActionResult> GetDashboardOverview()
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null) return NotFound(new { message = "User not found" });

            var availableJobs = await _context.Jobs
                .Where(j => j.IsActive && j.LastDateToApply >= DateTime.UtcNow)
                .Select(j => new { j.Id, j.Title, j.Department, j.Description, j.LastDateToApply })
                .ToListAsync();

            var appliedJobs = await _context.Applications.Include(a => a.Job)
                .Where(a => a.UserId == user.Id)
                .Select(a => new { JobTitle = a.Job.Title, Department = a.Job.Department, AppliedDate = a.AppliedDate, Status = a.Status })
                .ToListAsync();

            var results = await _context.TestResults.Include(tr => tr.Job)
                .Where(tr => tr.UserId == user.Id)
                .Select(tr => new { JobTitle = tr.Job.Title, tr.Score, tr.TotalMarks, tr.Status, tr.TestDate })
                .ToListAsync();

            var educationHistory = await _context.Educations
                .Where(e => e.UserId == user.Id)
                .Select(e => new {
                    id = e.Id,
                    level = e.Level,
                    title = e.Title,
                    startDate = e.StartDate,
                    endDate = e.EndDate,
                    degree = e.Title,
                    institution = e.Level,
                    year = e.EndDate
                }).ToListAsync();

            // 🟢 FIXED: Ab Test ki details proper fetch ho rahi hain
            var onlineTest = await _context.Jobs
                .Where(j => j.IsActive)
                .Select(j => new {
                    id = j.Id,
                    title = j.Title + " Assessment",
                    department = j.Department,
                    expiryDate = j.LastDateToApply
                })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                UserData = new
                {
                    name = user.Name,
                    email = user.Email,
                    cnic = user.CNIC,
                    phone = user.PhoneNumber ?? "Not Provided",
                    city = user.City,
                    registrationDate = user.CreatedAt
                },
                Stats = new
                {
                    TotalApplied = appliedJobs.Count,
                    AvailableJobs = availableJobs.Count,
                    TestsPassed = results.Count(r => r.Status == "Passed"),
                    ActiveTests = onlineTest != null ? 1 : 0
                },
                AvailableJobs = availableJobs,
                AppliedJobs = appliedJobs,
                TestResults = results,
                EducationHistory = educationHistory,
                OnlineTest = onlineTest // 🟢 FIXED: Frontend ko data yahan se milega
            });
        }

        [HttpPost("add-education")]
        public async Task<IActionResult> AddEducation([FromBody] Education edu)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null) return NotFound();

            edu.UserId = user.Id;
            if (string.IsNullOrEmpty(edu.FilePath)) edu.FilePath = "N/A"; // Prevents rejection

            _context.Educations.Add(edu);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Added!" });
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null) return NotFound();

            user.Name = req.Name;
            user.PhoneNumber = req.Phone;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Updated!" });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null) return NotFound();

            // 🟢 Hashing check
            bool isValid = BCrypt.Net.BCrypt.Verify(req.OldPassword, user.PasswordHash);
            if (!isValid) return BadRequest(new { message = "Incorrect current password!" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Changed!" });
        }
    }
   
    public class UpdateProfileRequest { public string Name { get; set; } = ""; public string Phone { get; set; } = ""; }
    public class ChangePasswordRequest { public string OldPassword { get; set; } = ""; public string NewPassword { get; set; } = ""; }
}