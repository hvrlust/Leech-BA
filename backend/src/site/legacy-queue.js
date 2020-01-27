const BOT_UID = 2;

function process(req, database, adminChannel, queueChannel) {
	const data = req.body;
	if(data['xp_rsn']) {
		processQueueReq({
			subject: 'xp',
			text: {
				rsn: data['xp_rsn'],
				skill: data['xp_skill'],
				level: data['xp_level'],
				ba: data['xp_ba'],
				amount: data['xp_amount'],
			},
		}, database, adminChannel, queueChannel);

	} else if(data['points_rsn']) {
        processQueueReq({
			subject: 'item',
			text: {
				rsn: data['points_rsn'],
				preset: data['preset'],
				ba: data['points_ba'],
				alevel: parseInt(data['alevel'], 10),
				dlevel: parseInt(data['dlevel'], 10),
				hlevel: parseInt(data['hlevel'], 10),
				clevel: parseInt(data['clevel'], 10),
				apoints: parseInt(data['apoints'], 10),
				dpoints: parseInt(data['dpoints'], 10),
				hpoints: parseInt(data['hpoints'], 10),
				cpoints: parseInt(data['cpoints'], 10),
				want_alevel: parseInt(data['want_alevel'], 10),
				want_dlevel: parseInt(data['want_dlevel'], 10),
				want_hlevel: parseInt(data['want_hlevel'], 10),
				want_clevel: parseInt(data['want_clevel'], 10),
				want_apoints: parseInt(data['want_apoints'], 10),
				want_dpoints: parseInt(data['want_dpoints'], 10),
				want_hpoints: parseInt(data['want_hpoints'], 10),
				want_cpoints: parseInt(data['want_cpoints'], 10),
				enhancer: parseInt(data['enhancer'], 10),
				ironman: data['ironman'],
				kingkills: parseInt(data['kingskilled'], 10),
			},
		}, database, adminChannel, queueChannel);
	}
	return true;
}

async function processQueueReq(mail, database, adminChannel, queueChannel) {
	console.log("processQueueReq", mail);
    //var channel = this.bot.channels.find("name", this.queueChannel);
    var month = ('0' + (new Date().getMonth() + 1)).slice(-2);
    var date = ('0' + new Date().getDate()).slice(-2);
    var message = "";
    if (mail.subject == "admin-test") {
        adminChannel.send("Request acknowledged and received.\nMessage: " + mail.text);
        return;
    }

    // XP REQUEST =================================================================================================================================================
    if (mail.subject == "xp") {
        var data = mail.text;
        //filter ba
        var ba = "(NM1)";
        switch (data.ba) {
            case "none":
                ba = "(NM1)";
                break;
            case "queen":
                ba = "(HM1)";
                break;
            case "hardmode":
                ba = "(HM6)";
                break;
            default:
                ba = "(HM10)";
                break;
        }
        var amount = parseInt(data.amount.split(',').join(''));
        if (amount > 0 && data.rsn) {
            amount = nFormatter(amount, 2);
            var rsn_bxp = data.rsn;
            var s0 = "RSN: " + data.rsn + "\nLeech: BXP\nSkill: " + data.skill + "\nLevel: " + data.level + "\nAmount: " + data.amount + "\nBA completed up to: " + ba + "\n\n\n";
            var s1 = "Summary: \n" + date + "/" + month + ": " + rsn_bxp + " - " + amount + " " + data.skill + " bxp " + ba + "\n\n";
            var s2 = "";

            const status = await database.newCustomer(BOT_UID, { // TODO: create bot user
                date: new Date(),
                rsn: data.rsn,
                ba: ba.replace(/[()]/g, ""),
                services: {
                    bxp: {
                        [data.skill]: data.amount.split(',').join(''),
                    },
                },
                notes: "(unconfirmed)", //TODO: confirmed field
            });

            if (typeof status != "number") { //TODO: is it really an number or a str?
                s2 = "Status: " + status;
            } else {
                s2 = "Status: Inserted into queue, please confirm (and remove the unconfirmed note)";
            }

            message = "```"+ s0 + s1 + s2 + "```";
            queueChannel.send(message).then(m => m.pin()).catch(console.error);
        }
        return;
    }

    // ITEM REQUEST =================================================================================================================================================
    if (mail.subject == "item") {
        var data = mail.text;
        var ba = "(NM1)";
        var current = "";
        var need = "";
        var net = "";
        var n = "";
        var enhancer = "";
        var ironman = "";
        var needA = 0;
        var needD = 0;
        var needH = 0;
        var needC = 0;

        switch (data.ba) {
            case "none":
                ba = " (NM1)";
                break;
            case "queen":
                ba = " (HM1)";
                break;
            case "hardmode":
                ba = " (HM6)";
                break;
            default:
                ba = " (HM10)";
                break;
        }
        var leech = data.preset;
        var king = "";
        var leech_simple = data.preset;
        var insignia = false;

        if (leech == "levels") {
            leech = "points";
            leech_simple = leech;
        }
        //calculate relevant information of want and needs
        var attlvl = data.alevel;
        var collvl = data.clevel;
        var heallvl = data.hlevel;
        var deflvl = data.dlevel;

        var att = data.apoints;
        var col = data.cpoints;
        var heal = data.hpoints;
        var def = data.dpoints;

        var want_attlvl = data.want_alevel;
        var want_collvl = data.want_clevel;
        var want_heallvl = data.want_hlevel;
        var want_deflvl = data.want_dlevel;

        var want_att = data.want_apoints;
        var want_col = data.want_cpoints;
        var want_heal = data.want_hpoints;
        var want_def = data.want_dpoints;


        //if appropriate
        //convert all into points
        const leveldifference = [0, 200, 300, 400, 500, 0];
        for (i = attlvl; i < want_attlvl; i++) {
            needA = needA + leveldifference[i];
        }
        for (i = collvl; i < want_collvl; i++) {
            needC = needC + leveldifference[i];
        }
        for (i = heallvl; i < want_heallvl; i++) {
            needH = needH + leveldifference[i];
        }
        for (i = deflvl; i < want_deflvl; i++) {
            needD = needD + leveldifference[i];
        }
        needA = needA - att + want_att;
        needC = needC - col + want_col;
        needD = needD - def + want_def;
        needH = needH - heal + want_heal;

        if (needA > 0 || needC > 0 || needD > 0 || needH > 0) {
            current = "Current: ";
            need = "Needs: ";
            net = "Net: ";

            current += "A[L" + attlvl + "," + att + "] ";
            current += "C[L" + collvl + "," + col + "] ";
            current += "D[L" + deflvl + "," + def + "] ";
            current += "H[L" + heallvl + "," + heal + "] ";

            need += "A[L" + want_attlvl + "," + want_att + "] ";
            need += "C[L" + want_collvl + "," + want_col + "] ";
            need += "D[L" + want_deflvl + "," + want_def + "] ";
            need += "H[L" + want_heallvl + "," + want_heal + "] ";
            //@@@@
            var needs = [];
            if (needA > 0) {
                needs.push(needA + " att");
            }
            if (needC > 0) {
                needs.push(needC + " col");
            }
            if (needD > 0) {
                needs.push(needD + " def");
            }
            if (needH > 0) {
                needs.push(needH + " heal");
            }
            n = needs.join(" + ");

            current += "\n";
            need += "\n";
            net += n + "\n";
            // n = n.replace("att", ":BA_A:");
            // n = n.replace("def", ":BA_D:");
            // n = n.replace("heal", ":BA_H:");
            // n = n.replace("col", " :BA_C:");
            if (!insignia) {
                leech_simple = n;
            }
            if (data.enhancer > 0)
                enhancer = " (" + data.enhancer + " charges)"
        }

        var kingsneeded;
        if (leech.includes("insignia")) {
            var temp = leech.split("_");
            var points = n;
            //calculate amount of kings
            var kingpoints = 0;
            if (data.ba == "hardmode")
                ba = " (HM10)";

            kingskilled = data.kingkills;
            kingsneeded = 5 - kingskilled;
            var points = "";
            var role = "";
            insignia = true;
            switch (temp[1]) {
                case 'A':
                    leech = "Attacker's insignia";
                    leech_simple = ":BA_A: Insignia";
                    points = needA;
                    role = ":BA_A:";
                    break;
                case 'C':
                    leech = "Collector's insignia";
                    leech_simple = ":BA_C: Insignia";
                    points = needC;
                    role = ":BA_C:";
                    break;
                case 'D':
                    leech = "Defender's insignia";
                    leech_simple = ":BA_D: Insignia";
                    points = needD;
                    role = ":BA_D:";
                    break;
                case 'H':
                    leech = "Healer's insignia";
                    leech_simple = ":BA_H: Insignia";
                    points = needH;
                    role = ":BA_H:";
                    break;
            }
            if (kingsneeded > 0) {
                //work out how many kings as role
                var kingsasrole = 0;
                for (var i = kingsneeded; i > 0; i--) {
                    if (points < 0) break;
                    points -= 210;
                    kingsasrole++;
                    kingsneeded--;
                }
                leech += "/" + (kingsneeded + kingsasrole) + " king kills ";
                leech_simple += ": " + kingsasrole;
                if (kingsasrole > 1) {
                    leech_simple += " kings as " + role;
                } else {
                    leech_simple += " king as " + role;
                }
                if (kingsneeded > 0) {
                    if (kingsneeded > 1) {
                        leech_simple += " + " + kingsneeded + " kings as any";
                    } else {
                        leech_simple += " + " + kingsneeded + " king as any";
                    }
                }
                if (points > 0) leech_simple += " + " + points + " " + role + " ";
            }
        }

        if (leech == "king") {
            kingsneeded = 1;
        }

        var ironsimple = "";
        if (data.ironman == "yes") {
            ironman = "Ironman: yes\n";
            ironsimple = " (Ironman)";
        }

        //end of relevancy
        var s0 = "RSN: " + data.rsn + "\nLeech: " + leech + "\n";
        s0 += current;
        s0 += need;
        s0 += net;
        s0 += ironman;
        if (data.enhancer > 0) s0 += "Enhancer charges:" + enhancer.replace(/[{()}]/g, '') + "\n";
        s0 += "BA completed up to:" + ba.replace(/[{()}]/g, '') + "\n";
        s0 += "\n\n";
        var s1 = "Summary: \n" + date + "/" + month + ": " + data.rsn + " - " + leech_simple + ironsimple + enhancer + ba + "\n\n";
        var s2 = "";

        var notes = ["(unconfirmed)"];
        if (data.ironman == "yes") {
            notes.push("IM");
        }
        if (data.enhancer > 0) {
            notes.push(enhancer.replace(/[{()}]/g, ''));
        }

        const status = await database.newCustomer(BOT_UID, { // TODO: create bot user
            date: new Date(),
            rsn: data.rsn,
            ba: ba.replace(/[()]/g, ""),
            services: {
                points: {
                    attack: needA,		//TODO: not sure how the FE copes with 0 amounts
                    collector: needC,	//TODO: not sure how the FE copes with 0 amounts
                    healer: needH,		//TODO: not sure how the FE copes with 0 amounts
                    defender: needD,	//TODO: not sure how the FE copes with 0 amounts
                },
                king: kingsneeded,
            },
            notes: notes.join("; "), //TODO: confirmed field
        });

        if (typeof status != "number") { //TODO: is it really an number or a str?
            s2 = "Status: " + status;
        } else {
            s2 = "Status: Inserted into queue, please confirm"
        }

        message = "```"+ s0 + s1 + s2 + "```";
        queueChannel.send(message).then(m => m.pin()).catch(console.error);
        return;
    }

    // TRIAL REQUEST =================================================================================================================================================
    if (mail.subject == "trial") {
        var data = mail.text;
        var message = "```";
        message += "RSN: " + data.rsn + "\n";
        message += "Trialled before: " + data.before + "\n";
        message += "Timezone: GMT" + data.timezone + "\n";
        message += "Will guest in cc: " + data.guest + "\n";

        var roles = (data.roles.replace("[", "").replace("]", "")).split(",");
        message += "Roles: ";
        for (var i = 0; i < roles.length - 1; i++) {
            message += roles[i] + " ";
            if (roles.length - 2 > i) {
                message += "| ";
            }
            //Do something
        }
        message += "\n";
        message += "```";
        message += "Link to stats: http://services.runescape.com/m=hiscore/compare?user1=" + (data.rsn).replace(/\s/g, "%20");
        queueChannel.guild.channels.find("name", "trials").send(message);
    }
}

function nFormatter(num, digits) {
	var si = [
		{ value: 1E18, symbol: "E" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E9, symbol: "G" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E3, symbol: "k" }
	], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
	for (i = 0; i < si.length; i++) {
		if (num >= si[i].value) {
			return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
		}
	}
	return num.toFixed(digits).replace(rx, "$1");
}

module.exports = {
	process
};