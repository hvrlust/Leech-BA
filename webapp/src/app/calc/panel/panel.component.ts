import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
	selector: 'app-panel',
	templateUrl: './panel.component.html',
	styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit, OnDestroy {
	public control = new FormControl(false);

	@Input()
	public title: string;
	@Input()
	public subtitle: string;
	@Input()
	public set disabled(v: boolean) {
		if (v) {
			this.control.disable({ emitEvent: false });
		} else {
			this.control.enable({ emitEvent: false });
		}
	}
	@Input()
	public set expanded(v: boolean) {
		setTimeout(() => {
			if (this.control.value != v) {
				this.control.setValue(v);
			}
		}, 0);
	}

	@Output()
	public onExpand = new EventEmitter<boolean>();
	@Output()
	public onCollapse = new EventEmitter<boolean>();


	private subscriptions: Subscription[] = [];

	constructor() { }

	ngOnInit() {
		this.subscriptions.push(
			this.control.valueChanges.pipe(
				distinctUntilChanged()).subscribe({
					next: (v) => {
						let emmiter = v ? this.onExpand : this.onCollapse;
						emmiter.next(true);
					}
				})
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(s => s.unsubscribe());
	}
}
