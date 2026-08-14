import { Component, inject, OnInit, signal } from '@angular/core';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import {
	passwordMatchValidator,
	passwordStrengthValidator
} from '../../validators/password.validators';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ApiService } from '../../services/api-service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.html',
	styleUrl: './forgot-password.scss',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		NzInputModule,
		NzTypographyModule,
		NzButtonModule
	]
})
export class ForgotPassword implements OnInit {
	private readonly apiService = inject(ApiService);
	private readonly nzMessage = inject(NzMessageService);
	private readonly router = inject(Router);

	public form: FormGroup = new FormGroup({});

	// Use Angular Signal instead of primitive boolean
	public isVerified = signal<boolean>(false);
	public userId: number = 0;

	ngOnInit(): void {
		this.buildForm();
	}

	public buildForm(): void {
		this.form = new FormGroup(
			{
				email: new FormControl<string>('', [
					Validators.email,
					Validators.required
				]),
				password: new FormControl<string>('', [
					Validators.required,
					Validators.minLength(8),
					passwordStrengthValidator
				]),
				confirmPassword: new FormControl<string>('', [Validators.required])
			},
			{
				validators: passwordMatchValidator
			}
		);
	}

	public verifyEmail(): void {
		const email = this.form.get('email')?.value;

		this.apiService.post('users/GetUserByEmail', { email }).subscribe({
			next: (data) => {
				this.isVerified.set(true);
				this.userId = data.id;
				this.nzMessage.success('Email verified successfully!');
				// Removed this.cdr.detectChanges();
			},
			error: () => {
				this.nzMessage.error('Email not found');
			}
		});
	}

	public changePassword(): void {
		const formValue = this.form.getRawValue();

		const payload = {
			id: this.userId,
			password: formValue.password
		};

		this.apiService.post('users/UpdatePassword', payload).subscribe({
			next: () => {
				this.nzMessage.success('Password updated successfully!');
				this.form.reset();
				this.userId = 0;
				this.isVerified.set(false);

				this.router.navigate(['/login']);
			},
			error: (err) => {
				console.error('Error updating password:', err);
				this.nzMessage.error('Failed to update password');
			}
		});
	}
}
