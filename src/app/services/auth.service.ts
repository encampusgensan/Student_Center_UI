import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api-service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, of, tap } from 'rxjs';

interface LoginResponse {
	accessToken: string;
	user: {
		id: number;
		email: string;
		guid: string;
		userTypeId: number;
		[key: string]: any;
	};
	timeIn: string;
	timeOut: string | null;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly apiService = inject(ApiService);
	private readonly nzMessage = inject(NzMessageService);

	private readonly accessTokenSignal = signal<string | null>(null);
	private readonly currentUserSignal = signal<LoginResponse['user'] | null>(
		null
	);

	public readonly accessToken = this.accessTokenSignal.asReadonly();
	public readonly currentUser = this.currentUserSignal.asReadonly();

	public login(email: string, password: string) {
		const payload = { email, password };
		const msgId = this.nzMessage.loading('Logging in...').messageId;

		return this.apiService.post('auth/login', payload).pipe(
			tap({
				next: (data: LoginResponse) => {
					this.nzMessage.remove(msgId);
					this.accessTokenSignal.set(data.accessToken);
					this.currentUserSignal.set(data.user);
				},
				error: () => {
					this.nzMessage.remove(msgId);
					this.nzMessage.error(
						'Something went wrong. Please contact the admin.'
					);
				}
			})
		);
	}

	public logout() {
		const msgId = this.nzMessage.loading('Logging out...').messageId;

		return this.apiService.post('auth/logout', null).pipe(
			tap({
				next: () => {
					this.nzMessage.remove(msgId);
					this.accessTokenSignal.set(null);
					this.currentUserSignal.set(null);
					this.nzMessage.success('Logged out successfully!');
				},
				error: () => {
					this.nzMessage.remove(msgId);
					this.nzMessage.error('Failed to log out');
				}
			})
		);
	}

	public getToken(): string | null {
		return this.accessTokenSignal();
	}

	public rehydrate() {
		return this.apiService.post('auth/refresh', null).pipe(
			tap((data) => {
				this.accessTokenSignal.set(data.accessToken);
				this.currentUserSignal.set(data.user);
			}),
			catchError(() => {
				this.accessTokenSignal.set(null);
				this.currentUserSignal.set(null);
				return of(null);
			})
		);
	}
}
