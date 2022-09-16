using API.DAL;
using API.Helpers;
using API.Models.Contracts;
using API.Models.DTO;
using API.Models.Entities;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserDbContext _context;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinarySettings;
        private Cloudinary _cloudinary;

        public UserProfileService(UserDbContext context, IMapper mapper, IOptions<CloudinarySettings> cloudinarySettings)
        {
            _context = context;
            _mapper = mapper;
            _cloudinarySettings = cloudinarySettings;

            Account acc = new Account(
              _cloudinarySettings.Value.CloudName,
              _cloudinarySettings.Value.ApiKey,
              _cloudinarySettings.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        public async Task<UserProfile> GetUserById(int id)
        {
            return await _context.UserProfiles.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<UserProfile> EditUserProfile(int id, UserProfileDto userProfileDto)
        {
            var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(u => u.Id == id);

            userProfile.Name = userProfileDto.Name;
            userProfile.PhotoUrl = userProfileDto.PhotoUrl;
            userProfile.PublicId = null;

            _context.Attach(userProfile);
            _context.Entry(userProfile).State = EntityState.Modified;

            var result = (await _context.SaveChangesAsync()) > 0;

            return result ? userProfile : null;
        }

        public async Task<PhotoDto> GetPhoto(int userId)
        {
            var photo = await _context.UserProfiles.FirstOrDefaultAsync(u => u.Id == userId);

            return _mapper.Map<PhotoDto>(photo);
        }

        public async Task<UserProfile> SavePhoto(int userId, PhotoDto photoDto)
        {
            var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(u => u.Id == userId);

            if (userProfile == null) return null;

            var file = photoDto.File;

            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(150).Height(150).Radius("max").Crop("fill")
                    };

                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            userProfile.PhotoUrl = uploadResult.Url.ToString();
            userProfile.PublicId = uploadResult.PublicId;

            _context.Attach(userProfile);
            _context.Entry(userProfile).State = EntityState.Modified;

            var result = (await _context.SaveChangesAsync()) > 0;

            if (result == true)
            {
                return userProfile;
            }

            return null;
        }

        public async Task<RandomName[]> GetFreeImagesUrls()
        {
            var listPhotos = (await JsonFileReader.ReadAsync<RandomName[]>(@"assets\imagesName.json"));

            return await Task.FromResult(listPhotos);
        }

        public async Task<DeletionResult> DeletePhoto(int userId, string publicIdParam)
        {
            var deletionParams = new DeletionParams(publicIdParam);

            var result = _cloudinary.Destroy(deletionParams);

            return await Task.FromResult(result);
        }
    }
}
