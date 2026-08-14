import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { authGuard } from './guards/auth.guard';
import { kioskGuard } from './guards/kiosk.guard';

export const routes: Routes = [
	{ path: '', component: Landing },
	{
		path: 'register',
		loadComponent: () =>
			import('./components/register/register').then((m) => m.Register)
	},
	{
		path: 'login',
		loadComponent: () => import('./components/login/login').then((m) => m.Login)
	},
	{
		path: 'your-qr/:guid',
		loadComponent: () =>
			import('./shared/generate-qr/generate-qr').then((m) => m.GenerateQr)
	},
	{
		path: 'qrcode',
		loadComponent: () =>
			import('./components/qr-code/qr-code').then((m) => m.QrCode),
		canActivate: [kioskGuard]
	},
	{
		path: 'user-profile/:id',
		loadComponent: () =>
			import('./components/user-profile/user-profile').then(
				(m) => m.UserProfile
			),
		canActivate: [authGuard]
	},
	{
		path: 'forgot-password',
		loadComponent: () =>
			import('./components/forgot-password/forgot-password').then(
				(m) => m.ForgotPassword
			)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
