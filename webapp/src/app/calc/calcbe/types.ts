import { hmPts, hmXp, nmPts, nmXp } from "./rates"

// Progress represents a player's progress in BA.
export enum Progress {
	NM1 = 1,
	HM1,
	HM6,
	HM10,
}

// Role represents a role in BA.
export enum Role {
	Attacker = 0,
	Defender,
	Healer,
	Collector,
}

export namespace Role {
	export function ShortString(r: Role) {
		switch (r) {
			case Role.Attacker:
				return 'A'
			case Role.Defender:
				return 'D'
			case Role.Healer:
				return 'H'
			case Role.Collector:
				return 'C'
		}
		return ''
	}
}

// Skill represents a skill in BA.
export enum Skill {
	Agility = 0,
	Firemaking,
	Mining,
}

// Mode represents the BA mode (either NM or HM).
export enum Mode {
	NM = 1,
	HM,
}

export namespace Mode {
	export function String(v: Mode): string {
		switch (v) {
			case Mode.NM:
				return "NM";
			case Mode.HM:
				return "HM";
		}
	}

	// Bxp returns the Xp value for a given wave and Skill, assuming lvl 99.
	//
	// If wave is <= 0 or > 10 it panics.
	export function Bxp(m: Mode, wave: number, skill: Skill): number {
		if (wave <= 0 || wave > 10) {
			throw new Error("lba: invalid wave value")
		}

		switch (m) {
			case Mode.NM:
				return nmXp[wave][skill]
			case Mode.HM:
				return hmXp[wave][skill]
			default:
				throw new Error("lba: unsupported mode")
		}
	}

	// Pts returns the pts value for a given wave and role.
	//
	// It will panic if wave is invalid (not 1-9 inclusive) or if mode is invalid.
	export function Pts(m: Mode, wave: number, role: Role): number {
		if (wave < 1 || wave > 9) {
			throw new Error("lba: invalid wave value")
		}
		switch (m) {
			case Mode.NM:
				return nmPts[wave][role]
			case Mode.HM:
				return hmPts[wave][role]
			default:
				throw new Error("lba: unsupported mode")
		}
	}
}

// RoleOrder represents the role order to be used.
export enum RoleOrder {
	// StandardOrder A,D,H,C
	Standard = 0,
	// ReverseOrder C,H,D,A
	Reverse,
}

// PtsCounter keeps track of pts for each role.
export class PtsCounter {
	public Attacker = 0;
	public Defender = 0;
	public Healer = 0;
	public Collector = 0;

	constructor(v?: {
		Attacker?: number;
		Defender?: number;
		Healer?: number;
		Collector?: number;
	}) {
		this.Attacker = (v && v.Attacker) || 0;
		this.Defender = (v && v.Defender) || 0;
		this.Healer = (v && v.Healer) || 0;
		this.Collector = (v && v.Collector) || 0;
	}

	// Select will return the next eligible role to earn pts on.
	// If no such role is found, it returns 0 and false.
	Select(order: RoleOrder): { r: Role, ok: boolean } {
		switch (order) {
			case RoleOrder.Standard:
				if (this.Attacker > 0) {
					return { r: Role.Attacker, ok: true }
				} else if (this.Defender > 0) {
					return { r: Role.Defender, ok: true }
				} else if (this.Healer > 0) {
					return { r: Role.Healer, ok: true }
				} else if (this.Collector > 0) {
					return { r: Role.Collector, ok: true }
				} else {
					return { r: Role.Collector, ok: false }
				}
				break;
			case RoleOrder.Reverse:
				if (this.Collector > 0) {
					return { r: Role.Collector, ok: true }
				} else if (this.Healer > 0) {
					return { r: Role.Healer, ok: true }
				} else if (this.Defender > 0) {
					return { r: Role.Defender, ok: true }
				} else if (this.Attacker > 0) {
					return { r: Role.Attacker, ok: true }
				} else {
					return { r: Role.Collector, ok: false }
				}
				break;
			default:
				throw new Error("lba: unsupported role order")
		}
	}

	// Empty reports wether every value is <= 0 or not.
	Empty(): boolean {
		if (this.Attacker > 0) {
			return false
		}
		if (this.Defender > 0) {
			return false
		}
		if (this.Healer > 0) {
			return false
		}
		if (this.Collector > 0) {
			return false
		}
		return true
	}

	// Merge creates a new PtsCounter that combines the result of both.
	Merge(other: PtsCounter): PtsCounter {
		return new PtsCounter({
			Attacker: this.Attacker + other.Attacker,
			Defender: this.Defender + other.Defender,
			Healer: this.Healer + other.Healer,
			Collector: this.Collector + other.Collector,
		})
	}
}

// BxpCounter keeps track of bxp for each skill.
export class BxpCounter {
	Agility = 0;
	Firemaking = 0;
	Mining = 0;

	constructor(v?: {
		Agility?: number,
		Firemaking?: number,
		Mining?: number,
	}) {
		this.Agility = (v && v.Agility) || 0;
		this.Firemaking = (v && v.Firemaking) || 0;
		this.Mining = (v && v.Mining) || 0;
	}

	// Select will return the next eligible skill to earn bxp on.
	// If no such skill is found, it returns 0 and false.
	Select(): { s: Skill, ok: boolean } {
		if (this.Agility > 0) {
			return { s: Skill.Agility, ok: true }
		} else if (this.Firemaking > 0) {
			return { s: Skill.Firemaking, ok: true }
		} else if (this.Mining > 0) {
			return { s: Skill.Mining, ok: true }
		}

		return { s: 0, ok: false }
	}

	// Empty reports wether every value is <= 0 or not.
	Empty(): boolean {
		if (this.Agility > 0) {
			return false
		}
		if (this.Firemaking > 0) {
			return false
		}
		if (this.Mining > 0) {
			return false
		}
		return true
	}

	// Merge creates a new BxpCounter that combines the result of both.
	Merge(other: BxpCounter): BxpCounter {
		return new BxpCounter({
			Agility: this.Agility + other.Agility,
			Firemaking: this.Firemaking + other.Firemaking,
			Mining: this.Mining + other.Mining,
		})
	}
}


// RoleSet is a set of Role values.
//
// RoleSet is mutable.
export class RoleSet {
	data: Role[] = [];

	constructor(...roles: Role[]) {
		for (let i = 0; i < roles.length; i++) {
			this.Add(roles[i]);
		}
	}

	// Add adds the given role to the set.
	Add(role: Role) {
		for (let i = 0; i < this.data.length; i++) {
			if (role == this.data[i]) {
				return;
			}
		}

		this.data.push(role);
		return;
	}


	// Reverse reverses the order of the set.
	Reverse() {
		let reversed = this.data.reverse();
		for (let i = 0; i < this.data.length; i++) {
			this.data[i] = reversed[i];
		}
	}

	String(): string {
		if (this.data.length == 0) {
			return ""
		}

		let buf = "";
		for (let i = 0; i < this.data.length; i++) {
			let r = this.data[i];
			if (i > 0) {
				buf += ", ";
			}
			buf += Role.ShortString(r);
		}

		return buf;
	}


	// Merge creates a new RoleSet that combines the result of both.
	Merge(other: RoleSet): RoleSet {
		let ret = new RoleSet();
		for (let i = 0; i < this.data.length; i++) {
			ret.Add(this.data[i]);
		}
		for (let i = 0; i < other.data.length; i++) {
			ret.Add(other.data[i]);
		}
		return ret;
	}
}