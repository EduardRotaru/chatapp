using API.Models.DTO;
using API.Models.Entities;
using CloudinaryDotNet.Actions;

namespace API.Models.Contracts
{
    public interface IUserProfileService
    {
        Task<UserProfile> GetUserById(int id);
        Task<UserProfile> EditUserProfile(int id, UserProfileDto userProfileDto);
        Task<RandomName[]> GetFreeImagesUrls();
        Task<UserProfile> SavePhoto(int userId, PhotoDto photoDto);
        Task<PhotoDto> GetPhoto(int userId);
        
        Task<DeletionResult> DeletePhoto(int userId, string publicIdParam);
    }
}