using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;

namespace Testing_System_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Get All Admins
        [HttpGet("team")]
        public async Task<IActionResult> GetAdminTeam()
        {
            try
            {
                var admins = await _context.Users
                    .Where(u => u.Role == UserRole.Admin)
                    .Select(u => new
                    {
                        id = u.Id,
                        name = u.Name,
                        email = u.Email,
                        role = "Owner", // Apne DB design ke hisab se ise adjust kar sakte hain
                        status = "Active"
                    })
                    .ToListAsync();

                return Ok(admins);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching admin team", error = ex.Message });
            }
        }

        // 2. Add New Admin
        public class AddAdminRequest
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string RoleLabel { get; set; } // Viewer, Editor, Super Admin (For future use if needed)
        }

        [HttpPost("add-admin")]
        public async Task<IActionResult> AddAdmin([FromBody] AddAdminRequest request)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                    return BadRequest(new { message = "Email already exists." });

                // Naye admin ke liye default password set kar rahe hain
                string defaultPassword = "AdminPassword123!";
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(defaultPassword);

                var newAdmin = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = hashedPassword,
                    Role = UserRole.Admin,

                    // Aapke model ke mutabiq baqi required fields mein default data daal rahe hain
                    // Baad mein Admin apni profile khud update kar sakega
                    FatherName = "N/A",
                    CNIC = "00000-0000000-0",
                    PhoneNumber = "0000-0000000",
                    City = "N/A",
                    CreatedAt = System.DateTime.UtcNow
                };

                _context.Users.Add(newAdmin);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Admin added successfully!", defaultPassword = defaultPassword });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error adding new admin", error = ex.Message });
            }
        }
    }
}