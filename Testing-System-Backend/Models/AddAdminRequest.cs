namespace Testing_System_Backend.Models
{
    public class AddAdminRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string RoleLabel { get; set; } // Viewer, Editor, Super Admin (For future use if needed)
    }
}
