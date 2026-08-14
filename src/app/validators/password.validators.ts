import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordStrengthValidator: ValidatorFn = (
	control: AbstractControl
): ValidationErrors | null => {
	const value: string = control.value || '';
	if (!value) {
		return null;
	}

	const hasUpperCase = /[A-Z]/.test(value);
	const hasLowerCase = /[a-z]/.test(value);
	const hasNumber = /[0-9]/.test(value);
	const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

	const errors: ValidationErrors = {};
	if (!hasUpperCase) errors['requiresUppercase'] = true;
	if (!hasLowerCase) errors['requiresLowercase'] = true;
	if (!hasNumber) errors['requiresNumber'] = true;
	if (!hasSpecialChar) errors['requiresSpecialChar'] = true;

	return Object.keys(errors).length ? errors : null;
};

export const passwordMatchValidator: ValidatorFn = (
	control: AbstractControl
): ValidationErrors | null => {
	const password = control.get('password')?.value;
	const confirmPassword = control.get('confirmPassword')?.value;

	if (password !== confirmPassword) {
		control.get('confirmPassword')?.setErrors({ confirmPassword: true });
		return { confirmPassword: true };
	}

	return null;
};
