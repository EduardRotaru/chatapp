namespace API.Models.DTO
{
    public class UserRegisterDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string PhotoUrl { get; set; }
        public string PublicId { get; set; }
        public string Token { get; set; }
    }
}