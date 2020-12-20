import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
	selector: 'app-centered-snack-bar',
	template: '{{msg}}',
	styles: [`
		:host {
			display: block;
			text-align: center;
			line-height: 20px;
			font-size: 14px;
		}
	`],
})
export class CenteredSnackbarComponent {
	constructor(snackBarRef: MatSnackBarRef<CenteredSnackbarComponent>, @Inject(MAT_SNACK_BAR_DATA) public msg: any) { };
}