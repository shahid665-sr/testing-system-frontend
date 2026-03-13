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
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
         [Authorize(Roles = "Admin")] // Agar API secure karni hai to uncomment kar lein
         public async Task<IActionResult> GetAllJobs()
        {
            try
            {
                var jobs = await _context.Jobs
                    .OrderByDescending(j => j.Id) // 🟢 FIX: Pehle Id ke hisab se sort karein
                    .Select(j => new
                    {
                        id = j.Id.ToString(),
                        title = j.Title,
                        department = j.Department ?? "General",

                        location = j.Location ?? "Not Specified",
                        type = j.Type ?? "Full-Time",
                        salary = j.Salary ?? "Not Specified",
                        education = j.Education ?? "Not Specified",
                        positions = j.Positions > 0 ? j.Positions : 1,

                        lastDate = j.LastDateToApply.ToString("MMM dd, yyyy"),
                        applicants = _context.Applications.Count(a => a.JobId == j.Id),
                        status = j.IsActive ? "Active" : "Closed",
                        postedDate = j.CreatedAt.ToString("MMM dd, yyyy")
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
        {
            try
            {
                var newJob = new Job
                {
                    Title = request.Title,
                    Department = request.Department,
                    Description = request.Description,
                    Location = request.Location,
                    Type = request.Type,
                    Salary = request.Salary,
                    Education = request.Education,
                    Positions = request.Positions,
                    Requirements = request.Requirements, // Frontend already JSON.stringify karke bhej raha hai
                    Benefits = request.Benefits,         // Frontend already JSON.stringify karke bhej raha hai
                    LastDateToApply = request.LastDate,
                    IsActive = true,
                    CreatedAt = System.DateTime.UtcNow
                };

                _context.Jobs.Add(newJob);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Vacancy published successfully!", id = newJob.Id });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error publishing vacancy", error = ex.Message });
            }
        }
        public class UpdateStatusRequest { public string Status { get; set; } }

        [HttpPut("update-status/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return NotFound(new { message = "Job not found" });

            // Note: Agar aapne Job model mein Status ki property string me nai rakhi (aur bas IsActive bool rakha hai),
            // toh logic aise chalega:
            job.IsActive = request.Status == "Active";

            // Agar future me aapke database me alag se "Status" ka column ho, toh job.Status = request.Status kar dena.

            await _context.SaveChangesAsync();
            return Ok(new { message = "Status updated successfully" });
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return NotFound(new { message = "Job not found" });

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job deleted successfully" });
        }
        [HttpGet("details/{id}")]
        // [Authorize(Roles = "Admin")] // Uncomment if needed
        public async Task<IActionResult> GetJobDetails(int id)
        {
            try
            {
                var job = await _context.Jobs.FindAsync(id);
                if (job == null) return NotFound(new { message = "Vacancy not found" });

                // Yahan hum un candidates ko dhoondh rahe hain jinhone is job par apply kiya hai.
                // Note: Agar aapke paas 'Applications' table mukammal nahi hai, toh yeh empty list bhej dega.
                var applicants = await _context.Applications
                    .Where(a => a.JobId == id)
                    // Agar aapki Application class mein User/Candidate ki details linked hain:
                    .Select(a => new
                    {
                        id = a.Id,
                        // Agar navigation property set nahi hai toh hum basic dummy data bhej rahe hain
                        // Asli project mein aap `a.User.Name` waghera use karenge
                        candidateName = "Candidate #" + a.UserId,
                        status = a.Status ?? "Pending",
                        appliedDate = a.AppliedDate.ToString("MMM dd, yyyy")
                    })
                    .ToListAsync();

                return Ok(new
                {
                    job = new
                    {
                        id = job.Id.ToString(),
                        title = job.Title,
                        department = job.Department,
                        location = job.Location,
                        salary = job.Salary,
                        positions = job.Positions,
                        education = job.Education,
                        description = job.Description,
                        lastDate = job.LastDateToApply.ToString("MMM dd, yyyy"),
                        status = job.IsActive ? "Active" : "Closed"
                    },
                    applicants = applicants
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching job details", error = ex.Message });
            }
        }
    }
}