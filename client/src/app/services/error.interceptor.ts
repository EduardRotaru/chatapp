import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
	HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			catchError((error) => {
				if (error.status == 401) {
					return throwError(error.statusText);
				}
				if (error instanceof HttpErrorResponse) {
					const appError = error.headers.get('Application-Error');
					if (appError) {
						return throwError(appError);
					}
					const serverError = error.error;
					let modelStateErrors = '';
					if (serverError.errors && typeof serverError.errors === 'object') {
						for (const key in serverError.errors) {
							if (serverError.errors[key]) {
								modelStateErrors += serverError.errors[key] + '\n';
							}
						}
					}
					return throwError(modelStateErrors || serverError || 'Unknown error');
				}
                return throwError(error);
			})
		);
	}
}

export const ErrorInterceptorProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: ErrorInterceptor,
	multi: true
};
