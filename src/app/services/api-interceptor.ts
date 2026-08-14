import {
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class ApiInterceptor implements HttpInterceptor {
	private readonly authService = inject(AuthService);

	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		const baseApiUrl = this.getApiUrl();
		const token = this.authService.getToken();

		request = request.clone({
			url: `${baseApiUrl}/${request.url}`,
			setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
			withCredentials: true
		});

		return next.handle(request);
	}

	// LOCAL ONLY
	// private getApiUrl(): string {
	// 	const { protocol, hostname } = window.location;
	// 	return `${protocol}//${hostname}:${environment.apiPort}/${environment.apiPrefix}`;
	// }

	private getApiUrl(): string {
		return `${environment.baseApiUrl}/${environment.apiPrefix}`;
	}
}
