import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';

@Injectable({
	providedIn: 'root'
})
export class LookupSignalService {
	private readonly apiService = inject(ApiService);

	public readonly lookup = signal<ILookups>({
		educationLevel: [],
		school: []
	});

	public getEducationLevels(): void {
		this.apiService.get('lookup/GetEducationLevels').subscribe({
			next: (data) => {
				this.lookup.update((state) => ({ ...state, educationLevel: data }));
			}
		});
	}

	public getSchools(): void {
		this.apiService.get('lookup/GetSchools').subscribe({
			next: (data) => {
				this.lookup.update((state) => ({ ...state, school: data }));
			}
		});
	}
}

interface ILookups {
	educationLevel: IBaseLookup[];
	school: IBaseLookup[];
}

interface IBaseLookup {
	id: string;
	name: string;
}
