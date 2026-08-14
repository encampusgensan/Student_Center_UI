import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.html',
	styleUrl: './landing.scss',
	imports: [NzLayoutModule, NzButtonModule]
})
export class Landing implements OnInit {
	private readonly router = inject(Router);

	public ngOnInit(): void {
		this.yearNow = new Date().getFullYear();
	}

	public yearNow: number = 0;

	public gotoRegister(): void {
		this.router.navigate(['/register']);
	}

	public gotoLogin(): void {
		this.router.navigate(['/login']);
	}
}
