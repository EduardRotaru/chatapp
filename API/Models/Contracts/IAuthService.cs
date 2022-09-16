
using API.Models.DTO;
using API.Models.Entities;

namespace API.Models.Contracts
{
    public interface IAuthService
    {
        Task<User> Login(string username, string password);
        Task<User> Register(User user, string password);
        Task<bool> UserExists(string username);
        Task<User> GetById(int id);
         string GetUsernameFromClientToken(string token);
    }
}