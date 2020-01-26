const send = require('gmail-send')({
	user: 'leechba1@gmail.com',
	pass: 'shadowsucks',
	to:   'leechba1@gmail.com',
	from: 'leechbasite',
	subject: 'test subject',
	text:    'gmail-send example 1',         // Plain text
});

function process(req) {
	const data = req.body;
	if(data['xp_rsn']) {
		const text = `{"rsn": "${data['xp_rsn']}", "skill": "${data['xp_skill']}", "level": "${data['xp_level']}", "ba": "${data['xp_ba']}", "amount": "${data['xp_amount']}"}`;
		sendEmail('xp', text);
	} else if(data['points_rsn']) {
        const text =
			`{"rsn": "${data['points_rsn']}", "preset": "${data['preset']}", "ba": "${data['points_ba']}", "alevel": ${data['alevel']}, "dlevel": ${data['dlevel']}, "hlevel": ${data['hlevel']}, "clevel": ${data['clevel']}, "apoints": ${data['apoints']}, "dpoints": "${data['dpoints']}", "hpoints": ${data['hpoints']}, "cpoints": ${data['cpoints']}, "want_alevel": ${data['want_alevel']}, "want_dlevel": ${data['want_dlevel']}, "want_hlevel": ${data['want_hlevel']}, "want_clevel": "${data['want_clevel']}", "want_apoints": ${data['want_apoints']}, "want_dpoints": ${data['want_dpoints']}, "want_hpoints": ${data['want_hpoints']}, "want_cpoints": ${data['want_cpoints']}, "enhancer": "${data['enhancer']}", "ironman": "${data['ironman']}", "kingkills": "${data['kingskilled']}"}`;
		sendEmail('item',text);
	}
	return true;
}

function sendEmail(subject, body) {
	send({
		subject: subject,
		text: body
	}, function (err, res) {
		if (err) {
			console.log('error sending email');
		}
	});
}

module.exports = {
	process
};