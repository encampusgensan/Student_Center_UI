import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
	provideAppInitializer,
	inject
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptorsFromDi
} from '@angular/common/http';
import { ApiInterceptor } from './services/api-interceptor';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './services/auth.service';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(withInterceptorsFromDi()),
		provideRouter(routes, withComponentInputBinding()),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: ApiInterceptor,
			multi: true
		},
		{
			provide: NZ_I18N,
			useValue: en_US
		},
		provideAppInitializer(() => {
			const authService = inject(AuthService);
			return firstValueFrom(authService.rehydrate());
		})
	]
};
