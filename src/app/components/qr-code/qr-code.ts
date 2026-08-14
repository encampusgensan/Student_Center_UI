import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { catchError, of } from 'rxjs';

type ScanStatus = 'scanning' | 'welcome' | 'thank-you' | 'not-found';

const COOLDOWN_MS = 2000;

@Component({
	selector: 'app-qr-code',
	templateUrl: './qr-code.html',
	styleUrl: './qr-code.scss',
	imports: [CommonModule, ZXingScannerModule, NzTypographyModule, NzIconModule]
})
export class QrCode {
	private readonly router = inject(Router);
	private readonly http = inject(HttpClient);

	public allowedFormats = [BarcodeFormat.QR_CODE];

	public scanStatus: ScanStatus = 'scanning';

	private codeCurrentlyInView = false;
	private isCoolingDown = false;

	public onCodeResult(resultString: string): void {
		this.codeCurrentlyInView = true;

		if (this.isCoolingDown) {
			return;
		}

		const guid = resultString?.trim();
		if (!guid) {
			return;
		}

		this.isCoolingDown = true;

		this.http
			.get<{ userId: number }>(`attendance/resolve-guid/${guid}`)
			.pipe(
				catchError(() => {
					this.scanStatus = 'not-found';
					return of(null);
				})
			)
			.subscribe((resolved) => {
				if (!resolved) {
					return;
				}
				this.recordAttendance(resolved.userId);
			});
	}

	public onScanFailure(): void {
		this.codeCurrentlyInView = false;
	}

	private recordAttendance(userId: number): void {
		this.http
			.post<{ id: number; timeIn: string; timeOut: string | null }>(
				`attendance/record/${userId}`,
				{}
			)
			.pipe(
				catchError(() => {
					this.scanStatus = 'not-found';
					return of(null);
				})
			)
			.subscribe((result) => {
				if (!result) {
					return;
				}
				const isLogin = result.timeOut === null;
				this.scanStatus = isLogin ? 'welcome' : 'thank-you';

				setTimeout(() => this.resumeScanning(), COOLDOWN_MS);
			});
	}

	public retryScanning(): void {
		this.resumeScanning();
	}

	private resumeScanning(): void {
		this.scanStatus = 'scanning';

		if (!this.codeCurrentlyInView) {
			this.isCoolingDown = false;
		} else {
			const check = setInterval(() => {
				if (!this.codeCurrentlyInView) {
					this.isCoolingDown = false;
					clearInterval(check);
				}
			}, 250);
		}
	}

	public gotoManualLogin(): void {
		this.router.navigate(['/login']);
	}
}
