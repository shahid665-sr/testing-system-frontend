using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
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
    [Authorize(Roles = "Admin")]
    public class AdminSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Get All Admins (Updated to show all admin types)
        [HttpGet("team")]
        public async Task<IActionResult> GetAdminTeam()
        {
            try
            {
                var admins = await _context.Users
                    // 🟢 YAHAN CHANGE KIYA HAI: Ab yeh Admin ke sath Viewer, Editor, aur Owner ko bhi dhondega
                    .Where(u => u.Role == UserRole.Admin ||
                                u.Role == UserRole.Owner ||
                                u.Role == UserRole.Editor ||
                                u.Role == UserRole.Viewer)
                    .Select(u => new
                    {
                        id = u.Id,
                        name = u.Name,
                        email = u.Email,
                        role = u.Role.ToString(),
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
        // 3. Update Admin Role/Permissions
        [HttpPut("update-role/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                var admin = await _context.Users.FindAsync(id);
                if (admin == null) return NotFound(new { message = "Admin not found." });

                // 🟢 ERROR CHECK: Check kar rahe hain ke kya DB is role ko janta hai ya nahi
                if (System.Enum.TryParse<UserRole>(request.RoleLabel, out var newRole))
                {
                    admin.Role = newRole;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Permissions updated successfully!" });
                }
                else
                {
                    // Agar DB mein ye role nahi hai, toh error throw karega
                    return BadRequest(new { message = $"Error: Database UserRole enum doesn't contain '{request.RoleLabel}'" });
                }
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error updating permissions", error = ex.Message });
            }
        }
        // 4. Delete Admin
        [HttpDelete("delete-admin/{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            try
            {
                var admin = await _context.Users.FindAsync(id);
                if (admin == null || admin.Role != UserRole.Admin)
                    return NotFound(new { message = "Admin not found." });

                _context.Users.Remove(admin);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Admin removed successfully." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting admin", error = ex.Message });
            }
        }

        // 5. Reset Password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                // Isme hum token se user id nikal kar password update karenge
                // Abhi demo response bhej rahe hain
                return Ok(new { message = "Password has been reset successfully!" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error resetting password", error = ex.Message });
            }
        }
        public class UpdateRoleRequest
        {
            public string RoleLabel { get; set; }
        }

        public class ResetPasswordRequest
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }
    }
}