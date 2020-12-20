import { chargesPerWave, hm10Primary, hm10Secondary, LeechPriceDur, LeechPriceDurTable, nm10Primary, nm10Secondary } from "./rates"
import { BxpCounter, Mode, Progress, PtsCounter, Role, RoleOrder, RoleSet, Skill } from "./types"

// ErrInvCharges occurs when the charges value is negative.
export const ErrInvCharges = new Error("invalid charges")

// ErrInvPts occurs when the pts value for any role is negative.
export const ErrInvPts = new Error("invalid pts")

// ErrInvKings occurs when the kings value is negative.
export const ErrInvKings = new Error("invalid kings")

// ErrInvQueens occurs when the queens value is negative.
export const ErrInvQueens = new Error("invalid queens")

// ErrInvXp occurs when a given xp value cannot be parsed according to runescape
// rules.
export const ErrInvXp = new Error("invalid xp value")

// ErrRsnRequired request does not have rsn
export const ErrRsnRequired = new Error("rsn must not be empty")

// ErrEmpty request is empty
export const ErrEmpty = new Error("nothing to do")

// ErrImBxp ironman cant get bxp
export const ErrImBxp = new Error("ironman cant get bxp")

// ErrTicketProgressMismatch ironman leech cannot have tickets without being HM10
export const ErrTicketProgressMismatch = new Error("ironman leech cannot have tickets without being HM10")

// ErrInvTickets can't have a negative number of tickets
export const ErrInvTickets = new Error("can't have a negative number of tickets")

// Request models a user request.
//
// In order to be valid, it must have an rsn and at least 1 item to do, be it
// queen/king kills, pts or bxp.
export class Request {
	Ironman: boolean = false;
	Progress: Progress = 0;
	Charges: number = 0;
	Pts: PtsCounter = new PtsCounter();
	Bxp: BxpCounter = new BxpCounter();
	King: number = 0;
	Queen: number = 0;
	Hm10Tickets: number = 0;
	SoloNM: boolean = false;
	SoloKing: boolean = false;

	constructor(v?: {
		Ironman?: boolean;
		Progress?: Progress;
		Charges?: number;
		Pts?: PtsCounter;
		Bxp?: BxpCounter;
		King?: number;
		Queen?: number;
		Hm10Tickets?: number;
		SoloNM?: boolean;
		SoloKing?: boolean;
	}) {
		this.Ironman = (v && v.Ironman) || false;
		this.Progress = (v && v.Progress) || 0;
		this.Charges = (v && v.Charges) || 0;
		this.Pts = new PtsCounter({
			Attacker: (v && v.Pts && v.Pts.Attacker) || 0,
			Defender: (v && v.Pts && v.Pts.Defender) || 0,
			Healer: (v && v.Pts && v.Pts.Healer) || 0,
			Collector: (v && v.Pts && v.Pts.Collector) || 0,
		});
		this.Bxp = new BxpCounter({
			Agility: (v && v.Bxp && v.Bxp.Agility) || 0,
			Firemaking: (v && v.Bxp && v.Bxp.Firemaking) || 0,
			Mining: (v && v.Bxp && v.Bxp.Mining) || 0,
		});
		this.King = (v && v.King) || 0;
		this.Queen = (v && v.Queen) || 0;
		this.Hm10Tickets = (v && v.Hm10Tickets) || 0;
		this.SoloNM = (v && v.SoloNM) || false;
		this.SoloKing = (v && v.SoloKing) || false;
	}

	public clone(): Request {
		let ret = new Request();
		ret.Ironman = this.Ironman;
		ret.Progress = this.Progress;
		ret.Charges = this.Charges;
		ret.Pts = new PtsCounter({
			Attacker: this.Pts.Attacker,
			Defender: this.Pts.Defender,
			Healer: this.Pts.Healer,
			Collector: this.Pts.Collector,
		});
		ret.Bxp = new BxpCounter({
			Agility: this.Bxp.Agility,
			Firemaking: this.Bxp.Firemaking,
			Mining: this.Bxp.Mining,
		});
		ret.King = this.King;
		ret.Queen = this.Queen;
		ret.Hm10Tickets = this.Hm10Tickets;
		ret.SoloNM = this.SoloNM;
		ret.SoloKing = this.SoloKing;
		return ret
	}

	// Valid checks if the request is valid.
	//
	// In order to be valid, it must have an rsn, all it's fields must be valid,
	// and it has to have at least 1 item to do, be it queen/king kills, pts or bxp.
	Valid(): Error {
		if (this.Charges < 0) {
			return ErrInvCharges
		}
		if (this.Queen < 0) {
			return ErrInvQueens
		}
		if (this.King < 0) {
			return ErrInvKings
		}
		if (this.Pts.Attacker < 0 || this.Pts.Defender < 0 || this.Pts.Healer < 0 || this.Pts.Collector < 0) {
			return ErrInvPts
		}
		if (this.Bxp.Agility < 0 || this.Bxp.Firemaking < 0 || this.Bxp.Mining < 0) {
			return ErrInvXp
		}
		if (this.Ironman && !this.Bxp.Empty()) {
			return ErrImBxp
		}
		if (this.Pts.Empty() && this.Bxp.Empty() && this.Queen <= 0 && this.King <= 0) {
			return ErrEmpty
		}
		if (this.Hm10Tickets < 0) {
			return ErrInvTickets
		}

		if (this.Ironman && this.Hm10Tickets > 0 && this.Progress != Progress.HM10) {
			return ErrTicketProgressMismatch
		}

		return undefined;
	}



	// AddPtsAll subtracts the given values from Pts.
	AddPtsAll(attacker: number, defender: number, healer: number, collector: number) {
		this.Pts.Attacker -= attacker
		this.Pts.Defender -= defender
		this.Pts.Healer -= healer
		this.Pts.Collector -= collector
	}

	// AddPts subtracts the given value from Pts.
	AddPts(role: Role, pts: number) {
		if (role == Role.Attacker) {
			this.Pts.Attacker -= pts
		}
		if (role == Role.Defender) {
			this.Pts.Defender -= pts
		}
		if (role == Role.Healer) {
			this.Pts.Healer -= pts
		}
		if (role == Role.Collector) {
			this.Pts.Collector -= pts
		}
	}

	// AddBxp subtracts the given values from Bxp.
	AddBxp(skill: Skill, bxp: number) {
		switch (skill) {
			case Skill.Agility:
				this.Bxp.Agility -= bxp
				break;
			case Skill.Firemaking:
				this.Bxp.Firemaking -= bxp
				break;
			case Skill.Mining:
				this.Bxp.Mining -= bxp
				break;
		}
	}

	// Update updates the request given an OrderItem TODO: rethink this
	Update(item: OrderItem) {
		this.Charges -= item.ChargesConsumed

		this.Pts.Attacker -= item.PtsGained.Attacker
		this.Pts.Defender -= item.PtsGained.Defender
		this.Pts.Healer -= item.PtsGained.Healer
		this.Pts.Collector -= item.PtsGained.Collector

		this.Bxp.Agility -= item.BxpGained.Agility
		this.Bxp.Firemaking -= item.BxpGained.Firemaking
		this.Bxp.Mining -= item.BxpGained.Mining

		this.King -= item.Kings
		this.Queen -= item.Queens
	}
}

// RoundMode is a type of rounds we do in BA, it contains both a Mode and
// the given start/end waves (starting from 1).
export type RoundMode = {
	Mode: Mode;
	Start: number;
	End: number;
	Len: number;
}

export namespace RoundMode {
	export function String(v: RoundMode): string {
		if (v.Start === v.End) {
			return `${Mode.String(v.Mode)} (wave ${v.Start})`;
		}
		return `${Mode.String(v.Mode)} (waves ${v.Start}-${v.End})`;
	}

	export function Equals(a: RoundMode, b: RoundMode): boolean {
		return a.Mode === b.Mode &&
			a.Start === b.Start &&
			a.End === b.End &&
			a.Len === b.Len
	}
}

// List of valid RoundModes
export const Nm1_10: RoundMode = { Mode: Mode.NM, Start: 1, End: 10, Len: 10 }
export const Hm1_9: RoundMode = { Mode: Mode.HM, Start: 1, End: 9, Len: 9 }
export const Hm6_9: RoundMode = { Mode: Mode.HM, Start: 6, End: 9, Len: 4 }
export const Hm10: RoundMode = { Mode: Mode.HM, Start: 10, End: 10, Len: 1 }


// WaveCounter keeps track of the current wave and the total round count.
export class WaveCounter {
	RoundMode: RoundMode = Nm1_10;
	Current: number = 0;
	Count: number = 0;

	constructor(m: RoundMode) {
		this.RoundMode = m;
	}

	// Next returns the next wave for the given RoundMode.
	Next(): number {
		if (this.Current == 0) {
			this.Current = this.RoundMode.Start
			this.Count++
			return this.Current
		}

		this.Current++
		if (this.Current == this.RoundMode.End + 1) {
			this.Count++
			this.Current = this.RoundMode.Start
		}

		return this.Current
	}

	// SpareWaves returns the number of uncompleted waves for the current round.
	SpareWaves(): number {
		let curr = this.Current
		if (curr == 0) {
			curr = this.RoundMode.Start - 1
		}
		return this.RoundMode.End - curr
	}
}


// OrderItem models a single item of an Order.
export class OrderItem {
	Kind: OrderItemKind;
	PriceDur: LeechPriceDur;
	Mode: RoundMode;
	Count: number = 0;
	Roles: RoleSet;
	ChargesConsumed: number;
	PtsGained: PtsCounter;
	PtsWaves: PtsCounter;
	BxpGained: BxpCounter;
	BxpWaves: BxpCounter;
	Queens: number;
	Kings: number;
	SpareWaves: number;
	Solo: boolean = false;

	constructor(v?: {
		Kind?: OrderItemKind;
		PriceDur?: LeechPriceDur;
		Mode?: RoundMode;
		Count?: number;
		Roles?: RoleSet;
		ChargesConsumed?: number;
		PtsGained?: PtsCounter;
		PtsWaves?: PtsCounter;
		BxpGained?: BxpCounter;
		BxpWaves?: BxpCounter;
		Queens?: number;
		Kings?: number;
		SpareWaves?: number;
		Solo?: boolean;
	}) {
		this.Kind = (v && v.Kind) || 0;
		this.PriceDur = (v && v.PriceDur) || LeechPriceDurTable.Empty();
		this.Mode = (v && v.Mode) || Nm1_10;
		this.Count = (v && v.Count) || 0;
		this.Roles = (v && v.Roles) || new RoleSet();
		this.ChargesConsumed = (v && v.ChargesConsumed) || 0;
		this.PtsGained = (v && v.PtsGained) || new PtsCounter();
		this.PtsWaves = (v && v.PtsWaves) || new PtsCounter();
		this.BxpGained = (v && v.BxpGained) || new BxpCounter();
		this.BxpWaves = (v && v.BxpWaves) || new BxpCounter();
		this.Queens = (v && v.Queens) || 0;
		this.Kings = (v && v.Kings) || 0;
		this.SpareWaves = (v && v.SpareWaves) || 0;
		this.Solo = (v && v.Solo) || false;
	}

	// Merge creates a new OrderItem that combines the result of both.
	//
	// It returns an empty OrderItem and false if the arguments are not mergeable.
	Merge(other: OrderItem): { result: OrderItem, ok: boolean } {
		if (this.Kind != other.Kind) {
			return { result: new OrderItem(), ok: false }
		}
		if (!RoundMode.Equals(this.Mode, other.Mode)) {
			return { result: new OrderItem(), ok: false }
		}
		if (!LeechPriceDur.Equals(this.PriceDur, other.PriceDur)) {
			return { result: new OrderItem(), ok: false }
		}

		let ret = new OrderItem()
		ret.Kind = this.Kind;
		ret.Mode = this.Mode;
		ret.PriceDur = this.PriceDur;
		ret.Count = this.Count + other.Count;
		ret.Roles = this.Roles.Merge(other.Roles);
		ret.ChargesConsumed = this.ChargesConsumed + other.ChargesConsumed;
		ret.PtsGained = this.PtsGained.Merge(other.PtsGained);
		ret.PtsWaves = this.PtsWaves.Merge(other.PtsWaves);
		ret.BxpGained = this.BxpGained.Merge(other.BxpGained);
		ret.BxpWaves = this.BxpWaves.Merge(other.BxpWaves);
		ret.Queens = this.Queens + other.Queens;
		ret.Kings = this.Kings + other.Kings;
		ret.SpareWaves = this.SpareWaves + other.SpareWaves;
		ret.Solo = this.Solo || other.Solo;
		return { result: ret, ok: true };
	}

	// AddPtsWaveAll adds the given values to PtsGained, incrementing the number of
	// waves for the role and adding it to the role set.
	AddPtsWaveAll(role: Role, attacker: number, defender: number, healer: number, collector: number) {
		this.Roles.Add(role)

		this.PtsGained.Attacker += attacker
		this.PtsGained.Defender += defender
		this.PtsGained.Healer += healer
		this.PtsGained.Collector += collector

		switch (role) {
			case Role.Attacker:
				this.PtsWaves.Attacker++
				break;
			case Role.Defender:
				this.PtsWaves.Defender++
				break;
			case Role.Healer:
				this.PtsWaves.Healer++
				break;
			case Role.Collector:
				this.PtsWaves.Collector++
				break;
		}
	}

	// AddPtsWave adds the given values to PtsGained, incrementing the number of
	// waves for the role and adding it to the role set.
	AddPtsWave(role: Role, pts: number) {
		this.Roles.Add(role)

		switch (role) {
			case Role.Attacker:
				this.PtsWaves.Attacker++
				this.PtsGained.Attacker += pts
				break;
			case Role.Defender:
				this.PtsWaves.Defender++
				this.PtsGained.Defender += pts
				break;
			case Role.Healer:
				this.PtsWaves.Healer++
				this.PtsGained.Healer += pts
				break;
			case Role.Collector:
				this.PtsWaves.Collector++
				this.PtsGained.Collector += pts
				break;
		}
	}

	// AddPtsAll adds the given values to PtsGained
	AddPtsAll(attacker: number, defender: number, healer: number, collector: number) {
		this.PtsGained.Attacker += attacker
		this.PtsGained.Defender += defender
		this.PtsGained.Healer += healer
		this.PtsGained.Collector += collector
	}

	// AddPts adds the given values to PtsGained
	AddPts(role: Role, pts: number) {
		if (role == Role.Attacker) {
			this.PtsGained.Attacker += pts
		}
		if (role == Role.Defender) {
			this.PtsGained.Defender += pts
		}
		if (role == Role.Healer) {
			this.PtsGained.Healer += pts
		}
		if (role == Role.Collector) {
			this.PtsGained.Collector += pts
		}
	}

	// AddBxpWave adds the given values to BxpGained, incrementing the number of
	// waves for the skill and marking it as Collector.
	AddBxpWave(skill: Skill, bxp: number) {
		this.Roles.Add(Role.Collector)

		switch (skill) {
			case Skill.Agility:
				this.BxpGained.Agility += bxp
				this.BxpWaves.Agility++
				break;
			case Skill.Firemaking:
				this.BxpGained.Firemaking += bxp
				this.BxpWaves.Firemaking++
				break;
			case Skill.Mining:
				this.BxpGained.Mining += bxp
				this.BxpWaves.Mining++
				break;
		}
	}

	Cost(): number {
		// if (this.Solo) {
		// 	return 2 * this.Count * this.PriceDur.Price
		// }
		// return this.Count * this.PriceDur.Price
		return 0
	}

	Duration(): number {
		// return this.Count * this.PriceDur.Seconds
		return 0
	}
}


// Order keeps track of the current (mutable) request and it's associated
// items.
export class Order {
	Request: Request;
	Breakdown: OrderItem[] = [];


	constructor(v?: {
		Request?: Request
		Breakdown?: OrderItem[]
	}) {
		this.Request = (v && v.Request) || new Request()
		this.Breakdown = (v && v.Breakdown) || []
	}

	// Add adds a new OrderItem to the Breakdown.
	//
	// It will try to merge order items together, otherwise it will add a new one.
	Add(item: OrderItem) {
		if (item.Count == 0) {
			return
		}

		for (let i = 0; i < this.Breakdown.length; i++) {
			const v = this.Breakdown[i];
			let { result, ok } = v.Merge(item)
			if (ok) {
				this.Breakdown[i] = result
				return
			}
		}

		this.Breakdown.push(item)
	}
}

// OrderItemKind is the kind of the OrderItem
export enum OrderItemKind {
	// KindPoints is used for pts rounds.
	Points = 1,
	// KindBxp is used for bxp rounds.
	Bxp,
	// KindQueen is used for a Queen kill.
	Queen,
	// KindHM10Unlock is used for unlocking King.
	HM10Unlock,
	// KindKing is used for a King kill.
	King,
	// KindTicket is used for rounds who's purpose is to earn tickets.
	Ticket,
}

export namespace OrderItemKind {

	export function String(s: OrderItemKind): string {
		switch (s) {
			case OrderItemKind.Points:
				return "Points"
			case OrderItemKind.Bxp:
				return "Bxp"
			case OrderItemKind.Queen:
				return "Queen"
			case OrderItemKind.HM10Unlock:
				return "HM Wave 10 Unlock"
			case OrderItemKind.King:
				return "King"
			case OrderItemKind.Ticket:
				return "Ticket Round"
			default:
				return ""
		}
	}
}


export function calcPointsRounds(req: Request, ctr: WaveCounter, roleOrder: RoleOrder): OrderItem {
	if (req.Pts.Empty()) {
		return new OrderItem();
	}

	let item = new OrderItem({
		Kind: OrderItemKind.Points,
		PriceDur: LeechPriceDurTable.Hm69Pts(), // TODO: untangle this vs cts.Mode
		Mode: ctr.RoundMode,
		Count: 0,
		ChargesConsumed: 0,
	});

	while (true) {
		let { r, ok } = req.Pts.Select(roleOrder)
		if (!ok) {
			break
		}

		let wave = ctr.Next()
		let pts = Mode.Pts(item.Mode.Mode, wave, r)
		if (req.Charges > 0) {
			pts *= 2
			req.Charges -= chargesPerWave[wave]
			item.ChargesConsumed += chargesPerWave[wave]
		}

		req.AddPts(r, pts)
		item.AddPtsWave(r, pts)
	}

	item.Count = ctr.Count
	item.SpareWaves = ctr.SpareWaves()

	return item
}

export function calcBxpRounds(req: Request, ctr: WaveCounter): OrderItem {
	if (req.Bxp.Empty() || req.Ironman) {
		return new OrderItem()
	}
	let item = new OrderItem({
		Kind: OrderItemKind.Bxp,
		PriceDur: LeechPriceDurTable.Hm69Bxp(), // TODO: untangle this vs cts.Mode
		Mode: ctr.RoundMode,
		Count: 0,
		Roles: new RoleSet(Role.Collector),
	})

	while (true) {
		let { s, ok } = req.Bxp.Select()
		if (!ok) {
			break
		}

		let wave = ctr.Next()
		let waveXp = Mode.Bxp(item.Mode.Mode, wave, s)

		req.AddBxp(s, waveXp)
		item.AddBxpWave(s, waveXp)
	}

	item.Count = ctr.Count
	item.SpareWaves = ctr.SpareWaves()

	return item
}

export function calcIMRounds(input: Request, needsKings: number): { item19: OrderItem, item69: OrderItem } {
	let n = 0 // allow tickets to be consumed
	let n19 = 0;
	let n69 = 0;

	while (true) {
		let req = input.clone();

		{
			let kingCompensation = 0
			if (needsKings > 0) {
				kingCompensation = needsKings - 1 //we'll be on wave 9 by the end, so free king
			}
			let ctr = new WaveCounter(Hm1_9)
			for (let wave = ctr.Next(); ctr.Count <= n + kingCompensation && !req.Pts.Empty(); wave = ctr.Next()) {
				let { r, ok } = req.Pts.Select(RoleOrder.Standard)
				if (!ok) {
					break
				}

				let pts = Mode.Pts(Mode.HM, wave, r)
				if (req.Charges > 0) {
					pts *= 2
					req.Charges -= chargesPerWave[wave]
				}

				req.AddPts(r, pts)
				n19 = ctr.Count
			}
		}

		{
			let ctr = new WaveCounter(Hm6_9)
			for (let wave = ctr.Next(); ctr.Count <= n + req.Hm10Tickets && !req.Pts.Empty(); wave = ctr.Next()) {
				let { r, ok } = req.Pts.Select(RoleOrder.Standard)
				if (!ok) {
					break
				}

				let pts = Mode.Pts(Mode.HM, wave, r)
				if (req.Charges > 0) {
					pts *= 2
					req.Charges -= chargesPerWave[wave]
				}

				req.AddPts(r, pts)
				n69 = ctr.Count
			}
		}

		if (!req.Pts.Empty()) {
			n++
			continue
		}

		// 1-9s
		let item19 = new OrderItem({
			Kind: OrderItemKind.Points,
			PriceDur: LeechPriceDurTable.Ironman19(),
			Mode: Hm1_9,
			Count: n19,
		})

		for (let i = 0; i < n19; i++) {
			let spare = 0
			for (let wave = 1; wave < 10; wave++) {
				let { r, ok } = input.Pts.Select(RoleOrder.Standard)
				if (!ok) {
					break
				}

				let pts = Mode.Pts(item19.Mode.Mode, wave, r)
				if (input.Charges > 0) {
					pts *= 2
					input.Charges -= chargesPerWave[wave]
					item19.ChargesConsumed += chargesPerWave[wave]
				}

				input.AddPts(r, pts)
				item19.AddPtsWave(r, pts)
				spare = 9 - wave
			}
			item19.SpareWaves = spare
		}

		// 6-9s
		let item69 = new OrderItem({
			Kind: OrderItemKind.Points,
			PriceDur: LeechPriceDurTable.Hm69Pts(),
			Mode: Hm6_9,
			Count: n69,
		})

		for (let i = 0; i < n69; i++) {
			let spare = 0
			for (let wave = 6; wave < 10; wave++) {
				let { r, ok } = input.Pts.Select(RoleOrder.Standard)
				if (!ok) {
					break
				}

				let pts = Mode.Pts(item69.Mode.Mode, wave, r)
				if (input.Charges > 0) {
					pts *= 2
					input.Charges -= chargesPerWave[wave]
					item69.ChargesConsumed += chargesPerWave[wave]
				}

				input.AddPts(r, pts)
				item69.AddPtsWave(r, pts)
				spare = 9 - wave
			}
			item69.SpareWaves = spare
		}

		return { item19, item69 }

	}
}


export function calcQueens(req: Request): OrderItem {
	if (req.Queen <= 0) {
		return new OrderItem();
	}

	let item = new OrderItem({
		Mode: Nm1_10,
		PriceDur: LeechPriceDurTable.Queen(req.SoloNM),
		Kind: OrderItemKind.Queen,
		Count: req.Queen,
		Roles: new RoleSet(),
	})

	// pre-add the secondary points for *all* queens
	{
		let secPts = nm10Secondary * req.Queen
		req.AddPtsAll(secPts, secPts, secPts, secPts)
		item.AddPtsAll(secPts, secPts, secPts, secPts)
	}

	let count = req.Queen
	while (req.Queen > 0) {
		let { r } = req.Pts.Select(RoleOrder.Reverse)

		let attacker = 0
		let defender = 0
		let healer = 0
		let collector = 0
		switch (r) {
			case Role.Attacker:
				attacker = nm10Primary - nm10Secondary
				break;
			case Role.Defender:
				defender = nm10Primary - nm10Secondary
				break;
			case Role.Healer:
				healer = nm10Primary - nm10Secondary
				break;
			case Role.Collector:
				collector = nm10Primary - nm10Secondary
				break;
		}

		req.AddPtsAll(attacker, defender, healer, collector)
		item.AddPtsWaveAll(r, attacker, defender, healer, collector)

		req.Queen--
		item.Queens++
	}

	while (count > 0) {
		for (let wave = 9; wave > 0; wave--) {
			let { r } = req.Pts.Select(RoleOrder.Reverse)

			let pts = Mode.Pts(item.Mode.Mode, wave, r)

			req.AddPts(r, pts)
			item.AddPtsWave(r, pts)
		}
		count--
	}

	return item
}

export function calcKings(req: Request): OrderItem {
	if (req.King <= 0) {
		return new OrderItem();
	}
	{
		let { item, finishedPts, finishedBxp } = doKing(req.clone(), false)
		if (finishedPts && finishedBxp) {
			return item
		}
	}
	let { item } = doKing(req.clone(), true)
	return item
}

function doKing(input: Request, useCharges: boolean): { item: OrderItem, finishedPts: boolean, finishedBxp: boolean } {
	let ptsKings = 0

	if (input.Bxp.Empty()) {
		ptsKings = input.King
	} else if (input.Pts.Empty() && !input.Bxp.Empty()) {
		ptsKings = 0
	} else {
		for (let npts = input.King; npts > 0; npts--) {
			let req = input.clone()
			ptsKings = 0
			let charges = req.Charges // don't consume charges yet, but do keep track of em
			let bxp = input.King - npts

			// deduct the secondary pts from 0 to n
			for (let j = 0; j < npts; j++) {
				let pts = hm10Secondary
				if (useCharges && charges >= chargesPerWave[10]) {
					pts *= 2
					charges -= chargesPerWave[10]
				}

				req.AddPtsAll(pts, pts, pts, pts)
			}

			// do pts Kings
			for (let j = 0; j < npts; j++) {
				let { r } = req.Pts.Select(RoleOrder.Reverse)

				let primary = hm10Primary
				let secondary = hm10Secondary
				if (useCharges && req.Charges >= chargesPerWave[10]) {
					primary *= 2
					secondary *= 2
					req.Charges -= chargesPerWave[10]
				}

				let attacker = 0
				let defender = 0
				let healer = 0
				let collector = 0
				switch (r) {
					case Role.Attacker:
						attacker = primary - secondary // we assumed earlier leech would earn secondary pts in all roles
						break;
					case Role.Defender:
						defender = primary - secondary // we assumed earlier leech would earn secondary pts in all roles
						break;
					case Role.Healer:
						healer = primary - secondary // we assumed earlier leech would earn secondary pts in all roles
						break;
					case Role.Collector:
						collector = primary - secondary // we assumed earlier leech would earn secondary pts in all roles
						break;
				}

				req.AddPtsAll(attacker, defender, healer, collector)
			}

			// do bxp Kings
			for (let j = 0; j < bxp; j++) {
				let { s } = req.Bxp.Select()
				let waveXp = Mode.Bxp(Hm10.Mode, 10, s)
				req.AddBxp(s, waveXp)
			}

			ptsKings = npts
			if (req.Pts.Empty() && req.Bxp.Empty()) {
				break
			}

			// no pts/bxp combination that can satisfy both, choose pts
			if (npts == 1 && (!req.Pts.Empty() || !req.Bxp.Empty())) {
				ptsKings = req.King
			}
		}
	}

	// do the actual kings
	let item = new OrderItem({
		Mode: Hm10,
		PriceDur: LeechPriceDurTable.King(input.SoloKing),
		Kind: OrderItemKind.King,
		Count: input.King,
		Roles: new RoleSet(),
	})

	// pre-add the secondary points for ptsKings
	{
		let charges = input.Charges
		for (let i = 0; i < ptsKings; i++) {
			let pts = hm10Secondary
			if (useCharges && charges >= chargesPerWave[10]) {
				pts *= 2
				charges -= chargesPerWave[10]
			}

			input.AddPtsAll(pts, pts, pts, pts)
			item.AddPtsAll(pts, pts, pts, pts)
		}
	}

	for (let i = 0; i < input.King; i++) {
		let { r: role, ok: roleOk } = input.Pts.Select(RoleOrder.Reverse)
		let { s: skill, ok: skillOk } = input.Bxp.Select();
		if (i < ptsKings) {
			let primary = hm10Primary
			let secondary = hm10Secondary
			if (useCharges && input.Charges >= chargesPerWave[10]) {
				primary *= 2
				secondary *= 2
				input.Charges -= chargesPerWave[10]
				item.ChargesConsumed += chargesPerWave[10]
			}

			let attacker = 0
			let defender = 0
			let healer = 0
			let collector = 0
			switch (role) {
				case Role.Attacker:
					attacker = primary - secondary
					break;
				case Role.Defender:
					defender = primary - secondary
					break;
				case Role.Healer:
					healer = primary - secondary
					break;
				case Role.Collector:
					collector = primary - secondary
					break;
			}

			input.AddPtsAll(attacker, defender, healer, collector)
			item.AddPtsWaveAll(role, attacker, defender, healer, collector)

			item.Kings++
		} else if (skillOk) {
			let waveXp = Mode.Bxp(Hm10.Mode, 10, skill)
			input.AddBxp(skill, waveXp)
			item.AddBxpWave(skill, waveXp)
			item.Kings++
		} else {
			input.AddPtsAll(hm10Secondary, hm10Secondary, hm10Secondary, hm10Primary)
			item.AddPtsWaveAll(Role.Collector, hm10Secondary, hm10Secondary, hm10Secondary, hm10Primary)
			item.Kings++
		}
	}

	return { item: item, finishedPts: input.Pts.Empty(), finishedBxp: input.Bxp.Empty() }
}

function calcRound(req: Request, mode: RoundMode, roleOrder: RoleOrder): OrderItem {
	let item = new OrderItem({
		Mode: mode,
		Count: 1,
		ChargesConsumed: 0,
		Roles: new RoleSet(),
	})

	let useCharges = !req.Pts.Empty()
	let addPts = function (role: Role, wave: number) {
		let pts = Mode.Pts(item.Mode.Mode, wave, role)
		if (useCharges && req.Charges > 0) {
			pts *= 2
			req.Charges -= chargesPerWave[wave]
			item.ChargesConsumed += chargesPerWave[wave]
		}

		req.AddPts(role, pts)
		item.AddPtsWave(role, pts)
	}

	let addXp = function (skill: Skill, wave: number) {
		let waveXp = Mode.Bxp(item.Mode.Mode, wave, skill)
		req.AddBxp(skill, waveXp)
		item.AddBxpWave(skill, waveXp)
	}

	for (let wave = item.Mode.Start; wave <= item.Mode.End; wave++) {
		let { r: role, ok: roleOk } = req.Pts.Select(roleOrder)
		let { s: skill, ok: skillOk } = req.Bxp.Select()
		if (roleOk) {
			addPts(role, wave)
		} else if (skillOk && !req.Ironman) {
			addXp(skill, wave)
		} else {
			addPts(Role.Collector, wave)
		}
	}

	return item
}

// Process processes a request and returns an order that fulfills it.
//
// It will return an error if the request isn't valid.
export function Process(input: Request): { order: Order, error: Error } {
	console.log("@@process", input)
	let req = input.clone()

	// has at least 1 thing to do
	let err = req.Valid()
	if (err) {
		return { order: new Order(), error: err }
	}

	let order = new Order()

	// hmunlock
	// 	needs pts and progress none
	// 	needs xp and progress none
	// 	needs kings and progress none
	// 	needs queens and progress none
	if (req.Progress == Progress.NM1 && req.Queen == 0) {
		req.Queen++
	}

	// do queens
	let queenItem = calcQueens(req.clone())
	order.Add(queenItem)
	req.Update(queenItem)
	if (queenItem.Count > 0 && req.Progress == Progress.NM1) {
		req.Progress = Progress.HM1
	}

	// do kings
	let kingItem = calcKings(req)
	req.Update(kingItem)

	// wave10unlock
	// 	needs pts and progress hm1
	// 	needs xp and progress hm1
	// 	needs kings and progress hm1 or hm6
	{
		let isHM1 = req.Progress == Progress.HM1
		let isHM6 = req.Progress == Progress.HM6
		let needsPts = !req.Pts.Empty()
		let needsXp = !req.Bxp.Empty()
		let needsKing = input.King > 0

		if ((isHM1 && (needsPts || needsXp || needsKing)) || (isHM6 && needsKing)) {
			let mode: RoundMode;
			let priceDur: LeechPriceDur;
			if (isHM1) {
				mode = Hm1_9
				priceDur = LeechPriceDurTable.HmUnlock();
			} else if (isHM6 && needsKing) {
				mode = Hm6_9
				priceDur = LeechPriceDurTable.HmUnlock69();
			}

			let item = calcRound(req.clone(), mode, RoleOrder.Standard)
			item.Kind = OrderItemKind.HM10Unlock
			item.PriceDur = priceDur

			req.Progress = Progress.HM10
			req.Update(item)
			order.Add(item)
			req.Hm10Tickets++
		}
	}

	// handle pts and bxp
	{
		let isOn9 = false

		if (req.Ironman && !req.Pts.Empty()) {
			let { item19, item69 } = calcIMRounds(req.clone(), input.King)
			if (item19.Count > 0) {
				req.Update(item19)
				order.Add(item19)
			}
			if (item69.Count > 0) {
				req.Update(item69)
				order.Add(item69)
			}
			req.Hm10Tickets -= item69.Count - item19.Count
			isOn9 = true
		}

		let ctr = new WaveCounter(Hm6_9)
		if (!req.Pts.Empty()) {
			let item = calcPointsRounds(req.clone(), ctr, RoleOrder.Standard)
			req.Update(item)
			order.Add(item)
			isOn9 = true
		}
		ctr.Count = 0
		if (!req.Bxp.Empty()) {
			let item = calcBxpRounds(req.clone(), ctr)
			req.Update(item)
			order.Add(item)
			isOn9 = true
		}

		if (kingItem.Count > 0 && isOn9) {
			req.Hm10Tickets++
		}
	}

	// tickets
	req.Hm10Tickets -= kingItem.Count
	let tickets = new OrderItem({
		Kind: OrderItemKind.Ticket,
		PriceDur: LeechPriceDurTable.Ironman19(),
		Mode: Hm1_9,
	})
	while (req.Ironman && req.Hm10Tickets < 0) {
		let item = calcRound(req.clone(), Hm1_9, RoleOrder.Standard)
		item.Kind = OrderItemKind.Ticket
		item.PriceDur = LeechPriceDurTable.Ironman19()

		let { result } = tickets.Merge(item)
		tickets = result
		req.Hm10Tickets++
	}

	req.Update(tickets)
	order.Add(tickets)
	order.Add(kingItem)

	order.Request = req

	return { order: order, error: undefined }
}