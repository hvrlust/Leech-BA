// Accepts a url and a callback function to run.
function requestCrossDomain(site, callback) {

  // If no url was passed, exit.
  if (!site) {
    alert('No site was passed.');
    return false;
  }

  $.get(site, callbackWrapper);

  function callbackWrapper(data) {
    // If we have something to work with...
    if (data) {
      // Strip out all script tags, for security reasons.
      // BE VERY CAREFUL. This helps, but we should do more.
      data = data.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

      data = data.replace(/[\r|\n]+/g, '');
      data = data.replace(/<--[\S\s]*?-->/g, '');
      data = data.replace(/<script.*\/>/, '');

      data = data.replace(/(<|&lt;)\/?[a-z]+\/?(>|&gt;)/gm, '');

      // If the user passed a callback, and it
      // is a function, call it, and send through the data var.
      if (typeof callback === 'function') {
        callback(data);
      }
    }
    // Else, Maybe we requested a site that doesn't exist, and nothing returned.
    else throw new Error('Nothing returned from getJSON.');
  }
}

//start of calculator
//price list, change this accordingly

const LINK = "/legacy/queue";

var QUEEN = 12000000;//1-10 2L
var PARTHM = 5000000;//6-9 2L
var FULLHM = 9000000;//1-9 2L (assuming other guy already has)
var KING = 15000000;
var SKILLER_KING = 18000000;
var POINTS_PART = 6500000; // 6-9 points
var IRON_POINTS = 12000000; // 1-9 iron
var FULL_HM_UNLOCK = 10000000; //1-9 not unlocked
var FULL_HM_ALREADY_UNLOCK = 7000000; // 1-9 already unlocked

//minigame weekends
var currentdate = new Date();
var startdate = new Date('12/15/2017');
var enddate = new Date('12/18/2017');
var minigameweekend = false;
var multiplier = 1; //minigameweekend multiplier

const QUEEN_T = 20;
const PARTHM_T = 10;
const FULLHM_T = 20;
const KING_T = 20;

//xp list - DO NOT CHANGE
const NMA = 102636;//normal mode agility xp
const NMF = 299355; //normal mode firemaking
const NMM = 119742; //normal mode mining

//base rates for each level @wave 1
const HMA = [0, 1143, 1147, 1150, 1154, 1157, 1161, 1165, 1169, 1172, 1176, 1176, 1176,//1-13
  1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176,//14-24
  1176, 1176, 1176, 1176, 1176, 1827, 1830, 1834, 1838, 1843, 1847, 1851,//25-36
  1831, 1901, 1971, 2041, 2111, 2181, 2251, 2321, 2391, 2461, 2531, 2601, 2671,//37-49
  3370, 3475, 3580, 3685, 3790, 5012, 5012, 5012, 5012, 5012, 5203, 5203,//50-61
  5203, 5203, 5203, 5357, 5457, 5557, 5657, 5756, 5856, 5911, 5965, 6020, 6074,//62-74
  6129, 6183, 6237, 6292, 6346, 6400, 6400, 6400, 6400, 6400, 7396, 7506, 7616,//75-87
  7725, 7835, 7944, 7944, 7944, 7944, 7944, 7944, 7944, 7991, 8054, 8116];
const HMF = [0, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144,//levels 1-14
  5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236,//15-29
  10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366,//30-41
  14032, 14032, 14032,//42-44
  15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284,//45-58
  15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284,//59-72
  15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284,//72-82
  21392, 21392, 21392, 21392, 21392, 21392, 21392, 21392, 21392,//83-91
  21392, 21392, 21392, 21392, 21392, 21392, 21392, 21392];//92-99
const HMM = 0; //1-9 mining

//Points/round - UPDATE IF NECESSARY
const NMATT = 250;//normal mode
const NMDEF = 250;
const NMHEAL = 250;
const NMCOL = 250;
const HMATT = 330;//1-9 hm
const HMDEF = 350;
const HMHEAL = 350;
const HMCOL = 300;
const PHMATT = 220; //6-9 hm
const PHMDEF = 251;
const PHMHEAL = 245;
const PHMCOL = 179;
const KINGP = 210; //points for a king
//DO NOT CHANGE

//minigame weekend changes
if (currentdate > startdate && currentdate < enddate) {
  minigameweekend = true;
  QUEEN = 15000000;
  PARTHM = 7500000;
  FULLHM = 13500000;
  KING = 18000000;
  multiplier = 2;
}

const leveldifference = [0, 200, 300, 400, 500, 0]; //0,1,2,3,4,5. if level 1, needs 200 to level up, etc. 5 needs 0
//unlock codes
//0 = never done ba
//1 = killed queen
//2 = unlocked w6
$(document).ready(function () {

  /*requestCrossDomain('http://services.runescape.com/m=itemdb_rs/api/graph/30915.json', function(results) {
											 $('#dev').html(results);
											 });*/
  //creating ui
  var main = $(document.createElement('div'));
  main.attr({id: "calculator-main"});
  var tab = $(document.createElement('ul'));
  tab.attr({id: "tab", class: "tab"});
  var xptab = $(document.createElement('li'));
  var xplink = $(document.createElement('a'));
  xplink.attr({id: "xptab", class: "tablinks", href: "javascript:void(0)", onclick: "openTab(event, 'XP')"});
  xplink.append("Bonus XP");
  xptab.append(xplink);
  var pointstab = $(document.createElement('li'));
  var pointslink = $(document.createElement('a'));
  pointslink.attr({
    id: "pointstab",
    class: "tablinks",
    href: "javascript:void(0)",
    onclick: "openTab(event, 'Points')"
  });
  pointslink.append("Levels, Points & Misc. Calculator");
  pointstab.append(pointslink);
  var infotab = $(document.createElement('li'));
  var infolink = $(document.createElement('a'));
  infolink.attr({
    id: "infotab",
    class: "tablinks",
    href: "javascript:void(0)",
    onclick: "openTab(event, 'Information')"
  });
  infolink.append("Prices & information");
  infotab.append(infolink);
  var creditstab = $(document.createElement('li'));
  var creditslink = $(document.createElement('a'));
  creditslink.attr({
    id: "creditstab",
    class: "tablinks",
    href: "javascript:void(0)",
    onclick: "openTab(event, 'Credits')"
  });
  creditslink.append("About");
  creditstab.append(creditslink);

  tab.append(infotab);
  tab.append(xptab)
  tab.append(pointstab);
  tab.append(creditstab);
  main.append(tab);

  //credits
  var formcredits = $(document.createElement('form'));
  formcredits.attr({id: "Credits", class: "tabcontent"});
  formcredits.append("<strong>Credits</strong></br>Application creator: Jia </br> Points research/information gatherer: Shadowstream </br> BXP/level accuracy: Purewct (huge credit, spent over 2 months gathering)</br></br><strong>Additional credits</strong></br>CSS: Sanjan</br>Sledgehammer (testers): Shadowstream, RexT, Mahtiukko</br>Research round helpers: Many</br></br></br><span id='version'><strong>Last updated:</strong> 23/11/2019 &emsp; <strong>Version:</strong> 3.8.5</span></br></br>");

  //xp
  var formxp = $(document.createElement('form'));
  //formxp.append("BXP Calculator v1.0- put in rsn first to make selection easier");
  //layout
  var right = $(document.createElement('div'));
  var left = $(document.createElement('div'));
  right.attr({id: "rightxp", style: "display:inline-block;padding:0px 10px 0px 0px;vertical-align:top;"});
  left.attr({id: "leftxp", style: "display:inline-block;padding:0px 0px 0px 0px;vertical-align:top;"});

  var amount = $(document.createElement('input'));
  var skill = $(document.createElement('select'));
  var ba = $(document.createElement('select'));
  var calculate = $(document.createElement('button'));
  var request = $(document.createElement('button'));
  var output = $(document.createElement('div'));
  var silverhawk = $(document.createElement('div'));
  var silverhawkh = $(document.createElement('div'));
  var breakdown = $(document.createElement('div'));
  var xpcount = $(document.createElement('input')); //stores the actual bxp will get
  xpcount.attr({id: "counter", type: "number", style: "display:none;"});
  xpcount.val(0);
  formxp.attr({id: "XP", class: "tabcontent", method: "post", action: LINK});
  left.append("Skill: ");
  //skills
  skill.attr({id: "skill", name: "xp_skill"});
  var agility = $(document.createElement('option')).attr({value: "agility"});
  agility.append("Agility");
  var firemaking = $(document.createElement('option')).attr({value: "firemaking"});
  firemaking.append("Firemaking");
  var mining = $(document.createElement('option')).attr({value: "mining"});
  mining.append("Mining");
  skill.append(agility);
  skill.append(firemaking);
  skill.append(mining);

  left.append(skill);
  left.append($(document.createElement('br')));
  //amount
  left.append("Amount: ");
  amount.attr({id: "amount", type: "text", style: "text-align:right", name: "xp_amount"});
  amount.val(0);
  left.append(amount);
  left.append($(document.createElement('br')));
  //level
  //var level = $(document.createElement('input'));
  var level = $(document.createElement('select'));
  left.append("Level: ");
  for (i = 1; i < 100; i++) {
    var option = $(document.createElement('option')).attr({id: "level" + i, value: i});
    option.append(i);
    level.append(option);
  }
  level.val(99);
  level.attr({id: "level", name: "xp_level"});
  left.append(level);
  left.append($(document.createElement('br')));
  //amount of ba completed
  left.append("Amount of BA completed since rework: ");
  var none = $(document.createElement('option')).attr({value: "none"});
  none.append("None");
  var queen = $(document.createElement('option')).attr({value: "queen"});
  queen.append("Killed queen");
  var hardmode = $(document.createElement('option')).attr({value: "hardmode"});
  hardmode.append("Completed up to Wave 6 or up to Wave 9");
  var king = $(document.createElement('option')).attr({value: "king"});
  king.append("Unlocked king (Unlocked up to wave 10)");
  ba.attr({id: "baxp", name: "xp_ba"});
  ba.append(none);
  ba.append(queen);
  ba.append(hardmode);
  ba.append(king);
  left.append(ba);
  left.append($(document.createElement('br')));

  //calculate button
  calculate.attr({type: "button", id: "calculatexp", style: "float:right;"});
  calculate.append("Calculate");

  request.attr({
    id: "xprequest",
    name: "xprequest",
    type: "button",
    disabled: "disabled",
    style: "float:right;",
    onclick: "submitform(this);"
  });
  request.append("Request this leech");
  left.append(request);
  left.append(calculate);
  left.append(xpcount);

  //output ui
  left.append($(document.createElement('br')));
  left.append($(document.createElement('br')));
  left.append(output);
  output.attr({id: "costxp", style: "display:none;"});
  output.append("Cost: ");
  output.append($(document.createElement('br')));
  left.append($(document.createElement('br')));
  left.append(breakdown);
  //silverhakw data
  left.append($(document.createElement('br')));
  left.append(silverhawk);
  left.append(silverhawkh);
  silverhawk.attr({id: "silverhawk", style: "display:none;"});
  silverhawkh.attr({id: "silverhawkhidden", style: "display:none;"});
  //breakdowncontinue
  breakdown.attr({id: "breakdownxp", style: "display:none;"});
  breakdown.append("Breakdown: ");
  breakdown.append($(document.createElement('br')));
  //ui for fetching level

  var hiddendiv = $(document.createElement('div'));
  var getlevel = $(document.createElement('button'));
  var rsn = $(document.createElement('input'));
  var skill_levels = $(document.createElement('div'));
  getlevel.attr({type: "button", id: "getlevel"});
  getlevel.append("Get stats");
  rsn.attr({id: "rsn", type: "text", style: "width:90px", name: "xp_rsn"});
  hiddendiv.attr({id: "hiddenrs"});
  skill_levels.attr({id: "skill_levels"});
  right.append("Enter RSN to get stats: ");
  right.append(rsn);
  right.append(getlevel);
  right.append($(document.createElement('br')));
  right.append("Automatically updates level from official RS website");
  right.append(skill_levels);
  right.append(hiddendiv);
  var hlevels = $(document.createElement('input')); //hiddenlevels
  hlevels.attr({id: "hlevels", type: "text", style: "display:none;"});
  hlevels.val(0, 0, 0);
  right.append(hlevels);
  right.append($(document.createElement('br')));

  //come together
  formxp.append(right); //fucking potato screen, making it top bottom instead
  //right = top, left = bottom
  formxp.append(left);

  //points
  var formp = $(document.createElement('form'));

  //layout
  var right = $(document.createElement('div'));
  var left = $(document.createElement('div'));
  right.attr({id: "leftpoints", style: "display:inline-block;padding:0px 10px 0px 0px;vertical-align:middle;"});
  left.attr({id: "rightpoints", style: "display:inline-block;padding:0px 0px 0px 0px;vertical-align:middle;"});

  var roles = $(document.createElement('div'));
  var att = $(document.createElement('div'));
  var def = $(document.createElement('div'));
  var col = $(document.createElement('div'));
  var heal = $(document.createElement('div'));
  roles.attr({id: "roles", style: "display:inline-block;"});
  att.attr({id: "att", style: "display:inline-block;padding-right:2em;"});
  def.attr({id: "def", style: "display:inline-block;padding-right:2em;"});
  col.attr({id: "col", style: "display:inline-block;padding-right:2em;"});
  heal.attr({id: "heal", style: "display:inline-block;"});

  var aamount = $(document.createElement('input'));
  var damount = $(document.createElement('input'));
  var hamount = $(document.createElement('input'));
  var camount = $(document.createElement('input'));
  var wanta = $(document.createElement('input'));
  var wantd = $(document.createElement('input'));
  var wanth = $(document.createElement('input'));
  var wantc = $(document.createElement('input'));

  var alevel = $(document.createElement('select'));
  var dlevel = $(document.createElement('select'));
  var hlevel = $(document.createElement('select'));
  var clevel = $(document.createElement('select'));
  alevel.attr({id: "alevel", name: "alevel"});
  dlevel.attr({id: "dlevel", name: "dlevel"});
  hlevel.attr({id: "hlevel", name: "hlevel"});
  clevel.attr({id: "clevel", name: "clevel"});
  for (i = 1; i < 6; i++) {
    var option = $(document.createElement('option')).attr({id: "alevel" + i, value: i});
    option.append(i);
    alevel.append(option);
  }
  for (i = 1; i < 6; i++) {
    var option = $(document.createElement('option')).attr({id: "hlevel" + i, value: i});
    option.append(i);
    hlevel.append(option);
  }
  for (i = 1; i < 6; i++) {
    var option = $(document.createElement('option')).attr({id: "dlevel" + i, value: i});
    option.append(i);
    dlevel.append(option);
  }
  for (i = 1; i < 6; i++) {
    var option = $(document.createElement('option')).attr({id: "clevel" + i, value: i});
    option.append(i);
    clevel.append(option);
  }
  var wantalevel = $(document.createElement('select'));
  var wantdlevel = $(document.createElement('select'));
  var wanthlevel = $(document.createElement('select'));
  var wantclevel = $(document.createElement('select'));
  wantalevel.attr({id: "wantalevel", name: "want_alevel"});
  wantdlevel.attr({id: "wantdlevel", name: "want_dlevel"});
  wanthlevel.attr({id: "wanthlevel", name: "want_hlevel"});
  wantclevel.attr({id: "wantclevel", name: "want_clevel"});
  for (i = 5; i > 0; i--) {
    var option = $(document.createElement('option')).attr({id: "wantalevel" + i, value: i});
    option.append(i);
    wantalevel.append(option);
  }
  for (i = 5; i > 0; i--) {
    var option = $(document.createElement('option')).attr({id: "wanthlevel" + i, value: i});
    option.append(i);
    wanthlevel.append(option);
  }
  for (i = 5; i > 0; i--) {
    var option = $(document.createElement('option')).attr({id: "wantdlevel" + i, value: i});
    option.append(i);
    wantdlevel.append(option);
  }
  for (i = 5; i > 0; i--) {
    var option = $(document.createElement('option')).attr({id: "wantclevel" + i, value: i});
    option.append(i);
    wantclevel.append(option);
  }

  var ba = $(document.createElement('select')).attr({style: "width:241px;", name: "points_ba"});
  var unlockstatus = $(document.createElement('input'));
  unlockstatus.attr({id: "unlockstatus", style: "display:none;"});
  unlockstatus.val(0);
  var calculate = $(document.createElement('button'));
  var request = $(document.createElement('button'));
  var output = $(document.createElement('div'));
  var breakdown = $(document.createElement('div'));

  formp.attr({id: "Points", class: "tabcontent", method: "post", action: LINK});

  //amount
  //excess points
  var excess = $(document.createElement('input')).attr({id: "excess", style: "display:none;"}).val(0);
  var actual = $(document.createElement('input')).attr({id: "actual", style: "display:none;"}).val(0);
  left.append(roles);
  roles.append(excess);
  roles.append(actual);
  var info = $(document.createElement('div'));
  info.attr({id: "info", style: "display:inline-block;padding-right:0.5em;"});
  info.append($(document.createElement('br')));
  info.append("Current: ");
  info.append($(document.createElement('br')));
  info.append($(document.createElement('br')));
  info.append($(document.createElement('br')).attr({class: "space"}));
  info.append("Need: ");
  info.append($(document.createElement('br')));
  info.append($(document.createElement('br')));
  roles.append(info);
  roles.append(att);
  roles.append(col);
  roles.append(def);
  roles.append(heal);
  roles.append($(document.createElement('br')));
  roles.append($(document.createElement('br')));
  aamount.attr({id: "aamount", name: "apoints", type: "number", style: "text-align:right;width: 40px;"});
  aamount.val(0);
  wanta.attr({id: "wanta", name: "want_apoints", type: "number", style: "text-align:right;width: 40px;"});
  wanta.val(0);
  att.append("Attack");
  att.append($(document.createElement('br')));
  att.append("Level: ");
  att.append(alevel);
  att.append($(document.createElement('br')));
  att.append("Points: ");
  att.append(aamount);
  att.append($(document.createElement('br')));
  att.append($(document.createElement('br')));
  att.append("Level: ");
  att.append(wantalevel);
  att.append($(document.createElement('br')));
  att.append("Points: ");
  att.append(wanta);

  camount.attr({id: "camount", name: "cpoints", type: "number", style: "text-align:right;width: 40px"});
  camount.val(0);
  wantc.attr({id: "wantc", name: "want_cpoints", type: "number", style: "text-align:right;width: 40px;"});
  wantc.val(0);
  col.append("Collector");
  col.append($(document.createElement('br')));
  col.append("Level: ");
  col.append(clevel);
  col.append($(document.createElement('br')));
  col.append("Points: ");
  col.append(camount);
  col.append($(document.createElement('br')));
  col.append($(document.createElement('br')));
  col.append("Level: ");
  col.append(wantclevel);
  col.append($(document.createElement('br')));
  col.append("Points: ");
  col.append(wantc);

  damount.attr({id: "damount", name: "dpoints", type: "number", style: "text-align:right;width: 40px"});
  damount.val(0);
  wantd.attr({id: "wantd", name: "want_dpoints", type: "number", style: "text-align:right;width: 40px;"});
  wantd.val(0);
  def.append("Defender");
  def.append($(document.createElement('br')));
  def.append("Level: ");
  def.append(dlevel);
  def.append($(document.createElement('br')));
  def.append("Points: ");
  def.append(damount);
  def.append($(document.createElement('br')));
  def.append($(document.createElement('br')));
  def.append("Level: ");
  def.append(wantdlevel);
  def.append($(document.createElement('br')));
  def.append("Points: ");
  def.append(wantd);

  hamount.attr({id: "hamount", name: "hpoints", type: "number", style: "text-align:right;width: 40px"});
  hamount.val(0);
  wanth.attr({id: "wanth", name: "want_hpoints", type: "number", style: "text-align:right;width: 40px;"});
  wanth.val(0);
  heal.append("Healer");
  heal.append($(document.createElement('br')));
  heal.append("Level: ");
  heal.append(hlevel);
  heal.append($(document.createElement('br')));
  heal.append("Points: ");
  heal.append(hamount);
  heal.append($(document.createElement('br')));
  heal.append($(document.createElement('br')));
  heal.append("Level: ");
  heal.append(wanthlevel);
  heal.append($(document.createElement('br')));
  heal.append("Points: ");
  heal.append(wanth);
  left.append($(document.createElement('br')));

  //amount of ba completed
  var ba_container = $(document.createElement('div')).attr({id: "ba_container"});
  ba_container.append("Amount of BA completed since rework: ");
  var none = $(document.createElement('option')).attr({value: "none"});
  none.append("None");
  var queen = $(document.createElement('option')).attr({value: "queen"});
  queen.append("Killed queen");
  var hardmode = $(document.createElement('option')).attr({id: "hardmode", value: "hardmode"});
  hardmode.append("Completed up to Wave 6 or up to Wave 9 (King NOT unlocked)");
  var king = $(document.createElement('option')).attr({value: "king"});
  king.append("Unlocked or killed king (Unlocked wave 10)");
  ba.attr({id: "ba"});
  ba.append(none);
  ba.append(queen);
  ba.append(hardmode);
  ba.append(king);
  ba_container.append(ba);
  ba_container.append($(document.createElement('br')));
  ba_container.append($(document.createElement('br')));
  left.append(ba_container);
  left.append(unlockstatus);

  var enhancercontainer = $(document.createElement('div'));
  var enhancer = $(document.createElement('input'));
  var enhancerhidden = $(document.createElement('input'));
  enhancercontainer.attr({id: "enhancercontainer"});
  enhancer.attr({id: "enhancer", name: "enhancer", type: "number", value: 0, style: "text-align:right;width: 40px;"});
  enhancerhidden.attr({id: "enhancer_h", name: "enhancer_h", value: 0, type: "number", style: "display:none;"});
  enhancercontainer.append("Enhancer charges: ");
  enhancercontainer.append($(document.createElement('span')).attr({style: "padding: 0 5px;"}));
  enhancercontainer.append(enhancer);
  enhancercontainer.append(enhancerhidden);
  enhancercontainer.append($(document.createElement('br')));
  enhancercontainer.append($(document.createElement('br')));
  left.append(enhancercontainer);

  //ironman
  var ironcontainer = $(document.createElement('div')).attr({id: "ironcontainer", style: ""});
  ironcontainer.append("Are you an ironman: ");
  var radioyes = $(document.createElement('input')).attr({
    type: "radio",
    id: "ironmany",
    name: "ironman",
    value: "yes"
  });
  var radiono = $(document.createElement('input')).attr({
    type: "radio",
    id: "ironmann",
    name: "ironman",
    value: "no",
    checked: "checked"
  });
  //left.append($(document.createElement('span')).attr({style:"padding: 0 10px;"}));
  ironcontainer.append($(document.createElement('span')).attr({style: "padding: 0 10px;"}));
  ironcontainer.append("Yes ");
  ironcontainer.append(radioyes);
  ironcontainer.append($(document.createElement('span')).attr({style: "padding: 0 10px;"}));
  ironcontainer.append("No ");
  ironcontainer.append(radiono);
  left.append(ironcontainer);

  //kings
  var kingcontainer = $(document.createElement('div')).attr({id: "kingcontainer", style: "display:none;"});
  kingcontainer.append("How many kings have you killed: ");
  kingcontainer.append($(document.createElement('span')).attr({style: "padding: 0 5px;"}));
  var kings = $(document.createElement('select')).attr({id: "kingskilled", name: "kingskilled"});
  for (i = 0; i < 6; i++) {
    var option = $(document.createElement('option')).attr({id: "kings" + i, value: i});
    option.append(i);
    kings.append(option);
  }
  kingcontainer.append(kings);
  left.append(kingcontainer);

  //calculate button
  calculate.attr({type: "button", id: "calculate", style: "float:right;"});
  calculate.append("Calculate");
  request.attr({
    type: "button",
    name: "pointsrequest",
    id: "pointsrequest",
    style: "float:right;",
    disabled: "disabled",
    onclick: "submitform(this);"
  });
  request.append("Request this leech");
  left.append($(document.createElement('br')));
  left.append(request);
  left.append(calculate);

  //output ui
  left.append($(document.createElement('br')));
  left.append($(document.createElement('br')));
  left.append(output);
  output.attr({id: "cost", style: "display:none;"});
  output.append("Cost: ");
  output.append($(document.createElement('br')));
  left.append($(document.createElement('br')));
  left.append(breakdown);
  breakdown.attr({id: "breakdown", style: "display:none;"});
  breakdown.append("Breakdown: ");
  breakdown.append($(document.createElement('br')));

  //right side
  var preset = $(document.createElement('select')).attr({id: "presets", name: "preset"});
  var rsn = $(document.createElement('input'));
  var loadpr = $(document.createElement('button')).attr({id: "loadpreset", type: "button"});
  var scratch = $(document.createElement('option')).attr({value: "levels"});
  var comp = $(document.createElement('option')).attr({value: "nm"});
  var kingkill = $(document.createElement('option')).attr({value: "king"});
  var insigniaA = $(document.createElement('option')).attr({value: "insignia_A"});
  var insigniaD = $(document.createElement('option')).attr({value: "insignia_D"});
  var insigniaC = $(document.createElement('option')).attr({value: "insignia_C"});
  var insigniaH = $(document.createElement('option')).attr({value: "insignia_H"});
  var hat = $(document.createElement('option')).attr({value: "hat"});
  var torso = $(document.createElement('option')).attr({value: "torso"});
  rsn.attr({id: "points_rsn", type: "text", style: "width:90px", name: "points_rsn"});
  scratch.append("Points & levels");
  comp.append("1-10 NM/Queen kill/Completionist requirement");
  kingkill.append("Single king kill");
  insigniaA.append("Attacker's insignia");
  insigniaD.append("Defender's insignia");
  insigniaH.append("Healer's insignia");
  insigniaC.append("Collectors's insignia");
  hat.append("Hat from scratch");
  torso.append("Torso from scratch");
  preset.append(scratch);
  preset.append(comp);
  preset.append(kingkill);
  preset.append(insigniaA);
  preset.append(insigniaD);
  preset.append(insigniaH);
  preset.append(insigniaC);
  preset.append(hat);
  preset.append(torso);
  right.append("Enter RSN*: ");
  right.append(rsn);
  right.append($(document.createElement('br')));
  right.append("Presets: ");
  right.append(preset);
  loadpr.append("Load preset");
  right.append(loadpr);
  right.append($(document.createElement('br')));
  right.append($(document.createElement('br')));
  //come together
  formp.append("<div class='noticecontainer'><span class='tblnotice'>Notice</span><ul><li>You may check your level in the roles via quickchatting and searching for 'role'.</li><li>You may check the amount of points in respective roles via looking in the currency pouch, under the minigames tab.</li></ul></div>");
  formp.append($(document.createElement('br')));
  formp.append("Please select the most appropriate preset provided. Fill in as accurately as you can.");
  formp.append($(document.createElement('br')));
  formp.append($(document.createElement('br')));
  formp.append(right); //right = top
  formp.append(left); //left = bottom

  //information
  var forminfo = $(document.createElement('form'));
  forminfo.append("<center class='priceh'>Prices</center>");
  forminfo.append($(document.createElement('br')));
  if (minigameweekend) {
    forminfo.append("<div class='noticecontainer'><span class='tblnotice'>Minigame weekend prices are active, 1.5x the normal rate, the calculator has automatically adjusted its calculations to take it into consideration.</span></div><br>");
  }
  var table = $(document.createElement('table')).attr({id: "infotbl"});
  table.append("<tr><th>Round</th><th>Price</th><th>Time</th></tr>");
  table.append("<tr><td><a onclick='showtab(1)'>Waves 1-10 NM/Queen kill/Completionist requirement</a></td><td class='tblprice'>" + commaSeparateNumber(QUEEN) + "</td><td class='tblprice'>" + QUEEN_T + " minutes</td></tr>");
  table.append("<tr><td>Waves 1-10 NM - solo leech</td><td class='tblprice'>" + commaSeparateNumber(QUEEN * 2) + "</td><td class='tblprice'>" + QUEEN_T + " minutes</td></tr>");
  table.append("<tr><td>Waves 1-9 HM unlock</th><td class='tblprice'>" + commaSeparateNumber(FULL_HM_UNLOCK) + "</td><td class='tblprice'>" + FULLHM_T + " minutes</td></tr>");
  table.append("<tr><td>Waves 1-9 HM (if already unlocked, please read information below) ***</th><td class='tblprice'>" + commaSeparateNumber(FULL_HM_ALREADY_UNLOCK) + "</td><td class='tblprice'>" + FULLHM_T + " minutes</td></tr>");
  table.append("<tr><td>Waves 1-9 HM (as an ironman)</th><td class='tblprice'>" + commaSeparateNumber(IRON_POINTS) + "</td><td class='tblprice'>" + FULLHM_T + " minutes</td></tr>");
  table.append("<tr><td>Waves 6-9 HM for BXP</td><td class='tblprice'>" + commaSeparateNumber(PARTHM) + "</td><td class='tblprice'>" + PARTHM_T + " minutes</td></tr>");
  table.append("<tr><td>Waves 6-9 HM for Points</td><td class='tblprice'>" + commaSeparateNumber(POINTS_PART) + "</td><td class='tblprice'>" + PARTHM_T + " minutes</td></tr>");
  table.append("<tr><td><a onclick='showtab(2)'>Wave 10 HM/King kill/Trim requirement</a></th><td class='tblprice'>" + commaSeparateNumber(KING) + "</td><td class='tblprice'>" + KING_T + " minutes</td></tr>");
  table.append("<tr><td><a onclick='showtab(2)'>Wave 10 HM/King kill - if you do not have either a) resonance and surge abilities, or b) level 50+ magic or range</a></th><td class='tblprice'>" + commaSeparateNumber(SKILLER_KING) + "</td><td class='tblprice'>" + KING_T + " minutes</td></tr>");
  forminfo.append(table);
  forminfo.append($(document.createElement('br')));
  forminfo.append("Listed prices are rounds done with 2 leeches at once (unless explicitly stated otherwise). You may pay double listed price for an increased chance of leeching faster, to leech alone (please mention when asking). <br><br>For specifics please see the calculators provided (clicking the round in the table above opens the relevant tab). Prices may slightly vary based on if another leech requires 1-9 hard mode to be unlocked.  The points/xp obtained from HM 1-5 offsets the extra cost.  <br><br>Calculators will give an estimate of cost and the amount of rounds required. You may also request the specific leech via the calculator.");
  forminfo.append($(document.createElement('br')));
  forminfo.append($(document.createElement('br')));
  forminfo.append("Ironmen have increased cost due to being unable to be traded tickets.");
  forminfo.append($(document.createElement('br')));
  forminfo.attr({id: "Information", class: "tabcontent"});
  main.append(formxp);
  main.append(formp);
  main.append(forminfo);
  main.append(formcredits);
  main.appendTo("#calculator");

  document.getElementById("infotab").click();

  //button listener
  $("#calculatexp").click(function () {

    $("#xprequest").html("Request this leech");
    $("#xprequest").attr("disabled", true);
    if ($("#amount").val() <= 0) {
      //At least one input is empty
      alert("Please input an amount greater than 0.");
      return;
    }
    var level = $("#level").val();
    var amount = parseInt($("#amount").val().replace(/,/g, ""));
    var unlock = 0;
    var cost = 0;
    switch ($("#baxp").val()) {
      case "none":
        unlock = 0;
        break;
      case "queen":
        unlock = 1;
        break;
      default:
        unlock = 2;
        break;
    }
    //resets breakdown outputs
    $("#breakdownxp").empty();
    $("#breakdownxp").append("Breakdown: ");
    $("#breakdownxp").append($(document.createElement('br')));
    //reset counter
    $("#counter").val(0);
    if ($("#skill").find('option:selected').val() == "agility") {
      //calculate agility
      cost = calculateXP(level, amount, unlock, 'a');
      getprice(level);
    }
    if ($("#skill").find('option:selected').val() == "mining") {
      //calculate mining
      cost = calculateXP(level, amount, unlock, 'm');
      $("#silverhawk").hide();
    }
    if ($("#skill").find('option:selected').val() == "firemaking") {
      //calculate firemaking
      cost = calculateXP(level, amount, unlock, 'f');
      $("#silverhawk").hide();
    }
    //output
    $("#costxp").empty();
    $("#costxp").append("Cost: ");
    $("#costxp").append(commaSeparateNumber(cost) + " gp");
    $("#costxp").append($(document.createElement('br')));
    $("#costxp").append("Actual BXP: " + commaSeparateNumber($("#counter").val()));
    $("#costxp").append($(document.createElement('br')));
    $("#costxp").append("GP/BXP: " + commaSeparateNumber((cost / $("#counter").val()).toFixed(2)));
    $("#costxp").show();
    $("#breakdownxp").show();

    //allow sending
    $('#xprequest').removeAttr('disabled');
  });
  $("#getlevel").click(function () {
    fetchlevel($("#rsn").val(), $("#skill").val());
    //openInNewTab("http://services.runescape.com/m=hiscore/c=EcIJY67n*WI/compare?category_type=-1&user1="+$("#rsn").val());

  });
  //shadowstream's fkn 'userfriendly' requst. enter button whilst amount focus = calculate
  $('#amount').keypress(function (e) {
    var key = e.which;
    if (key == 13) {  // the enter key code
      $('#calculatexp').click();
      return false;
    }
  });
  $('#baxp').keypress(function (e) {
    var key = e.which;
    if (key == 13) {  // the enter key code
      $('#calculate').click();
      return false;
    }
  });
  $("#rsn").keypress(function (e) {
    var key = e.which;
    if (key == 13) {  // the enter key code
      $("#getlevel").click();
      return false;
    }
  });
  $("#enhancer").bind('keyup click', function (e) {
    $("#enhancer_h").val(parseInt($("#enhancer").val()));

  });
  //formatting numbers
  $("#amount").on('input', function () {
    // do your stuff
    if (isNaN(parseInt($("#amount").val().replace(/,/g, "")))) {
      $("#amount").val(0);
    }

    $("#amount").val(commaSeparateNumber(parseInt($("#amount").val().replace(/,/g, ""))));

    if (parseInt($("#amount").val().replace(/,/g, "")) > 300000000) {
      $("#amount").val(0);
      alert("Why tf do you need that much bxp");
    }
  });
  $("#amount").focus(function () {
    if (parseInt($("#amount").val()) == 0) {
      $("#amount").val("");
    }
  });
  //auto change level if rsn has been added
  $("#skill").change(function () {
    if (parseInt($("#hlevels").text()) >= 1) {
      var array = $("#hlevels").text().split(',');
      switch ($("#skill").val()) {
        case "agility":
          $("#level").val(array[0]);
          break;
        case "mining":
          $("#level").val(array[1]);
          break;
        case "firemaking":
          $("#level").val(array[2]);
          break;
      }
    }
  });
  $("#calculate").click(function () {
    $("#pointsrequest").html("Request this leech");
    $("#pointsrequest").attr("disabled", true);
    //validation
    var empty = $(this).parent().find("input").filter(function () {
      return this.value === "";
    });
    if (empty.length) {
      //At least one input is empty
      //alert("Please fill in all relevant fields");
      //return;
    }
    //resets breakdown outputs
    $("#breakdown").empty();
    $("#cost").empty();
    $("#enhancer_h").val(parseInt($("#enhancer").val()));
    var font = $(document.createElement('font')).attr({size: "6"});
    var cost = 0;
    //ironman
    var ironman = false;
    if ($("#ironmany").is(":checked")) ironman = true;

    if ($("#presets").val() != "nm" && $("#presets").val() != "king") {

      $("#breakdown").append("!!DO NOT QUOTE INDIVIDUAL ROLES IF NEEDS MULTIPLE ROLES!!");
      $("#breakdown").append($(document.createElement('br')));
      $("#breakdown").append("Breakdown (points from changing during mid round are taken into account): ");
      $("#breakdown").append($(document.createElement('br')));
      if (ironman) {
        $("#breakdown").append("Please note cost will likely be lower than stated, since you will be using tickets for the last half of leeching.");
        $("#breakdown").append($(document.createElement('br')));
      }
      updateunlock();

      //calculate how many points needed
      //ok so summation of array between levels
      var needApoints = $("#wanta").val() - $("#aamount").val();
      var needDpoints = $("#wantd").val() - $("#damount").val();
      var needHpoints = $("#wanth").val() - $("#hamount").val();
      var needCpoints = $("#wantc").val() - $("#camount").val();
      for (i = $("#alevel").val(); i < $("#wantalevel").val(); i++) {
        needApoints = needApoints + leveldifference[i];
      }
      for (i = $("#dlevel").val(); i < $("#wantdlevel").val(); i++) {
        needDpoints = needDpoints + leveldifference[i];
      }
      for (i = $("#clevel").val(); i < $("#wantclevel").val(); i++) {
        needCpoints = needCpoints + leveldifference[i];
      }
      for (i = $("#hlevel").val(); i < $("#wanthlevel").val(); i++) {
        needHpoints = needHpoints + leveldifference[i];
      }

      $("#actual").val(0);//resets actual each run
      $("#excess").val(0);
      //if the user wants points/torso/etc
      if ($("#presets").val() != "insignia_A" && $("#presets").val() != "insignia_D" && $("#presets").val() != "insignia_H" && $("#presets").val() != "insignia_C") {
        cost = calculatepoints(needApoints, needDpoints, needCpoints, needHpoints, ironman);
      }
      if ($("#presets").val() == "insignia_A") {
        //get number of kings already killed
        var kingskilled = 0;
        var unlock = $("#unlockstatus").val();
        if ($("#ba").val() == "king") kingskilled = $("#kingskilled").val();
        cost = calculateinsignia(needApoints, 'a', kingskilled);
      }
      if ($("#presets").val() == "insignia_D") {
        //get number of kings already killed
        var kingskilled = 0;
        var unlock = $("#unlockstatus").val();
        if ($("#ba").val() == "king") kingskilled = $("#kingskilled").val();
        cost = calculateinsignia(needDpoints, 'd', kingskilled);
      }
      if ($("#presets").val() == "insignia_H") {
        //get number of kings already killed
        var kingskilled = 0;
        var unlock = $("#unlockstatus").val();
        if ($("#ba").val() == "king") kingskilled = $("#kingskilled").val();
        cost = calculateinsignia(needHpoints, 'h', kingskilled);
      }
      if ($("#presets").val() == "insignia_C") {
        //get number of kings already killed
        var kingskilled = 0;
        var unlock = $("#unlockstatus").val();
        if ($("#ba").val() == "king") kingskilled = $("#kingskilled").val();
        cost = calculateinsignia(needCpoints, 'c', kingskilled);
      }
      //output
      //show excess points
      $("#breakdown").append($(document.createElement('br')));
      $("#breakdown").append($(document.createElement('br')));
      $("#breakdown").append("Extra points gained (approx): " + parseInt($("#excess").val()));
    } else {
      //if nm append
      if ($("#presets").val() == "nm") {
        cost = QUEEN;
      }
      //if king append
      if ($("#presets").val() == "king") {
        //check amount of ba done
        cost = calculateking(ironman);
      }
    }
    font.append("Cost: ");
    font.append(commaSeparateNumber(cost) + "gp");
    if (($("#presets").val() == "hat" || $("#presets").val() == "torso") && $("#ba").val() != "none") {
      font.append($(document.createElement('br')));
      font.append(" MAY NEED TO KILL QUEEN");
    }
    $("#cost").append(font);
    $("#cost").append($(document.createElement('br')));
    $("#cost").append($(document.createElement('br')));
    $("#cost").show();
    $("#breakdown").show();
    $('#pointsrequest').removeAttr('disabled');
  });
  $("#ba").change(function () {
    updateunlock();
    if ($("#ba").val() == "king") {
      switch ($("#presets").val()) {
        case "insignia_A":
          $("#kingcontainer").show();
          break;
        case "insignia_H":
          $("#kingcontainer").show();
          break;
        case "insignia_D":
          $("#kingcontainer").show();
          break;
        case "insignia_C":
          $("#kingcontainer").show();
          break;

      }
    } else {
      $("#kingcontainer").hide();
    }

  });
  $("#presets").change(function () {
    reset();
    loadpreset();
  });
  $("#loadpreset").click(function () {
    loadpreset();
  });
});

function calculateXP(level, bxp, unlock, skill) {
  var P = 27.5;
  var F = 38;
  var NM = 0;
  var PHM = 0;
  var FHM = 0;
  switch (skill) {
    case 'a':
      NM = NMA;
      HM = HMA[level];
      break;
    case 'f':
      NM = NMF;
      HM = HMF[level];
      break;
    case 'm':
      NM = NMM;
      //www.mathportal.org/calculators/statistics-calculator/correlation-and-regression-calculator.php
      //formula = y = 117.23469387755102x + 97.273
      HM = parseInt(117.237 * level + 97.273);
      break;
  }
  PHM = multiplier * HM * P;
  FHM = multiplier * HM * F;
  NM = multiplier * NM;

  //unlock = see top
  if (bxp <= 0) return 0;
  if (unlock == 0) {
    //never done ba
    var tempxp = bxp - (NM * level / 99);
    $("#breakdownxp").append("1x&nbsp; 1-10NM &nbsp;" + commaSeparateNumber(QUEEN));
    $("#breakdownxp").append($(document.createElement('br')));
    $("#counter").val(parseInt($("#counter").val()) + parseInt(level * NM / 99));
    return QUEEN + calculateXP(level, tempxp, 1, skill);//append queen and rerun
  }
  if (unlock == 1) {
    var tempxp = bxp - FHM;
    $("#breakdownxp").append("1x&nbsp; 1-9HM &nbsp;" + commaSeparateNumber(FULL_HM_UNLOCK));
    $("#breakdownxp").append($(document.createElement('br')));
    $("#counter").val(parseInt($("#counter").val()) + parseInt(FHM));
    return FULL_HM_UNLOCK + calculateXP(level, tempxp, 2, skill);
    ;
  }
  if (unlock == 2) {
    //everything is unlocked
    var rounds = calculateRoundsXP(level, bxp, PHM);
    $("#breakdownxp").append(rounds + "x&nbsp; 6-9HM &nbsp;" + commaSeparateNumber(rounds * PARTHM));
    $("#breakdownxp").append($(document.createElement('br')));
    $("#counter").val(parseInt($("#counter").val()) + parseInt(rounds * PHM));
    return PARTHM * rounds;
  }
  return -1;
}

function calculateRoundsXP(level, bxp, PHM) {
  //the amount of rounds of 6-9s needed
  var xp = PHM;
  var rounds = 1;
  if (bxp - xp <= 0) {
    return rounds;
  }
  return rounds + calculateRoundsXP(level, bxp - xp, PHM);
}

//format output
//credits: http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
function commaSeparateNumber(val) {
  while (/(\d+)(\d{3})/.test(val.toString())) {
    val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
  }
  return val;
}

//opens new tab
function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

//fetch data
function fetchlevel(name, skill) {
  name = encodeURIComponent(name.trim());
  $("#skill_levels").show();
  $("#skill_levels").empty();
  $("#skill_levels").html("Loading...");
  //get stats from site
  requestCrossDomain(window.location.origin + '/api/getlevels/' + name, function (results) {
    $('#skill_levels').hide();
    var array = results.split(',');
    var level = 1;

    var agility = array[35];
    var mining = array[31];
    var firemaking = array[25];

    $("#hlevels").text(agility + "," + mining + "," + firemaking);
    switch (skill) {
      case "agility":
        level = agility;
        break;
      case "mining":
        level = mining;
        break;
      case "firemaking":
        level = firemaking;
        break;
    }

    if (level >= 1) {
      //user exists
      $("#level").val(parseInt(level));
      $("#skill_levels").html("</br>Agility Level: " + agility + "</br>Mining Level: " + mining + "</br>Firemaking Level: " + firemaking);
      $("#skill_levels").show();
    }
  })
}

//get silverhawk prices
function getprice(level) {
  //http://services.runescape.com/m=itemdb_rs/api/graph/30915.json
  $("#silverhawk").show();
  //see if it's empty (no need to load it again
  if ($("#silverhawkhidden").text().length == 0) {
    $("#silverhawk").html("Loading silverhawk data...");
    requestCrossDomain(window.location.origin + '/api/getprice/30915', function (results) {
      $("#silverhawk").empty();
      $("#silverhawkhidden").empty();
      //$("#silverhawkhidden").show();

      $("#silverhawkhidden").append(results);
      if ($("#silverhawkhidden").text().length == 0) {
        //console.log(results);
        $("#silverhawk").empty();
        $("#silverhawk").html("Error getting Silverhawk prices");
      } else {
        var array = $("#silverhawkhidden").text().split(':');
        //alert(array[181]);
        var price = array[181].split('}');
        $("#silverhawk").append("GP/Silverhawk: " + commaSeparateNumber(price[0]));
        $("#silverhawk").append($(document.createElement('br')));
        $("#silverhawk").append("XP/feather: " + silverhawkxp(level));
        $("#silverhawk").append($(document.createElement('br')));
        $("#silverhawk").append("GP/XP (at your level): " + (price[0] / silverhawkxp(level)).toFixed(2));
      }
    });
    /*
			$.ajax({
                   url: 'http://services.runescape.com/m=itemdb_rs/api/graph/30915.json',
                   type: 'GET',
                   success: function(res) {
                       $("#silverhawk").empty();
                       $("#silverhawkhidden").empty();
                       //$("#silverhawkhidden").show();

                       $("#silverhawkhidden").append(res.responseText);
                        if ($("#silverhawkhidden").text().length == 0){
                           console.log(res.responseText);
                           $("#silverhawk").empty();
                           $("#silverhawk").html("Error getting Silverhawk prices");
                        }else{
                           var array = $("#silverhawkhidden").text().split(':');
                           //alert(array[181]);
                           var price = array[181].split('}');
                           $("#silverhawk").append("GP/Silverhawk: "+commaSeparateNumber(price[0]));
                           $("#silverhawk").append($(document.createElement('br')));
                           $("#silverhawk").append("XP/feather: "+silverhawkxp(level));
                           $("#silverhawk").append($(document.createElement('br')));
                           $("#silverhawk").append("GP/XP (at your level): "+(price[0]/silverhawkxp(level)).toFixed(2));
                    }
                   },
                   failure: function(){
                        $("#silverhawk").empty();
                        $("#silverhawk").html("Error getting Silverhawk prices");
                   }
            });*/
  } else {
    $("#silverhawk").empty();
    var array = $("#silverhawkhidden").text().split(':');
    //alert(array[181]);
    var price = array[181].split('}');
    $("#silverhawk").append("GP/Silverhawk: " + commaSeparateNumber(price[0]));
    $("#silverhawk").append($(document.createElement('br')));
    $("#silverhawk").append("XP/feather: " + silverhawkxp(level));
    $("#silverhawk").append($(document.createElement('br')));
    $("#silverhawk").append("GP/XP (at your level): " + (price[0] / silverhawkxp(level)).toFixed(2));
  }
}

function silverhawkxp(level) {
  var lvl = level;
  if (level == 99) lvl = 98;
  var xp = [0, 6.2, 6.9, 7.7, 8.5, 9.3, 10.4, 12.3, 12.7, 19.4, 15.3, 17.0, 18.8, 20.5, 22.9, 25.2, 26.1, 27.4, 28.5, 29.8, 31.0, 32.4, 33.7, 35.2, 36.7, 38.4, 39.9, 40.5, 41.4, 45.3, 47.3, 49.3, 51.4, 53.6, 55.9, 58.3, 60.8, 63.5, 66.2, 69.1, 72.0, 75.2, 78.4, 81.8, 85.3, 88.9, 92.9, 97.0, 101.2, 105.5, 110.1, 114.8, 120.0, 124.9, 130.4, 136.2, 142.4, 148.5, 154.6, 161.5, 168.4, , 175.7, 183.5, 191.1, 200.4, 210.8, 217.1, 226.9, 237.9, 247.0, 259.2, 269.3, 281, 294.7, 308.2, 321.4, 333.9, 349.6, 364.8, 379.3, 398, 416.6, 434.8, 452.2, 491.9, 515, 537.6, 559.3, 592.3, 612.2, 661.5, 692.9, 692.9, 723.6, 753.3, 806.5, 834.8, 860.2];
  return xp[lvl];
}

//end of xp
//start of points
function loadpreset() {
  //clears output
  $("#breakdown").empty();
  $("#cost").empty();
  //sets up what possible inputs user can put in
  switch ($("#presets").val()) {
    case "levels":
      reset();
      $("#wantalevel").val(5);
      $("#wantdlevel").val(5);
      $("#wantclevel").val(5);
      $("#wanthlevel").val(5);
      break;
    case "nm":
      reset();
      $("#info").hide();
      $("#col").hide();
      $("#heal").hide();
      $("#def").hide();
      $("#att").hide();
      $("#ba_container").hide();
      $("#roles").hide();
      $("#enhancercontainer").hide();
      break;
    case "king":
      reset();
      $("#info").hide();
      $("#col").hide();
      $("#heal").hide();
      $("#def").hide();
      $("#att").hide();
      $("#roles").hide();
      $("#enhancercontainer").hide();
      break;
    case "insignia_A":
      reset();
      $("#hardmode").empty();
      $("#hardmode").append("Completed Wave 9 Hardmode");
      $("#wantalevel").val(5);
      $("#wanta").val(500);
      $("#col").hide();
      $("#heal").hide();
      $("#def").hide();
      //$("#kingcontainer").show();
      $("#ironcontainer").hide();
      break;
    case "insignia_D":
      reset();
      $("#hardmode").empty();
      $("#hardmode").append("Completed Wave 9 Hardmode");
      $("#wantdlevel").val(5);
      $("#wantd").val(500);
      $("#col").hide();
      $("#heal").hide();
      $("#att").hide();
      //$("#kingcontainer").show();
      $("#ironcontainer").hide();
      break;
    case "insignia_C":
      reset();
      $("#hardmode").empty();
      $("#hardmode").append("Completed Wave 9 Hardmode");
      $("#wantclevel").val(5);
      $("#wantc").val(500);
      $("#att").hide();
      $("#heal").hide();
      $("#def").hide();
      //$("#kingcontainer").show();
      $("#ironcontainer").hide();
      break;
    case "insignia_H":
      reset();
      $("#hardmode").empty();
      $("#hardmode").append("Completed Wave 9 Hardmode");
      $("#wanthlevel").val(5);
      $("#wanth").val(500);
      $("#col").hide();
      $("#att").hide();
      $("#def").hide();
      //$("#kingcontainer").show();
      $("#ironcontainer").hide();
      break;
    case "hat":
      reset();
      $("#wanta").val(275);
      $("#wantd").val(275);
      $("#wanth").val(275);
      $("#wantc").val(275);
      break;
    case "torso":
      reset();
      $("#wanta").val(375);
      $("#wantd").val(375);
      $("#wanth").val(375);
      $("#wantc").val(375);
      break;

  }
}

function reset() {
  $("#info").show();
  $("#alevel").val(1);
  $("#dlevel").val(1);
  $("#clevel").val(1);
  $("#hlevel").val(1);
  $("#wantalevel").val(1);
  $("#wantdlevel").val(1);
  $("#wantclevel").val(1);
  $("#wanthlevel").val(1);
  $("#aamount").val(0);
  $("#damount").val(0);
  $("#hamount").val(0);
  $("#camount").val(0);
  $("#wanta").val(0);
  $("#wantd").val(0);
  $("#wanth").val(0);
  $("#wantc").val(0);
  $("#kingcontainer").hide();
  $("#hardmode").empty();
  $("#hardmode").append("Completed Wave 6 or higher Hardmode");
  $("#ironcontainer").show();
  $("#ironmann").prop('checked', true);
  $("#att").show();
  $("#heal").show();
  $("#def").show();
  $("#col").show();
  $("#roles").show();
  $("#ba").val("none");
  $("#ba_container").show();
  $("#enhancer_h").val(0);
  $("#enhancer").val(0);
  $("#enhancercontainer").show();
  $("#pointsrequest").html("Request this leech");
  $("#pointsrequest").attr("disabled", true);
}

function updateunlock() {
  var unlock = 0;
  switch ($("#ba").val()) {
    case "none":
      unlock = 0;
      break;
    case "queen":
      unlock = 1;
      break;
    case "hardmode":
      unlock = 2;
      break;
    default:
      unlock = 3;
      break;
  }
  $("#unlockstatus").val(unlock);
}

function calculateking(ironman) {
  var cost = 0;
  var unlock = parseInt($("#unlockstatus").val());
  switch (unlock) {
    case 0:
      cost = cost + QUEEN + FULL_HM_UNLOCK + KING;
      updateunlock(1);
      $("#breakdown").append("1x&nbsp; 1-10NM &nbsp;" + commaSeparateNumber(QUEEN));
      $("#breakdown").append($(document.createElement('br')));
      break;
    case 1:
      cost = cost + FULL_HM_UNLOCK + KING;
      updateunlock(2);
      break;
    default:
      cost = cost + KING;
      updateunlock(3);
  }
  return cost;
}

function calculatepoints(needApoints, needDpoints, needCpoints, needHpoints, ironman) {
  var cost = 0;
  $("#breakdown").append("Attacker role");
  $("#breakdown").append($(document.createElement('br')));
  cost = cost + calculateP(needApoints, 'a', $("#unlockstatus").val(), ironman);
  $("#excess").val(parseInt($("#excess").val()) + parseInt($("#actual").val()) - needApoints); //works out how much excess points there are
  $("#breakdown").append($(document.createElement('br')));
  $("#breakdown").append($(document.createElement('br')));
  $("#breakdown").append("Collector role");
  $("#breakdown").append($(document.createElement('br')));
  $("#actual").val(0);
  if (parseInt($("#excess").val()) > 180 && !ironman) {
    $("#breakdown").append("Using points from spare waves from other roles");
    $("#breakdown").append($(document.createElement('br')));
  }
  while (parseInt($("#excess").val()) > 180 && !ironman) {
    $("#excess").val(parseInt($("#excess").val()) - 180);
    needCpoints -= 180;
  }
  if (parseInt($("#excess").val()) > HMCOL && ironman) {
    $("#breakdown").append("Using points from spare waves from other roles");
    $("#breakdown").append($(document.createElement('br')));
  }
  while (parseInt($("#excess").val()) > HMCOL && ironman) {
    $("#excess").val(parseInt($("#excess").val()) - HMCOL);
    needCpoints -= HMCOL;
  }
  cost = cost + calculateP(needCpoints, 'c', $("#unlockstatus").val(), ironman);
  $("#excess").val(parseInt($("#excess").val()) + parseInt($("#actual").val()) - needCpoints); //works out how much excess points there are
  $("#breakdown").append($(document.createElement('br')));
  $("#breakdown").append($(document.createElement('br')));
  $("#breakdown").append("Defender role");
  $("#breakdown").append($(document.createElement('br')));
  $("#actual").val(0);
  if (parseInt($("#excess").val()) > 250 && !ironman) {
    $("#breakdown").append("Using points from spare waves from other roles");
    $("#breakdown").append($(document.createElement('br')));
  }
  while (parseInt($("#excess").val()) > 250 && !ironman) {
    $("#excess").val(parseInt($("#excess").val()) - 250);
    needDpoints -= 250;
  }
  if (parseInt($("#excess").val()) > HMDEF && ironman) {
    $("#breakdown").append("Using points from spare waves from other roles");
    $("#breakdown").append($(document.createElement('br')));
  }
  while (parseInt($("#excess").val()) > HMDEF && ironman) {
    $("#excess").val(parseInt($("#excess").val()) - HMDEF);
    needDpoints -= HMDEF;
  }
  cost = cost + calculateP(needDpoints, 'd', $("#unlockstatus").val(), ironman);
  $("#excess").val(parseInt($("#excess").val()) + parseInt($("#actual").val()) - needDpoints); //works out how much excess points there are
  $("#breakdown").append($(document.createElement('br')));
  $("#breakdown").append($(document.createElement('br')));
  $("#breakdown").append("Healer role");
  $("#breakdown").append($(document.createElement('br')));
  $("#actual").val(0);
  if (parseInt($("#excess").val()) > 230 && !ironman) {
    $("#breakdown").append("Using points from spare waves from other roles");
    $("#breakdown").append($(document.createElement('br')));
  }
  while (parseInt($("#excess").val()) > 230 && !ironman) {
    $("#excess").val(parseInt($("#excess").val()) - 230);
    needHpoints -= 230;
  }
  if (parseInt($("#excess").val()) > HMHEAL && ironman) {
    $("#breakdown").append("Using points from spare waves from other roles");
    $("#breakdown").append($(document.createElement('br')));
  }
  while (parseInt($("#excess").val()) > HMHEAL && ironman) {
    $("#excess").val(parseInt($("#excess").val()) - HMHEAL);
    needHpoints -= HMHEAL;
  }
  cost = cost + calculateP(needHpoints, 'h', $("#unlockstatus").val(), ironman);
  $("#excess").val(parseInt($("#excess").val()) + parseInt($("#actual").val()) - needHpoints); //works out how
  return cost;
}

//calculates the amount of points from kings
function calculateinsignia(points, role, kingskilled) {
  var NM = 0;
  var PHM = 0;
  var FHM = 0;
  switch (role) {
    case 'a':
      NM = NMATT;
      PHM = PHMATT;
      FHM = HMATT;
      break;
    case 'd':
      NM = NMDEF;
      PHM = PHMDEF;
      FHM = HMDEF;
      break;
    case 'c':
      NM = NMCOL;
      PHM = PHMCOL;
      FHM = HMCOL;
      break;
    case 'h':
      NM = NMHEAL;
      PHM = PHMHEAL;
      FHM = HMHEAL;
      break;
  }
  var cost = 0;
  var newunlock = $("#unlockstatus").val();
  var temp = points;
  var pointsneeded = points;
  if (newunlock == 0) {
    temp = temp - NM;
    newunlock = 1;
    $("#breakdown").append("1x&nbsp; 1-10NM &nbsp;" + commaSeparateNumber(QUEEN));
    $("#breakdown").append($(document.createElement('br')));
    $("#unlockstatus").val(1);
    $("#actual").val(parseInt($("#actual").val()) + NM);
    cost = cost + QUEEN;
  }
  if (newunlock == 1) {
    temp = temp - FHM;
    newunlock = 2;
    $("#breakdown").append("1x&nbsp; 1-9HM &nbsp;" + commaSeparateNumber(FULL_HM_UNLOCK));
    $("#breakdown").append($(document.createElement('br')));
    $("#unlockstatus").val(2);
    $("#actual").val(parseInt($("#actual").val()) + FHM);
    cost = cost + FULL_HM_UNLOCK;
  }
  if (newunlock >= 2) {
    var rounds = 5 - kingskilled;
    temp = temp - rounds * KINGP;
    $("#breakdown").append(rounds + "x&nbsp; King &nbsp;" + commaSeparateNumber(rounds * KING));
    $("#breakdown").append($(document.createElement('br')));
    $("#unlockstatus").val(2);
    $("#actual").val(parseInt($("#actual").val()) + rounds * KINGP);
    cost = cost + rounds * KING;
    cost = cost + calculateP(temp, role, newunlock, false);
  }
  $("#excess").val(parseInt($("#actual").val()) - pointsneeded);
  return cost;
}

function calculateP(points, role, unlock, ironman) {
  if (points <= 0) return 0; //sanity check

  var NM = 0;
  var PHM = 0;
  var FHM = 0;
  switch (role) {
    case 'a':
      NM = NMATT;
      PHM = PHMATT;
      FHM = HMATT;
      break;
    case 'd':
      NM = NMDEF;
      PHM = PHMDEF;
      FHM = HMDEF;
      break;
    case 'c':
      NM = NMCOL;
      PHM = PHMCOL;
      FHM = HMCOL;
      break;
    case 'h':
      NM = NMHEAL;
      PHM = PHMHEAL;
      FHM = HMHEAL;
      break;
  }
  if (unlock == 0) {
    var temp = points - NM;
    $("#breakdown").append("1x&nbsp; 1-10NM &nbsp;" + commaSeparateNumber(QUEEN));
    $("#breakdown").append($(document.createElement('br')));
    $("#unlockstatus").val(1);
    $("#actual").val(parseInt($("#actual").val()) + NM);
    return QUEEN + calculateP(temp, role, 1, ironman); //rerun but now hm is unlocked
  }
  if (ironman) {
    var rounds = calculateFullRounds(points, FHM, ironman);
    $("#breakdown").append(rounds + "x&nbsp; 1-9HM &nbsp;" + commaSeparateNumber(rounds * IRON_POINTS));
    $("#breakdown").append($(document.createElement('br')));
    $("#unlockstatus").val(2);
    return rounds * IRON_POINTS;
  }
  if (unlock == 1) {
    var rounds = calculateFullRounds(points, FHM, ironman);
    var temp = points - rounds * FHM;
    $("#breakdown").append(rounds + "x&nbsp; 1-9HM &nbsp;" + commaSeparateNumber(rounds * FULL_HM_UNLOCK));
    $("#breakdown").append($(document.createElement('br')));
    $("#unlockstatus").val(2);
    return rounds * FULL_HM_UNLOCK + calculateP(temp, role, 2, ironman);
  }
  if (unlock >= 2) {
    //everything is unlocked
    var enhancer = $("#enhancer_h").val()
    if (enhancer > 0) {
      $("#breakdown").append("---Enhancer charges would be used here");
      $("#breakdown").append($(document.createElement('br')));
    }
    var rounds = calculateRounds(points, PHM);
    $("#breakdown").append(rounds + "x&nbsp; 6-9HM &nbsp;" + commaSeparateNumber(rounds * POINTS_PART));
    return POINTS_PART * rounds;
  }
}

function calculateFullRounds(points, FHM, ironman) {
  //the amount of rounds of 1-9s needed (if ironman)
  if (!ironman) return 1;
  var rounds = 1;
  var roundpoints = FHM;
  if ($("#enhancer_h").val() > 0) {
    //only consume 4 charges
    roundpoints = parseInt((roundpoints) + (roundpoints * Math.min($("#enhancer_h").val(), 9)) / 9);
    $("#enhancer_h").val(Math.max($("#enhancer_h").val() - 9, 0));
  }
  if ($("#excess").val() > points) {
    return 0;
  }
  //add to
  $("#actual").val(parseInt($("#actual").val()) + (roundpoints));

  if (points - roundpoints <= 0) {
    return rounds;
  }
  return rounds + calculateFullRounds(points - roundpoints, FHM, ironman);
}

function calculateRounds(points, PHM) {
  //the amount of rounds of 6-9s needed
  var rounds = 1;
  //enhancers
  var roundpoints = PHM;
  if (points < 0) {
    return rounds;
  }
  if ($("#enhancer_h").val() > 0) {
    //only consume 4 charges
    roundpoints = parseInt((roundpoints) + (roundpoints * Math.min($("#enhancer_h").val(), 4)) / 4);
    $("#enhancer_h").val(Math.max($("#enhancer_h").val() - 4, 0));
  }
  //check excess
  if ($("#excess").val() > points) {
    return 0;
  }
  //add to
  $("#actual").val(parseInt($("#actual").val()) + (roundpoints));
  if (points - roundpoints <= 0) {
    return rounds;
  }
  return rounds + calculateRounds(points - roundpoints, PHM);
}

function submitform(button) {
  //e.preventDefault(); //Prevent the normal submission action
  if (button.id == "xprequest") {
    if ($("#rsn").val() == "") {
      alert("Please fill in your rsn");
      return;
    }
  }
  if (button.id == "pointsrequest") {
    if ($("#points_rsn").val() == "") {
      alert("Please fill in your rsn");
      return;
    }
  }

  //ask for confirmation
  if (!confirm('Confirm: do you wish to request this leech?')) {
    return;
  }
  button.disabled = true;
  button.innerHTML = "Please wait...";
  var form = $(button).parents('form:first');

  //encode inputs
  $("#points_rsn").val(encode($("#points_rsn").val()));
  $("#rsn").val(encode($("#rsn").val()));
  form.submit();
}

//showing tabs
function openTab(evt, tabname) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the link that opened the tab
  document.getElementById(tabname).style.display = "block";
  if (evt) evt.currentTarget.className += " active";
}

function showtab(option) {
  switch (option) {
    case 1:
      //nm
      openTab("", 'Points');
      $("#pointstab").addClass("active");
      $("#presets").val("nm");
      break;
    case 2:
      //king
      openTab("", 'Points');
      $("#presets").val("king");
      $("#pointstab").addClass("active");

  }
  //defaults
  reset();
  loadpreset();
}

function encode(str) {
  var badwords = ["poker"];
  var encoded = str;
  for (var i = 0; i < badwords.length; i++) {
    var badword = badwords[i];
    if ((str.toLowerCase()).includes(badword)) {
      //encode it, include a backslash somewhere
      var pos = str.indexOf(badword) + 1;
      encoded = [str.slice(0, pos), "/", str.slice(pos)].join('');
    }
  }
  return encoded;
}
