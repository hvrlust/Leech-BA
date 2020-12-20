import { Component, OnInit, OnDestroy, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription, combineLatest, Observable, of } from 'rxjs';
import { startWith, distinctUntilChanged, map, switchMap, switchMapTo, catchError } from 'rxjs/operators';
import { MatSnackBar, ErrorStateMatcher, MatDialog } from '@angular/material';
import { PanelComponent } from './panel/panel.component';
import { CenteredSnackbarComponent } from './centered-snack-bar/centered-snack-bar.component';
import { HttpClient } from '@angular/common/http';
import { RequestSubmittedDialog } from './request-submitted-dialog.component';
import { OrderItem, OrderItemKind, Process, Request, RoundMode } from './calcbe/lba';
import { BxpCounter, Progress, PtsCounter } from './calcbe/types';

declare var process: (o: any) => string;
declare var wasmReady: Promise<any>;

class ImmediateErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return control.invalid;
	}
}

@Component({
	selector: 'app-calc',
	templateUrl: './calc.component.html',
	styleUrls: ['./calc.component.css'],
})
export class CalcComponent implements OnInit, OnDestroy {
	@ViewChild("lvlsPanel")
	public lvlsPanel: PanelComponent;
	@ViewChild("bxpPanel")
	public bxpPanel: PanelComponent;
	@ViewChild("itemsPanel")
	public itemsPanel: PanelComponent;

	public showBlackboard = false;
	public showBreakdown = false;

	public subscriptions: Subscription[] = [];

	public Progress = Progress;

	public progressValues = {
		[Progress.NM1]: "I haven't played BA",
		[Progress.HM1]: "I killed Queen after the rework",
		[Progress.HM6]: "I got up to wave 6 or 9 in HM",
		[Progress.HM10]: "I've killed King",
	};

	public form: FormGroup = new FormGroup({
		rsn: new FormControl('', Validators.required),
		discord: new FormControl(''),
		charges: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(500)])),
		progress: new FormControl(1, Validators.required),
		ironman: new FormControl(false),

		comp: new FormControl(false),
		nmSolo: new FormControl(false),
		kingSolo: new FormControl(false),

		lvls: new FormGroup({
			needAttLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),
			needDefLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),
			needColLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),
			needHealLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),

			needsKing: new FormControl(false),
		}),

		bxp: new FormGroup({
			agility: new FormControl(undefined, CalcComponent.bxpValidator),
			firemaking: new FormControl(undefined, CalcComponent.bxpValidator),
			mining: new FormControl(undefined, CalcComponent.bxpValidator),
		}),

		items: new FormGroup({
			hats: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(8)])),
			boots: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(2)])),
			gloves: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(2)])),
			torso: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(2)])),
			skirt: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(2)])),
			trident: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(1)])),
			masterTrident: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(1)])),
			armourPatches: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(8)])),
			attackerInsignia: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(1)])),
			defenderInsignia: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(1)])),
			healerInsignia: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(1)])),
			collectorInsignia: new FormControl(undefined, Validators.compose([Validators.min(0), Validators.max(1)])),
		}),

		has: new FormGroup({
			attackerPts: new FormControl(0, Validators.compose([Validators.min(0), Validators.max(15000)])),
			attackerLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),
			defenderPts: new FormControl(0, Validators.compose([Validators.min(0), Validators.max(15000)])),
			defenderLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),
			collectorPts: new FormControl(0, Validators.compose([Validators.min(0), Validators.max(15000)])),
			collectorLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),
			healerPts: new FormControl(0, Validators.compose([Validators.min(0), Validators.max(15000)])),
			healerLvl: new FormControl(1, Validators.compose([Validators.min(1), Validators.max(5)])),

			kings: new FormControl(0, Validators.compose([Validators.min(0), Validators.max(500)])),
		}),
	});

	public request$ = this.form.valueChanges.pipe(
		distinctUntilChanged(),
		map(form => {
			let preprocessed = this.preprocessForm(form);

			let hasAttackerLvl = form.has.attackerLvl || 1;
			let hasDefenderLvl = form.has.defenderLvl || 1;
			let hasCollectorLvl = form.has.collectorLvl || 1;
			let hasHealerLvl = form.has.healerLvl || 1;

			let hasAttackerPts = form.has.attackerPts || 0;
			let hasDefenderPts = form.has.defenderPts || 0;
			let hasCollectorPts = form.has.collectorPts || 0;
			let hasHealerPts = form.has.healerPts || 0;


			// keep wants lvl in sync with has lvl
			preprocessed.wantsAttackerLvl = Math.max(preprocessed.wantsAttackerLvl, hasAttackerLvl);
			preprocessed.wantsDefenderLvl = Math.max(preprocessed.wantsDefenderLvl, hasDefenderLvl);
			preprocessed.wantsCollectorLvl = Math.max(preprocessed.wantsCollectorLvl, hasCollectorLvl);
			preprocessed.wantsHealerLvl = Math.max(preprocessed.wantsHealerLvl, hasHealerLvl);

			let request = {
				rsn: form.rsn || "",
				discord: form.discord,
				ironman: form.ironman || false,
				progress: form.progress || 0,
				charges: form.charges || 0,
				lvls: {
					needAttLvl: form.lvls.needAttLvl || 1,
					needDefLvl: form.lvls.needDefLvl || 1,
					needColLvl: form.lvls.needColLvl || 1,
					needHealLvl: form.lvls.needHealLvl || 1,
					needsKing: form.lvls.needsKing || false,
				},
				has: {
					attackerPts: form.has.attackerPts || 0,
					attackerLvl: form.has.attackerLvl || 1,
					defenderPts: form.has.defenderPts || 0,
					defenderLvl: form.has.defenderLvl || 1,
					collectorPts: form.has.collectorPts || 0,
					collectorLvl: form.has.collectorLvl || 1,
					healerPts: form.has.healerPts || 0,
					healerLvl: form.has.healerLvl || 1,
					kings: form.has.kings || 0,
				},
				items: {
					hats: form.items.hats || 0,
					boots: form.items.boots || 0,
					gloves: form.items.gloves || 0,
					torso: form.items.torso || 0,
					skirt: form.items.skirt || 0,
					trident: form.items.trident || 0,
					masterTrident: form.items.masterTrident || 0,
					armourPatches: form.items.armourPatches || 0,
					attackerInsignia: form.items.attackerInsignia || 0,
					defenderInsignia: form.items.defenderInsignia || 0,
					healerInsignia: form.items.healerInsignia || 0,
					collectorInsignia: form.items.collectorInsignia || 0,
				},
				pts: {
					attacker: Math.max(preprocessed.wantsAttackerPts - hasAttackerPts + this.lvlDiff(hasAttackerLvl, preprocessed.wantsAttackerLvl), 0),
					defender: Math.max(preprocessed.wantsDefenderPts - hasDefenderPts + this.lvlDiff(hasDefenderLvl, preprocessed.wantsDefenderLvl), 0),
					collector: Math.max(preprocessed.wantsCollectorPts - hasCollectorPts + this.lvlDiff(hasCollectorLvl, preprocessed.wantsCollectorLvl), 0),
					healer: Math.max(preprocessed.wantsHealerPts - hasHealerPts + this.lvlDiff(hasHealerLvl, preprocessed.wantsHealerLvl), 0),
				},
				bxp: {
					agility: Math.max(CalcComponent.parseBxpVal(form.bxp.agility) || 0, 0),
					firemaking: Math.max(CalcComponent.parseBxpVal(form.bxp.firemaking) || 0, 0),
					mining: Math.max(CalcComponent.parseBxpVal(form.bxp.mining) || 0, 0),
				},
				queen: Math.max(preprocessed.queens, 0),
				king: Math.max(preprocessed.kings, 0),
				hm10tickets: Math.max(form.tickets || 0, 0),
				nmSolo: form.nmSolo,
				kingSolo: form.kingSolo,
			};

			return request;
		}),
		startWith({
			rsn: "",
			discord: "asd",
			ironman: false,
			progress: 0,
			charges: 0,
			has: {
				attackerPts: 0,
				attackerLvl: 1,
				defenderPts: 0,
				defenderLvl: 1,
				collectorPts: 0,
				collectorLvl: 1,
				healerPts: 0,
				healerLvl: 1,
				kings: 0,
			},
			items: {
				hats: 0,
				boots: 0,
				gloves: 0,
				torso: 0,
				skirt: 0,
				trident: 0,
				masterTrident: 0,
				armourPatches: 0,
				attackerInsignia: 0,
				defenderInsignia: 0,
				healerInsignia: 0,
				collectorInsignia: 0,
			},
			lvls: {
				needAttLvl: 1,
				needDefLvl: 1,
				needColLvl: 1,
				needHealLvl: 1,
				needsKing: false,
			},
			pts: {
				attacker: 0,
				defender: 0,
				collector: 0,
				healer: 0,
			},
			bxp: {
				agility: 0,
				firemaking: 0,
				mining: 0,
			},
			queen: 0,
			king: 0,
			hm10tickets: 0,
			nmSolo: false,
			kingSolo: false,
		})
	);

	public needsPts$ = this.form.valueChanges.pipe(
		map(form => {
			let preprocessed = this.preprocessForm(form);
			console.log(preprocessed)
			return (
				preprocessed.wantsAttackerLvl > 1 ||
				preprocessed.wantsDefenderLvl > 1 ||
				preprocessed.wantsCollectorLvl > 1 ||
				preprocessed.wantsHealerLvl > 1 ||
				preprocessed.wantsAttackerPts > 0 ||
				preprocessed.wantsDefenderPts > 0 ||
				preprocessed.wantsCollectorPts > 0 ||
				preprocessed.wantsHealerPts > 0
			)
		}),
	);

	public result$ = this.request$.pipe(
		map(r => Process(new Request({
			Ironman: r.ironman,
			Progress: r.progress,
			Charges: r.charges,
			Pts: new PtsCounter({
				Attacker: r.pts.attacker,
				Defender: r.pts.defender,
				Collector: r.pts.collector,
				Healer: r.pts.healer,
			}),
			Bxp: new BxpCounter({
				Agility: r.bxp.agility,
				Firemaking: r.bxp.firemaking,
				Mining: r.bxp.mining,
			}),
			Queen: r.queen,
			King: r.king,
			Hm10Tickets: r.hm10tickets,
			SoloNM: r.nmSolo,
			SoloKing: r.kingSolo,
		})))
	);

	public requestLeech$ = new EventEmitter<any>();

	public total$ = this.result$.pipe(
		map(r => {
			if (!r || !r.order || !r.order.Breakdown) {
				return undefined;
			}

			return r.order.Breakdown.reduce((acc, v) => {
				acc.price += (v.PriceDur.Price || 0) * v.Count;
				acc.dur += (v.PriceDur.Seconds || 0) * v.Count;
				return acc;
			}, { price: 0, dur: 0 })
		})
	)


	private blackboard = {
		attacker: [
			{ next: '+200 bonus damage', pts: '200' },
			{ next: '+300 bonus damage', pts: '300' },
			{ next: '+400 bonus damage', pts: '400' },
			{ next: '+500 bonus damage', pts: '500' },
			{ next: '- Mastered -', pts: '---' },
		],
		defender: [
			{ next: 'Bonus logs 1', pts: '200' },
			{ next: 'Bonus logs 2', pts: '300' },
			{ next: 'Bonus logs 3', pts: '400' },
			{ next: 'Bonus logs 4', pts: '500' },
			{ next: '- Mastered -', pts: '---' },
		],
		collector: [
			{ next: 'Egg convert success 70%', pts: '200' },
			{ next: 'Egg convert success 80%', pts: '300' },
			{ next: 'Egg convert success 90%', pts: '400' },
			{ next: 'Egg convert success 100%', pts: '500' },
			{ next: '- Mastered -', pts: '---' },
		],
		healer: [
			{ next: 'Heal 25% life points', pts: '200' },
			{ next: 'Heal 40% life points', pts: '300' },
			{ next: 'Heal 45% life points', pts: '400' },
			{ next: 'Heal 50% life points', pts: '500' },
			{ next: '- Mastered -', pts: '---' },
		],
	}

	public matcher = new ImmediateErrorStateMatcher();

	constructor(private snackBar: MatSnackBar, private http: HttpClient, private dialog: MatDialog) { }

	ngOnInit() {
		// show ticket control if ironman and hm10
		this.addSubscription(
			combineLatest(
				this.form.get('ironman').valueChanges.pipe(startWith(false)),
				this.form.get('progress').valueChanges.pipe(startWith(1)),
			).subscribe({
				next: ([ironman, progress]) => {
					if (!ironman || progress !== 4) {
						this.form.removeControl("tickets");
						return;
					}

					if (!this.form.contains("tickets")) {
						this.form.addControl("tickets", this.makeTicketControl());
					}
				}
			})
		);
		this.addSubscription(this.form.get('progress').valueChanges.subscribe({
			next: (progress) => {
				if (progress != Progress.HM10) {
					this.form.get('has').get('kings').reset()
				}

				if (progress >= Progress.HM1) {
					this.onCollapse('hmUnlock');
				}
			}
		})
		);

		// toggle bxp section off for ironman
		this.addSubscription(
			this.form.get('ironman').valueChanges.pipe(distinctUntilChanged()).subscribe({
				next: (v) => {
					if (v) {
						this.form.get("bxp").reset();

						this.form.get("items").get("attackerInsignia").reset();
						this.form.get("items").get("defenderInsignia").reset();
						this.form.get("items").get("healerInsignia").reset();
						this.form.get("items").get("collectorInsignia").reset();
						this.form.get("items").get("trident").reset();
						this.form.get("items").get("masterTrident").reset();

						this.bxpPanel.disabled = true;
						this.bxpPanel.expanded = false;
					} else {
						this.bxpPanel.disabled = false;
					}
				}
			})
		);

		// disable lvls section if it's filled in
		this.addSubscription(this.form.get('lvls').valueChanges.subscribe({
			next: (v) => {
				// this.lvlsPanel.disabled = !this.form.get('lvls').valid || v.needsKing || this.anyPropsBiggerThan(v, 1);
			}
		}));

		// disable bxp section if it's filled in
		this.addSubscription(this.form.get('bxp').valueChanges.subscribe({
			next: (v) => {
				this.bxpPanel.disabled = !this.form.get('bxp').valid || this.anyPropsBiggerThan(v, 0);
			}
		}));

		// disable items section if it's filled in
		this.addSubscription(this.form.get('items').valueChanges.subscribe({
			next: (v) => {
				this.itemsPanel.disabled = !this.form.get('items').valid || this.anyPropsBiggerThan(v, 0);
			}
		}));

		// listen for submission requests
		this.addSubscription(
			this.request$.pipe(
				switchMap(val => this.requestLeech$.pipe(map(() => val))),
				switchMap(req => this.http.post("/api/request", req).pipe(
					map(() => ({
						request: req,
						ok: true,
					})),
					catchError(() => of({
						request: req,
						ok: false,
					}))
				)),
			).subscribe({
				next: (response) => {
					let res = { params: response.request };
					console.log(
						`
						RSN: ${res.params.rsn}
						Discord: ${res.params.discord}
						Ironman: ${res.params.ironman} (${res.params.hm10tickets} tickets)
						BA completed up to: ${res.params.progress}
						Enhancer charges: ${res.params.charges} charges
						
						Levels:
						Current: A[L${res.params.has.attackerLvl},${res.params.has.attackerPts}] C[L${res.params.has.collectorLvl},${res.params.has.collectorPts}] D[L${res.params.has.defenderLvl},${res.params.has.defenderPts}] H[L${res.params.has.healerLvl},${res.params.has.healerPts}] 
						Needs: A[L${res.params.lvls.needAttLvl}] C[L${res.params.lvls.needColLvl}] D[L${res.params.lvls.needDefLvl}] H[L${res.params.lvls.needHealLvl}] 
						
						Items:
						Hats: ${res.params.items.hats}
						Boots: ${res.params.items.boots}
						Gloves: ${res.params.items.gloves}
						Torso: ${res.params.items.torso}
						Skirt: ${res.params.items.skirt}
						Trident: ${res.params.items.trident}
						Master Trident: ${res.params.items.masterTrident}
						Armour Patches: ${res.params.items.armourPatches}
						Attacker Insignia: ${res.params.items.attackerInsignia}
						Defender Insignia: ${res.params.items.defenderInsignia}
						Healer Insignia: ${res.params.items.healerInsignia}
						Collector Insignia: ${res.params.items.collectorInsignia}

						Net Pts: ${res.params.pts.attacker} att + ${res.params.pts.collector} col + ${res.params.pts.defender} def + ${res.params.pts.healer} heal
						Net XP: ${res.params.bxp.agility} agility + ${res.params.bxp.firemaking} firemaking + ${res.params.bxp.mining} mining
						Net Queens: ${res.params.queen}; solo: ${res.params.nmSolo}
						Net Kings: ${res.params.king}; solo: ${res.params.kingSolo}
						`
					);
					const dialogRef = this.dialog.open(RequestSubmittedDialog, {
						data: {
							ok: !response.ok,
							hasPts: response.request.pts.attacker > 0 || response.request.pts.collector > 0 || response.request.pts.defender > 0 || response.request.pts.healer > 0,
							hasDisc: !!response.request.discord,
							needsTutorial: response.request.progress == 1,
						},
					});
				},
			})
		);
	}

	private preprocessForm(form): {
		queens: number
		kings: number
		wantsAttackerLvl: number
		wantsDefenderLvl: number
		wantsCollectorLvl: number
		wantsHealerLvl: number
		wantsAttackerPts: number
		wantsDefenderPts: number
		wantsCollectorPts: number
		wantsHealerPts: number
	} {
		let queens = 0;
		let kings = 0;

		let wantsAttackerLvl = form.lvls.needAttLvl || 1;
		let wantsDefenderLvl = form.lvls.needDefLvl || 1;
		let wantsCollectorLvl = form.lvls.needColLvl || 1;
		let wantsHealerLvl = form.lvls.needHealLvl || 1;

		let hasAttackerLvl = form.has.attackerLvl || 1;
		let hasDefenderLvl = form.has.defenderLvl || 1;
		let hasCollectorLvl = form.has.collectorLvl || 1;
		let hasHealerLvl = form.has.healerLvl || 1;

		let wantsAttackerPts = 0;
		let wantsDefenderPts = 0;
		let wantsCollectorPts = 0;
		let wantsHealerPts = 0;

		let hasAttackerPts = form.has.attackerPts || 0;
		let hasDefenderPts = form.has.defenderPts || 0;
		let hasCollectorPts = form.has.collectorPts || 0;
		let hasHealerPts = form.has.healerPts || 0;

		// insignias
		if (form.items.attackerInsignia > 0) {
			wantsAttackerLvl = 5;
			wantsAttackerPts += 500;
			kings += 5;
		}
		if (form.items.defenderInsignia > 0) {
			wantsDefenderLvl = 5;
			wantsDefenderPts += 500;
			kings += 5;
		}
		if (form.items.collectorInsignia > 0) {
			wantsCollectorLvl = 5;
			wantsCollectorPts += 500;
			kings += 5;
		}
		if (form.items.healerInsignia > 0) {
			wantsHealerLvl = 5;
			wantsHealerPts += 500;
			kings += 5;
		}

		// armour
		if (form.items.hats > 0) {
			wantsAttackerPts += 275 * form.items.hats;
			wantsDefenderPts += 275 * form.items.hats;
			wantsCollectorPts += 275 * form.items.hats;
			wantsHealerPts += 275 * form.items.hats;
			queens += form.items.hats;
		}
		if (form.items.boots > 0) {
			wantsAttackerPts += 100 * form.items.boots;
			wantsDefenderPts += 100 * form.items.boots;
			wantsCollectorPts += 100 * form.items.boots;
			wantsHealerPts += 100 * form.items.boots;
		}
		if (form.items.gloves > 0) {
			wantsAttackerPts += 150 * form.items.gloves;
			wantsDefenderPts += 150 * form.items.gloves;
			wantsCollectorPts += 150 * form.items.gloves;
			wantsHealerPts += 150 * form.items.gloves;
		}
		if (form.items.torso > 0) {
			wantsAttackerPts += 375 * form.items.torso;
			wantsDefenderPts += 375 * form.items.torso;
			wantsCollectorPts += 375 * form.items.torso;
			wantsHealerPts += 375 * form.items.torso;
			queens += form.items.torso;
		}
		if (form.items.skirt > 0) {
			wantsAttackerPts += 375 * form.items.skirt;
			wantsDefenderPts += 375 * form.items.skirt;
			wantsCollectorPts += 375 * form.items.skirt;
			wantsHealerPts += 375 * form.items.skirt;
			queens += form.items.skirt;
		}
		if (form.items.trident > 0) {
			wantsAttackerPts += 170 * form.items.trident;
			wantsDefenderPts += 170 * form.items.trident;
			wantsCollectorPts += 170 * form.items.trident;
			wantsHealerPts += 170 * form.items.trident;
		}
		if (form.items.masterTrident > 0) {
			wantsAttackerPts += 220 * form.items.masterTrident;
			wantsDefenderPts += 220 * form.items.masterTrident;
			wantsCollectorPts += 220 * form.items.masterTrident;
			wantsHealerPts += 220 * form.items.masterTrident;
		}
		if (form.items.armourPatches > 0) {
			wantsCollectorPts += 100 * form.items.armourPatches;
		}

		// if leech needs king for trim, add it
		if (form.lvls.needsKing && kings <= 0) {
			kings = 1;
		}

		kings -= form.has.kings;
		kings = Math.max(kings, 0);

		let needsPts = wantsAttackerPts > 0 ||
			wantsDefenderPts > 0 ||
			wantsCollectorPts > 0 ||
			wantsHealerPts > 0 ||
			wantsAttackerLvl > 1 ||
			wantsDefenderLvl > 1 ||
			wantsCollectorLvl > 1 ||
			wantsHealerLvl > 1;

		let needsBxp = CalcComponent.parseBxpVal(form.bxp.agility) > 0 ||
			CalcComponent.parseBxpVal(form.bxp.firemaking) > 0 ||
			CalcComponent.parseBxpVal(form.bxp.mining) > 0

		// if leech needs comp, add it
		let wantsComp = form.comp && form.progress === Progress.NM1;
		let needsComp = form.progress === Progress.NM1 && (needsPts || needsBxp || kings > 0);
		if ((wantsComp || needsComp) && queens <= 0) {
			queens = 1
		}

		return {
			queens,
			kings,
			wantsAttackerLvl,
			wantsDefenderLvl,
			wantsCollectorLvl,
			wantsHealerLvl,
			wantsAttackerPts,
			wantsDefenderPts,
			wantsCollectorPts,
			wantsHealerPts,
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	public onExpand(section: string) {
		switch (section) {
			case "hmUnlock":
				this.form.get("comp").setValue(true);
				this.snackBar.openFromComponent(CenteredSnackbarComponent, { duration: 3000, data: "Added Hardmode Unlock to your request" });
				break;

			case "lvls":
				this.snackBar.openFromComponent(CenteredSnackbarComponent, { duration: 3000, data: "Added Pts & Levels from your request" });
				this.form.get("lvls").patchValue({
					needAttLvl: 5,
					needDefLvl: 5,
					needColLvl: 5,
					needHealLvl: 5,
					needsKing: true,
				});
				break;
		}
	}

	public onCollapse(section: string) {
		switch (section) {
			case "hmUnlock":
				this.form.get("comp").setValue(false);
				this.form.get("nmSolo").setValue(false);
				this.snackBar.openFromComponent(CenteredSnackbarComponent, { duration: 3000, data: "Removed Hardmode Unlock from your request" });
				break;
			case "lvls":
				this.snackBar.openFromComponent(CenteredSnackbarComponent, { duration: 3000, data: "Removed Pts & Levels from your request" });
				this.form.get("lvls").patchValue({
					needAttLvl: 1,
					needDefLvl: 1,
					needColLvl: 1,
					needHealLvl: 1,
					needsKing: false,
				});
				break;
			case "bxp":
				this.form.get("bxp").reset();
				this.snackBar.openFromComponent(CenteredSnackbarComponent, { duration: 3000, data: "Removed Bxp Leech from your request" });
				break;
			case "items":
				this.form.get("items").reset();
				this.snackBar.openFromComponent(CenteredSnackbarComponent, { duration: 3000, data: "Removed Item Leech from your request" });
				break;
		}
	}

	public rewardNextLvl(role: string): string {
		return this.blackboard[role][(this.form.get("has").get(role + "Lvl").value || 1) - 1].next;
	}

	public ptsNextLvl(role: string): number {
		return this.blackboard[role][(this.form.get("has").get(role + "Lvl").value || 1) - 1].pts;
	}

	public kind(item: OrderItem): string {
		return OrderItemKind.String(item.Kind);
	}

	public mode(item: OrderItem): string {
		return RoundMode.String(item.Mode);
	}

	public hasPts(item: OrderItem): boolean {
		if (!item.PtsGained) {
			return false;
		}

		return item.PtsGained.Attacker > 0 ||
			item.PtsGained.Defender > 0 ||
			item.PtsGained.Collector > 0 ||
			item.PtsGained.Healer > 0;
	}

	public hasBxp(item: OrderItem): boolean {
		if (!item.BxpGained) {
			return false;
		}

		return item.BxpGained.Agility > 0 ||
			item.BxpGained.Firemaking > 0 ||
			item.BxpGained.Mining > 0;
	}

	public togglePreset(preset: string) {
		if (this.isPresetApplied(preset)) {
			this.removePreset(preset)
		} else {
			this.applyPreset(preset)
		}
	}

	public applyPreset(preset: string) {
		let items = this.form.get("items");
		if (preset === "poh") {
			items.patchValue({
				hats: 8,
				boots: 2,
				gloves: 2,
				torso: 2,
				skirt: 2,
				armourPatches: 8,
			});
			return;
		}

		if (preset === "insignias") {
			items.patchValue({
				attackerInsignia: 1,
				defenderInsignia: 1,
				healerInsignia: 1,
				collectorInsignia: 1,
			});
			return;
		}
	}

	public removePreset(preset: string) {
		let items = this.form.get("items");
		if (preset === "poh") {
			items.get("hats").reset();
			items.get("boots").reset();
			items.get("gloves").reset();
			items.get("torso").reset();
			items.get("skirt").reset();
			items.get("armourPatches").reset();
			return;
		}

		if (preset === "insignias") {
			items.get("attackerInsignia").reset();
			items.get("defenderInsignia").reset();
			items.get("healerInsignia").reset();
			items.get("collectorInsignia").reset();
			return;
		}
	}

	public isPresetApplied(preset: string) {
		let items = this.form.get("items").value;
		if (preset === "poh") {
			return items.hats >= 8 &&
				items.boots >= 2 &&
				items.gloves >= 2 &&
				items.torso >= 2 &&
				items.skirt >= 2 &&
				items.armourPatches >= 8;
		}

		if (preset === "insignias") {
			return items.attackerInsignia >= 1 &&
				items.defenderInsignia >= 1 &&
				items.healerInsignia >= 1 &&
				items.collectorInsignia >= 1;
		}
	}

	private makeTicketControl(): FormControl {
		return new FormControl(0, Validators.compose([Validators.min(0), Validators.max(500)]));
	}

	private addSubscription(s: Subscription) {
		this.subscriptions.push(s);
	}

	private anyPropsBiggerThan(o, n: number) {
		return Object.keys(o).some((v) => o[v] > n);
	}

	private lvlDiff(hasLvl: number, wantsLvl: number): number {
		const pts = [0, 200, 500, 900, 1400];
		return Math.max(pts[wantsLvl - 1] - pts[hasLvl - 1], 0);
	}

	private static parseBxpVal(value: string): number {
		value = (value || "").trim();
		let suffix = value[value.length - 1];
		let intval = parseInt(value.replace(/[^\d]/g, ""), 10)
		switch (suffix) {
			case "k":
			case "K":
				intval *= 1000;
				break;
			case "m":
			case "M":
				intval *= 1000000;
				break;
		}
		return intval;
	}

	private static bxpValidator(control: AbstractControl): ValidationErrors | null {
		let value = (control.value as string || "").trim();
		let suffix = value[value.length - 1];
		if (/m|M|k|K/.test(suffix)) {
			value = value.slice(0, value.length - 1)
		}
		if (/[^\d]/g.test(value)) {
			return {
				"syntax": true,
			};
		}

		let intval = CalcComponent.parseBxpVal(value);
		if (intval < 0) {
			return {
				"min": 0,
			};
		}
		if (intval >= 150000000) {
			return {
				"max": 150000000,
			};
		}
		return null;
	}
}

