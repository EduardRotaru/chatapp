using API.Models.DTO;
using API.Models.Entities;
using AutoMapper;

namespace API.Helpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<User, UserLoginDto>();
            CreateMap<UserLoginDto, User>();

            CreateMap<User, UserRegisterDto>();
            CreateMap<UserRegisterDto, User>();

            CreateMap<User, UserProfile>().ReverseMap();
            CreateMap<UserProfile, UserProfileDto>().ReverseMap();

            CreateMap<UserProfile, PhotoDto>()
                .ForMember(m => m.Url, p => p.MapFrom(c => c.PhotoUrl))
                .ForMember(m => m.PublicId, p => p.MapFrom(c => c.PublicId));
        }
    }
}