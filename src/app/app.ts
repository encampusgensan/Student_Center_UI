import { Component, inject, signal } from '@angular/core';
import {
	NavigationCancel,
	NavigationEnd,
	NavigationError,
	NavigationStart,
	Router,
	RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, NzSpinModule],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	private readonly router = inject(Router);

	protected readonly title = signal('vappfe');

	public readonly isLoading = signal(false);

	constructor() {
		this.router.events
			.pipe(
				filter(
					(event) =>
						event instanceof NavigationStart ||
						event instanceof NavigationEnd ||
						event instanceof NavigationCancel ||
						event instanceof NavigationError
				)
			)
			.subscribe((event) => {
				this.isLoading.set(event instanceof NavigationStart);
			});
	}
}
