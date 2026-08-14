import { Directive, ElementRef, inject, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
	selector: '[appUppercase]',
	standalone: true
})
export class UppercaseDirective {
	private el = inject(ElementRef<HTMLInputElement>);
	private ngControl = inject(NgControl, { optional: true });

	@HostListener('input', ['$event'])
	onInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		const start = input.selectionStart;
		const end = input.selectionEnd;

		const upperValue = input.value.toUpperCase();

		if (input.value !== upperValue) {
			input.value = upperValue;
			this.ngControl?.control?.setValue(upperValue, { emitEvent: false });
			input.setSelectionRange(start, end);
		}
	}
}
