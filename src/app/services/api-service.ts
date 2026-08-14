import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private readonly http = inject(HttpClient);

	/**
	 * Performs a secure HTTP GET request to the specified endpoint.
	 *
	 * @param endpoint - The relative target URL path or full API endpoint string.
	 * @returns An Observable emitting the strongly-typed payload response from the server.
	 */
	public get(endpoint: string): Observable<any> {
		return this.http.get(endpoint);
	}

	/**
	 * Performs a secure HTTP POST request to the specified endpoint.
	 *
	 * @param endpoint - The relative target URL path or full API endpoint string.
	 * @param payload - The data payload to send in the request body.
	 * @returns An Observable emitting the strongly-typed payload response from the server.
	 */
	public post(endpoint: string, payload: any): Observable<any> {
		return this.http.post(endpoint, payload);
	}

	/**
	 * Performs a secure HTTP PUT request to the specified endpoint.
	 *
	 * @param endpoint - The relative target URL path or full API endpoint string.
	 * @param payload - The data payload to send in the request body.
	 * @returns An Observable emitting the strongly-typed payload response from the server.
	 */
	public put(endpoint: string, payload: any): Observable<any> {
		return this.http.put(endpoint, payload);
	}

	/**
	 * Performs a secure HTTP DELETE request to the specified endpoint.
	 *
	 * @param endpoint - The relative target URL path or full API endpoint string.
	 * @returns An Observable emitting the strongly-typed payload response from the server.
	 */
	public delete(endpoint: string): Observable<any> {
		return this.http.delete(endpoint);
	}

	/**
	 * Performs a secure HTTP DELETE request to the specified endpoint with a request body.
	 *
	 * @param endpoint - The relative target URL path or full API endpoint string.
	 * @param payload - The data payload to send in the request body.
	 * @returns An Observable emitting the strongly-typed payload response from the server.
	 */
	public deleteWithBody(endpoint: string, payload: any): Observable<any> {
		return this.http.delete(endpoint, { body: payload });
	}

	/**
	 * Performs a secure HTTP PATCH request to the specified endpoint.
	 *
	 * @param endpoint - The relative target URL path or full API endpoint string.
	 * @param payload - The data payload to send in the request body.
	 * @returns An Observable emitting the strongly-typed payload response from the server.
	 */
	public patch(endpoint: string, payload: any): Observable<any> {
		return this.http.patch(endpoint, payload);
	}
}
