function process(req, database, getQueueChannel) {
    const data = req.body;
    if (data['xp_rsn']) {
        return getQueueChannel().then(queueChannel => processQueueReq({
            subject: 'xp',
            text: {
                rsn: data['xp_rsn'],
                skill: data['xp_skill'],
                level: data['xp_level'],
                ba: data['xp_ba'],
                amount: data['xp_amount'],
            },
        }, database, queueChannel));

    } else if (data['points_rsn']) {
        return getQueueChannel().then(queueChannel => processQueueReq({
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
        }, database, queueChannel));
    }
    return Promise.reject(false);
}

async function processQueueReq(mail, database, queueChannel) {
    let month = ('0' + (new Date().getMonth() + 1)).slice(-2);
    let date = ('0' + new Date().getDate()).slice(-2);

    // XP REQUEST =================================================================================================================================================
    if (mail.subject === "xp") {
        let data = mail.text;
        //filter ba
        let ba;
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
        let amount = parseInt(data.amount.split(',').join(''));
        if (amount <= 0 || !data.rsn) {
            return Promise.reject(false);
        }

        amount = nFormatter(amount, 2);
        let rsn_bxp = data.rsn;
        let s0 = "RSN: " + data.rsn + "\nLeech: BXP\nSkill: " + data.skill + "\nLevel: " + data.level + "\nAmount: " + data.amount + "\nBA completed up to: " + ba + "\n\n\n";
        let s1 = "Summary: \n" + date + "/" + month + ": " + rsn_bxp + " - " + amount + " " + data.skill + " bxp " + ba + "\n\n";

        return queueChannel.send("```" + s0 + s1 + "```")
            .then(m => m.pin())
            .catch(e => console.log("unable to send request to channel " + e));
    }

    // ITEM REQUEST =================================================================================================================================================
    if (mail.subject === "item") {
        let data = mail.text;
        let ba;
        let current = "";
        let need = "";
        let net = "";
        let n = "";
        let enhancer = "";
        let ironman = "";
        let needA = 0;
        let needD = 0;
        let needH = 0;
        let needC = 0;

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
        let leech = data.preset;
        let leech_simple = data.preset;
        let insignia = false;

        if (leech === "levels") {
            leech = "points";
            leech_simple = leech;
        }

        //calculate relevant information of want and needs
        let attlvl = data.alevel;
        let collvl = data.clevel;
        let heallvl = data.hlevel;
        let deflvl = data.dlevel;

        let att = data.apoints;
        let col = data.cpoints;
        let heal = data.hpoints;
        let def = data.dpoints;

        let want_attlvl = data.want_alevel;
        let want_collvl = data.want_clevel;
        let want_heallvl = data.want_hlevel;
        let want_deflvl = data.want_dlevel;

        let want_att = data.want_apoints;
        let want_col = data.want_cpoints;
        let want_heal = data.want_hpoints;
        let want_def = data.want_dpoints;


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

            let needs = [];
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

            if (!insignia) {
                leech_simple = n;
            }
            if (data.enhancer > 0)
                enhancer = " (" + data.enhancer + " charges)"
        }

        if (leech.includes("insignia")) {
            let temp = leech.split("_");

            //calculate amount of kings
            if (data.ba === "hardmode")
                ba = " (HM10)";

            let kingskilled = data.kingkills;
            let kingsneeded = 5 - kingskilled;
            let points = "";
            let role = "";
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
                let kingsasrole = 0;
                for (let i = kingsneeded; i > 0; i--) {
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

        let ironsimple = "";
        if (data.ironman === "yes") {
            ironman = "Ironman: yes\n";
            ironsimple = " (Ironman)";
        }

        let s0 = "RSN: " + data.rsn + "\nLeech: " + leech + "\n";
        s0 += current;
        s0 += need;
        s0 += net;
        s0 += ironman;
        if (data.enhancer > 0) s0 += "Enhancer charges:" + enhancer.replace(/[{()}]/g, '') + "\n";
        s0 += "BA completed up to:" + ba.replace(/[{()}]/g, '') + "\n";
        s0 += "\n\n";

        let s1 = "Summary: \n" + date + "/" + month + ": " + data.rsn + " - " + leech_simple + ironsimple + enhancer + ba + "\n\n";
        return queueChannel.send("```" + s0 + s1 + "```")
            .then(m => m.pin());
    }

    return Promise.reject(false);
}

function nFormatter(num, digits) {
    let si = [
        {value: 1E18, symbol: "E"},
        {value: 1E15, symbol: "P"},
        {value: 1E12, symbol: "T"},
        {value: 1E9, symbol: "G"},
        {value: 1E6, symbol: "M"},
        {value: 1E3, symbol: "k"}
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