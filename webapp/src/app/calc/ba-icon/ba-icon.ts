import { Component, Input } from '@angular/core';

@Component({
	selector: 'ba-icon',
	template: `
		<img width="100%" height="100%" src="{{ url }}" />
	`,
	styles: [`
		img{
			object-fit: cover;
			overflow: hidden;	
		}
	`],
})
export class BaIcon {
	@Input()
	public icon = ""

	public get url(): string {
		switch (this.icon) {
			case "agility": return "https://runescape.wiki/images/8/84/Agility-icon.png";
			case "firemaking": return "https://runescape.wiki/images/6/6d/Firemaking-icon.png";
			case "mining": return "https://runescape.wiki/images/2/28/Mining-icon.png";

			case "attacker": return "https://runescape.wiki/images/5/53/Barbarian_Assault_Attackers_hiscores.png";
			case "defender": return "https://runescape.wiki/images/a/a9/Barbarian_Assault_Defenders_hiscores.png";
			case "collector": return "https://runescape.wiki/images/f/f2/Barbarian_Assault_Collectors_hiscores.png";
			case "healer": return "https://runescape.wiki/images/8/8c/Barbarian_Assault_Healers_hiscores.png";

			case "hat": return "https://runescape.wiki/images/3/3f/Healer_hat.png";
			case "boots": return "https://runescape.wiki/images/6/6b/Runner_boots.png";
			case "gloves": return "https://runescape.wiki/images/3/34/Penance_gloves.png";
			case "torso": return "https://runescape.wiki/images/d/d5/Fighter_torso.png";
			case "skirt": return "https://runescape.wiki/images/1/1d/Penance_skirt.png";
			case "patch": return "https://runescape.wiki/images/7/7f/Barbarian_assault_armour_patch.png";
			case "trident": return "https://runescape.wiki/images/b/bf/Penance_trident.png";
			case "master_trident": return "https://runescape.wiki/images/3/30/Penance_master_trident.png";

			case "attacker_insignia": return "https://runescape.wiki/images/e/e3/Attacker%27s_insignia.png";
			case "defender_insignia": return "https://runescape.wiki/images/9/99/Defender%27s_insignia.png";
			case "collector_insignia": return "https://runescape.wiki/images/9/98/Collector%27s_insignia.png";
			case "healer_insignia": return "https://runescape.wiki/images/8/8c/Healer%27s_insignia.png";
			
			case "gp": return "https://runescape.wiki/images/3/30/Coins_10000.png";
		}
		return ""
	}
	constructor() { };
}