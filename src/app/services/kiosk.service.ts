import { inject, Injectable } from '@angular/core';
import { ApiService } from './api-service';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { firstValueFrom, map } from 'rxjs';

interface RegisterKioskResponse {
	name: string;
	expiresAt: string;
}

@Injectable({
	providedIn: 'root'
})
export class KioskService {
	private readonly apiService = inject(ApiService);

	private parseDevice(): string {
		const ua = navigator.userAgent;
		const isAndroid = /Android/i.test(ua);
		const isChrome = /Chrome\/([\d.]+)/i.test(ua) && !/Edg|OPR/i.test(ua);
		const isFirefox = /Firefox/i.test(ua);
		const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);

		const os = isAndroid
			? 'Android'
			: /Windows/i.test(ua)
				? 'Windows'
				: /Mac OS/i.test(ua)
					? 'macOS'
					: 'Unknown OS';
		const browser = isChrome
			? 'Chrome'
			: isFirefox
				? 'Firefox'
				: isSafari
					? 'Safari'
					: 'Browser';

		return `${os} ${browser}`;
	}

	async registerThisDevice(): Promise<RegisterKioskResponse> {
		const fp = await FingerprintJS.load();
		const result = await fp.get();
		const visitorId = result.visitorId;
		const deviceLabel = this.parseDevice();

		return firstValueFrom(
			this.apiService.post('kiosks/register', { visitorId, deviceLabel })
		);
	}

	async verifyThisDevice(): Promise<boolean> {
		try {
			await firstValueFrom(this.apiService.get('kiosks/verify'));
			return true;
		} catch {
			return false;
		}
	}
}
