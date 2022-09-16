import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class StartupService {
	private _startupData: any;
	private tokenIsValid: boolean = false;

	constructor(private http: HttpClient, private authService: AuthService) {}

	// load(): any {
	// 	this.authService.verifyToken().pipe(
	// 		tap((response: any) => {
	// 			this.tokenIsValid = response;

	// 			if (!this.tokenIsValid) {
	// 				localStorage.removeItem('token');
	// 				this._startupData = false; // so no error for now
	// 			}
	// 		})
	// 	).toPromise()
    //     .then((data:any) => (this._startupData = data))
    //     .catch((err: any) => Promise.resolve());
	// }

	hasProfile() {
		
	}

	get startupData(): any {
		return this._startupData;
	}
}
