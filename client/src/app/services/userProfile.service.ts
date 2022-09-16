import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiPaths } from "../shared/dto/ApiPaths.enum";

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {
    baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getAllImages() {
        return this.http.get(`${this.baseUrl}${ApiPaths.userProfile}/getAllImages`);
    }

    editUserProfile(id: number, updateProfileDto: any) {
        // var token = localStorage.getItem('token');

        // if (token !== null) {
            return this.http.put(`${this.baseUrl}${ApiPaths.editUserProfile}/${id}`, updateProfileDto)
        // }

        // return this.http.put(`${this.baseUrl}${ApiPaths.editAnonymousUserProfile}/${id}`, updateProfileDto)
    }

    uploadImage(userId: number, file: any) {
        const photoDto = new FormData();
        photoDto.append('file', file);

        return this.http.post(`${this.baseUrl}${ApiPaths.uploadPhoto}/${userId}`, photoDto);
    }

    deleteImage(userId: number, publicIdParam: any) {
        return this.http.delete(`${this.baseUrl}${ApiPaths.deletePhoto}/${publicIdParam}/${userId}`, { responseType: 'text' });
    }
}