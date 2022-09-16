using System;
using API.Models.Entities;

namespace API.Models.Contracts
{
    public interface ITokenService
    {
        Task<string> CreateToken(User user);
    }
}
