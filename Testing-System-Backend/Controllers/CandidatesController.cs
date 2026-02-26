using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;

namespace Testing_System_Backend.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class CandidatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL / SEARCH
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CandidateResponseDto>>> GetAll([FromQuery] string? search)
        {
            // Ab hum Data Users table se le rahe hain
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(search) ||
                    u.CNIC.Contains(search) ||
                    u.City.ToLower().Contains(search)
                );
            }

               var candidates = await query
                .Select(u => new CandidateResponseDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    CNIC = u.CNIC,
                    District = u.City, 
                    Score = null,
                    Date = u.CreatedAt.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            return Ok(candidates);
        }

        // 2. RESET PASSWORD
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            // Yahan bhi Candidates ki jagah Users aayega
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Candidate not found.");

            return Ok(new { message = $"Password reset initiated for {user.Name}" });
        }

        // 3. DELETE CANDIDATE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Yahan bhi Candidates ki jagah Users aayega
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Candidate deleted successfully." });
        }

        // 4. EXPORT
        [HttpGet("export")]
        public async Task<IActionResult> ExportData()
        {
            return Ok("Export triggered.");
        }
    }
}