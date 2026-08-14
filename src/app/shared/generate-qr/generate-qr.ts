import {
	Component,
	DestroyRef,
	computed,
	inject,
	input,
	signal
} from '@angular/core';
import { Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

const REDIRECT_SECONDS = 60;

type ArrivalStatus = 'none' | 'welcome' | 'thank-you';

@Component({
	selector: 'app-generate-qr',
	standalone: true,
	templateUrl: './generate-qr.html',
	styleUrl: './generate-qr.scss',
	imports: [
		QRCodeComponent,
		NzCardModule,
		NzDividerModule,
		NzButtonModule,
		NzIconModule,
		NzTypographyModule
	]
})
export class GenerateQr {
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);

	public guid = input.required<string>();
	public qrData = computed(() => this.guid());
	public qrDownloadLink = signal<SafeUrl>('');
	public secondsRemaining = signal(REDIRECT_SECONDS);

	public arrivalStatus = signal<ArrivalStatus>('none');

	constructor() {
		const state =
			this.router.getCurrentNavigation()?.extras.state ??
			(history.state as
				{ timeIn?: string; timeOut?: string | null } | undefined);

		if (state && 'timeIn' in state) {
			const isLogin = state.timeOut === null || state.timeOut === undefined;
			this.arrivalStatus.set(isLogin ? 'welcome' : 'thank-you');
		}

		const intervalId = setInterval(() => {
			const next = this.secondsRemaining() - 1;
			if (next <= 0) {
				clearInterval(intervalId);
				this.goToScan();
				return;
			}
			this.secondsRemaining.set(next);
		}, 1000);

		this.destroyRef.onDestroy(() => clearInterval(intervalId));
	}

	public onQrCodeURL(url: SafeUrl): void {
		this.qrDownloadLink.set(url);
	}

	public onFinish(): void {
		this.goToScan();
	}

	private goToScan(): void {
		this.router.navigate(['/qrcode']);
	}
}
