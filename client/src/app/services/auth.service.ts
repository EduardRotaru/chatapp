import { Injectable } from '@angular/core';
import { LoginDto } from '../shared/dto/logindto';
import { HttpClient } from '@angular/common/http';
import { map, ReplaySubject, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiPaths } from '../shared/dto/ApiPaths.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.baseUrl;

  private logged: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  isLoggedIn$ = this.logged.asObservable();

  constructor(private http: HttpClient) { }

  getToken() {
    return localStorage.getItem('token');
  }

  login(loginDto: LoginDto) {
    const path = `${this.baseUrl}${ApiPaths.login}`;

    return this.http.post(path, loginDto).pipe(
      map((response: any) => {
        if (response.token) {
          localStorage.setItem('token', `${response['token']}`);

          let profile = JSON.parse(localStorage.getItem('user_profile')!);
          profile.id = response.userProfile.id;
          profile.imagePublicId = response.userProfile.publicId;
          profile.name = response.userProfile.name;
          profile.photoUrl = response.userProfile.photoUrl;
          localStorage.setItem('user_profile', JSON.stringify(profile));

          this.logged.next(true);

          return profile.name;
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    let profile = JSON.parse(localStorage.getItem('user_profile')!);
    profile.id = -1;
    localStorage.setItem('user_profile', JSON.stringify(profile));
    this.logged.next(false);
  }

  isLoggedIn() {
    let token = localStorage.getItem('token') !== null;
    return this.logged.next(token);
  }

  register(model: any) {
    return this.http.post(`${this.baseUrl}${ApiPaths.register}`, model).pipe(
      map((response: any) => {
        if (response.token) {
          localStorage.setItem('token', `${response['token']}`);

          let profile = JSON.parse(localStorage.getItem('user_profile')!);
          profile.id = response.userId;
          localStorage.setItem('user_profile', JSON.stringify(profile));

          this.logged.next(true);
        }
      })
    );
  }

  // verifyToken(): Observable<boolean> {
  //   const token = localStorage.getItem('token')?.toString();

  //   const httpOptions = {
  //   headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //       'charset': 'utf-8',
  //       })    
  //     };

  //   return token ? this.http
  //     .post(`${this.baseUrl}${ApiPaths.validateToken}`, JSON.stringify(token), httpOptions)
  //     .pipe(
  //       map(
  //         res => {
  //           if(res) {
  //             localStorage.setItem('validToken', JSON.stringify(res))
  //             return true;
  //           } 
  //           else {
  //             return false;
  //           }
  //         },
  //         (error:any) => false
  //       )
  //     ) : of(false)
  // }

  getUsername() {
    return this.http.get(`${this.baseUrl}${ApiPaths.getUsername}`, { responseType: "text" });
  }
}
