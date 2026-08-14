import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ApiService } from '../../services/api-service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
	passwordMatchValidator,
	passwordStrengthValidator
} from '../../validators/password.validators';
import { UppercaseDirective } from '../../directives/uppercase.directive';
import { LookupSignalService } from '../../signals/lookups/lookups.signal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		UppercaseDirective,
		NzInputModule,
		NzButtonModule,
		NzDatePickerModule,
		NzTypographyModule,
		NzSelectModule,
		NzAutocompleteModule
	],
	templateUrl: './register.html',
	styleUrl: './register.scss'
})
export class Register implements OnInit {
	public readonly router = inject(Router);
	public readonly apiService = inject(ApiService);
	public readonly nzMessage = inject(NzMessageService);
	public readonly lookupSignal = inject(LookupSignalService);

	public readonly educationLevelOptions = computed(
		() => this.lookupSignal.lookup().educationLevel
	);

	public readonly schoolOptions = computed(
		() => this.lookupSignal.lookup().school
	);
	public readonly schoolQuery = signal<string>('');
	public readonly schoolFilter = computed(() => {
		const query = this.schoolQuery().toLowerCase().trim();
		const schools = this.schoolOptions();
		if (!query) return schools;
		return schools.filter((school) =>
			school.name.toLowerCase().includes(query)
		);
	});

	public form: FormGroup = new FormGroup({});

	public error: string = '';

	ngOnInit(): void {
		this.getLookup();
		this.buildForm();
	}

	public getLookup(): void {
		this.lookupSignal.getEducationLevels();
		this.lookupSignal.getSchools();
	}

	private buildForm(): void {
		this.form = new FormGroup(
			{
				firstName: new FormControl<string>('', [Validators.required]),
				middleName: new FormControl<string>(''),
				lastName: new FormControl<string>('', [Validators.required]),
				mobileNum: new FormControl<string>('', [Validators.required]),
				birthDate: new FormControl<Date | null>(null, [Validators.required]),
				educationLevel: new FormControl(null, [Validators.required]),
				school: new FormControl(null, [Validators.required]),
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

	public save(): void {
		const formValue = this.form.value;

		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const educLevelId = formValue.educationLevel.id;
		const schoolValue = formValue.school;
		const isExistingSchool =
			typeof schoolValue === 'object' && schoolValue !== null;

		const schoolId = isExistingSchool ? schoolValue.id : null;
		const schoolName = isExistingSchool ? null : schoolValue;

		const payload = {
			firstName: formValue.firstName,
			middleName: formValue.middleName || null,
			lastName: formValue.lastName,
			mobileNum: formValue.mobileNum,
			birthDate: formValue.birthDate,
			educationLevelId: educLevelId,
			schoolId: schoolId,
			schoolName: schoolName,
			email: formValue.email,
			password: formValue.password
		};

		this.apiService.post('users/register', payload).subscribe({
			next: (data: IUserResponse) => {
				this.nzMessage.success(`Account created successfully!`);
				this.router.navigate(['/your-qr', data.guid]);
			},
			error: (err) => {
				this.nzMessage.error(err);
				this.error = err;
			}
		});
	}

	public cancel(): void {
		this.router.navigate(['/']);
	}

	public onSchoolInput(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		this.schoolQuery.set(value);
	}
}

interface IUserResponse {
	id: number;
	email: string;
	guid: string;
	createdAt: string;
	updatedAt: string;
	lastLogin: string | null;
}
