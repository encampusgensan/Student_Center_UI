import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { UserType } from '../../enums/user-type.enum';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		NzInputModule,
		NzButtonModule,
		NzTypographyModule
	],
	templateUrl: './login.html',
	styleUrl: './login.scss'
})
export class Login implements OnInit {
	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);

	public form: FormGroup = new FormGroup({});

	ngOnInit(): void {
		this.form = this.buildForm();
	}

	private buildForm(): FormGroup {
		return new FormGroup({
			email: new FormControl<string>('', [Validators.required]),
			password: new FormControl<string>('', [Validators.required])
		});
	}

	public handleLogin(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const { email, password } = this.form.value;

		this.authService.login(email, password).subscribe({
			next: (data) => {
				if (data.user.userTypeId === UserType.Admin) {
					this.router.navigate([`/user-profile/${data.user.id}`]);
					return;
				}

				this.router.navigate([`/your-qr/${data.user.guid}`], {
					state: { timeIn: data.timeIn, timeOut: data.timeOut }
				});
			}
		});
	}

	public gotoForgotPassword(): void {
		this.router.navigate(['/forgot-password']);
	}

	public gotoRegister(): void {
		this.router.navigate(['/register']);
	}

	public gotoQR(): void {
		this.router.navigate(['/qrcode']);
	}
}
