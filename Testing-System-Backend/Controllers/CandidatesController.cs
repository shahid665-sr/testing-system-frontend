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
        // 1. GET ALL / SEARCH
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CandidateResponseDto>>> GetAll([FromQuery] string? search)
        {
            // 🟢 FIX: Sirf un users ko select karein jinka Role "Candidate" hai
            var query = _context.Users.Where(u => u.Role == UserRole.Candidate).AsQueryable();

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
        // 2. UPDATE CANDIDATE ("Edit" button ke liye)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCandidate(int id, [FromBody] CandidateUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Candidate not found." });

            user.Name = dto.Name;
            user.CNIC = dto.CNIC;
            user.City = dto.District; // Map frontend 'District' to database 'City'

            await _context.SaveChangesAsync();

            return Ok(new { message = "Candidate updated successfully." });
        }

        // 3. RESET PASSWORD
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Candidate not found.");

            return Ok(new { message = $"Password reset initiated for {user.Name}" });
        }

        // 4. DELETE CANDIDATE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Candidate deleted successfully." });
        }

        // 5. EXPORT
        [HttpGet("export")]
        public async Task<IActionResult> ExportData()
        {
            return Ok("Export triggered.");
        }
    }
}