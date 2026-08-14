import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KioskService } from '../services/kiosk.service';

export const kioskGuard: CanActivateFn = async () => {
	const kioskService = inject(KioskService);
	const router = inject(Router);

	const isTrusted = await kioskService.verifyThisDevice();
	if (isTrusted) {
		return true;
	}

	router.navigate(['/login']);
	return false;
};
