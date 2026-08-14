import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	FormGroup,
	ReactiveFormsModule,
	Validators,
	FormControl
} from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AuthService } from '../../services/auth.service';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import {
	passwordStrengthValidator,
	passwordMatchValidator
} from '../../validators/password.validators';
import { KioskService } from '../../services/kiosk.service';
import { UserType } from '../../enums/user-type.enum';
import { UppercaseDirective } from '../../directives/uppercase.directive';

interface UserProfileResponse {
	id: number;
	userId: number;
	firstName: string;
	middleName: string | null;
	lastName: string;
	mobileNum: string;
	birthDate: string; // ISO String from backend
	createdAt: string;
	updatedAt: string;
}

export interface UserResponse {
	id: number;
	email: string;
	guid: string;
	createdAt: string;
	updatedAt: string;
	lastLogin: string | null;
	userTypeId: number;
	userProfile: UserProfileResponse | null;
}

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.html',
	styleUrl: './user-profile.scss',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		NzInputModule,
		NzButtonModule,
		NzTypographyModule,
		NzDatePickerModule,
		NzGridModule,
		NzDividerModule,
		UppercaseDirective
	]
})
export class UserProfile implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly apiService = inject(ApiService);
	private readonly nzMessage = inject(NzMessageService);
	private readonly authService = inject(AuthService);
	private readonly kioskService = inject(KioskService);

	public form: FormGroup = new FormGroup({});
	public userId: number | null = null;
	public isLoadingData = false;

	public readonly registering = signal(false);
	public readonly isAdmin = computed(
		() => this.authService.currentUser()?.userTypeId === UserType.Admin
	);

	ngOnInit(): void {
		this.buildForm();

		const idParam = this.route.snapshot.paramMap.get('id');

		if (idParam) {
			this.userId = Number(idParam);
			this.loadUserProfile(this.userId);
		}
	}

	private buildForm(): void {
		this.form = new FormGroup({
			profile: new FormGroup({
				firstName: new FormControl<string>('', [Validators.required]),
				middleName: new FormControl<string>(''),
				lastName: new FormControl<string>('', [Validators.required]),
				mobileNum: new FormControl<string>('', [Validators.required]),
				birthDate: new FormControl<Date | null>(null, [Validators.required]),
				email: new FormControl<string>('', [
					Validators.email,
					Validators.required
				])
			}),
			passwordGroup: new FormGroup(
				{
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
			)
		});
	}

	private loadUserProfile(id: number): void {
		this.isLoadingData = true;

		this.apiService.get(`users/GetUserById/${id}`).subscribe({
			next: (response: UserResponse) => {
				const profile = response.userProfile;

				// Patching values into the nested 'profile' FormGroup
				this.form.patchValue({
					profile: {
						email: response.email ?? '',
						firstName: profile?.firstName?.toUpperCase() ?? '',
						middleName: profile?.middleName?.toUpperCase() ?? '',
						lastName: profile?.lastName?.toUpperCase() ?? '',
						mobileNum: profile?.mobileNum ?? '',
						birthDate: profile?.birthDate ? new Date(profile.birthDate) : null
					}
				});

				this.isLoadingData = false;
			},
			error: (err) => {
				console.error('Error fetching user profile:', err);
				this.nzMessage.error('Failed to load user profile');
				this.isLoadingData = false;
			}
		});
	}

	public isFieldInvalid(controlPath: string): boolean {
		const control = this.form.get(controlPath);
		return !!(control && control.invalid && (control.touched || control.dirty));
	}

	public saveProfile(): void {
		const profileGroup = this.form.get('profile') as FormGroup;

		if (profileGroup.invalid) {
			Object.values(profileGroup.controls).forEach((control) => {
				control.markAsTouched();
				control.updateValueAndValidity({ onlySelf: true });
			});
			return;
		}

		const profileValue = profileGroup.getRawValue();

		const payload = {
			id: this.userId,
			email: profileValue.email,
			firstName: profileValue.firstName,
			middleName: profileValue.middleName || null,
			lastName: profileValue.lastName,
			mobileNum: profileValue.mobileNum,
			birthDate: profileValue.birthDate
		};

		this.apiService.patch('users/UpdateProfile', payload).subscribe({
			next: () => {
				this.nzMessage.success('Profile updated successfully!');
			},
			error: (err) => {
				console.error('Error updating profile:', err);
				this.nzMessage.error('Failed to update profile');
			}
		});
	}

	public updatePassword(): void {
		const passwordGroup = this.form.get('passwordGroup') as FormGroup;

		if (passwordGroup.invalid) {
			Object.values(passwordGroup.controls).forEach((control) => {
				control.markAsTouched();
				control.updateValueAndValidity({ onlySelf: true });
			});
			return;
		}

		const passwordValue = passwordGroup.getRawValue();

		const payload = {
			id: this.userId,
			password: passwordValue.password
		};

		this.apiService.post('users/UpdatePassword', payload).subscribe({
			next: () => {
				this.nzMessage.success('Password updated successfully!');
				passwordGroup.reset(); // Reset password inputs after successful update
			},
			error: (err) => {
				console.error('Error updating password:', err);
				this.nzMessage.error('Failed to update password');
			}
		});
	}

	public logout(): void {
		this.authService.logout().subscribe({
			next: () => {
				this.router.navigate(['/login']);
			}
		});
	}

	async onRegisterKiosk(): Promise<void> {
		this.registering.set(true);
		try {
			const result = await this.kioskService.registerThisDevice();
			this.nzMessage.success(`Kiosk registered as "${result.name}"`);
		} catch (err) {
			this.nzMessage.error('Failed to register this device as a kiosk.');
		} finally {
			this.registering.set(false);
		}
	}
}
