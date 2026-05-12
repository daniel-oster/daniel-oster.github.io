import { useState, useEffect, useCallback, useRef } from "react";

// ─── Audio ───────────────────────────────────────────────────
function tone(ctx, freq, t0, dur, vol, type) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + t0);
  g.gain.setValueAtTime(0, ctx.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
  osc.start(ctx.currentTime + t0);
  osc.stop(ctx.currentTime + t0 + dur + 0.05);
}
// Two punchy ascending beeps — "GO!"
function sndGo(ctx) {
  tone(ctx, 880,  0,    0.08, 0.4, 'square');
  tone(ctx, 1100, 0.10, 0.12, 0.4, 'square');
}
// Soft descending tones — "rest"
function sndRest(ctx) {
  tone(ctx, 660, 0,    0.15, 0.3, 'sine');
  tone(ctx, 440, 0.20, 0.25, 0.25,'sine');
}
// Gentle tick — end of prep countdown (last 5s before work starts)
function sndPrepTick(ctx) { tone(ctx, 440, 0, 0.06, 0.18, 'sine'); }
// Sharper tick — end of work countdown (last 5s before rest/next)
function sndEndTick(ctx)  { tone(ctx, 700, 0, 0.06, 0.18, 'triangle'); }
// Rising arpeggio — session complete
function sndDone(ctx) {
  [523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, i * 0.13, 0.12, 0.3, 'sine'));
}

const css = `
:root{
  --bg:#f7f5f1;--text:#2d2a26;--muted:#999;--faint:#bbb;
  --card:#fff;--card-b:#e8e4de;--card-hb:#f0ede8;
  --tab:#fff;--tab-t:#555;--bar:#e0ddd8;--ptrack:#f0ede8;
  --legend:#fff;--pb-bg:#fff8e6;--pb-bdr:#f0dfa0;
  --row-p:#e8eaf6;--row-w:#fff0ed;--row-r:#e8f8ec;
  --row-ck:#f5f4f1;--row-ws:#fef8f7;--row-d:#fff;
  --dp:#dde0f5;--dw:#fde2dc;--dr:#d4f0da;--dt:#333;
  --chk:#d0cdc8;--exp:#bbb;--tmeta:#999;
  --cwu:#fef7e6;--cws:#fce8e6;--cmob:#e8f5ec;--cstr:#fde8db;--ccd:#f0ecf6;
  --tbm:#ddf0e3;--tbs:#fde0ce;
  --ptag:#e8eaf6;--ptag-t:#3949ab;
}
:root.dark{
  --bg:#181614;--text:#e0dbd4;--muted:#666;--faint:#444;
  --card:#242220;--card-b:#3a3835;--card-hb:#2e2c28;
  --tab:#2a2825;--tab-t:#aaa;--bar:#3a3835;--ptrack:#2e2c28;
  --legend:#242220;--pb-bg:#261e08;--pb-bdr:#4a3c10;
  --row-p:#1a1c30;--row-w:#281210;--row-r:#0c2016;
  --row-ck:#1c1a16;--row-ws:#1e1816;--row-d:#242220;
  --dp:#1a1c30;--dw:#281210;--dr:#0c2016;--dt:#c8c0b8;
  --chk:#4a4845;--exp:#555;--tmeta:#666;
  --cwu:#261e08;--cws:#2a1510;--cmob:#0e2418;--cstr:#261508;--ccd:#1a1530;
  --tbm:#0e2820;--tbs:#2a1808;
  --ptag:#1a1c30;--ptag-t:#7986cb;
}
body{background:var(--bg);}
`;

const D = {
march:"Stå rakt, marschera på stället med knäna till bekväm höjd. Svinga armarna naturligt. Andas in genom näsan, ut genom munnen.",
ankleC:"Stå på ett ben nära vägg/stol. Lyft andra foten, rotera vristen — 5 varv medsols, 5 motsols. Byt ben.",
hipC:"Händer på höfterna, fötter axelbrett. Rotera höfterna i stora cirklar — 5 åt varje håll.",
legSw:"Håll i vägg/stol. Svinga ett ben fram och bak, 5–8 svingar. Byt ben.",
catCow:"Fötter höftbrett, händer på låren. Inandning: svanka (ko). Utandning: runda ryggen (katt). 4–5 ggr.",
wuSq:"6–8 långsamma, lätta knäböj. Bekvämt djup — öppna höfter och knän.",
qStr:"Stå, ta tag i en vrist bakom dig, dra hälen mot skinkan. Knäna ihop. Vägg för balans. 20 sek per sida.",
hStr:"Sträck ett ben framåt, hälen i golvet, tårna upp. Böj framåt med rak rygg tills du känner stretch. 20 sek per sida.",
breath:"Andas in 4 sek genom näsan, håll 2 sek, ut 6 sek genom munnen. Släpp all spänning i axlarna. Denna andningsteknik (6 andetag/min) kan sänka blodtryck ~5–7 mmHg om du gör den dagligen i 10 min.",
ws:"Rygg mot vägg, fötter ~60 cm ut. Glid ner (börja vid 120–135° i knäna, sikta mot 90° i v3–4). Rygg, axlar och huvud pressade mot väggen. ANDAS LUGNT — håll inte andan! Det är viktigt för blodtryckseffekten. Räkna bakåt från 120 eller lyssna på podd/musik. Det ska bränna ordentligt i låren men inte vara panik.",
hipFl:"Knästående utfallsposition — ett knä på golvet (lägg en handduk under för komfort). Skjut höften framåt tills du känner stretch i framsidan av höften på det bakre benet. Kläm ihop skinkan på den sträckta sidan för djupare stretch. Håll bålen upprätt. 45 sek per sida.",
nn:"Sitt på golvet. Framben: höft och knä i 90°, smalben utåt. Bakben: höft och knä i 90°, smalben bakåt. Sitt rakt och luta dig försiktigt framåt över frambenets smalben. Denna övning öppnar höftens inåt- och utåtrotation. 45 sek per sida.",
dsqH:"Sjunk ner i en djup knäböj med fötterna axelbrett, tårna utåt. Tryck armbågarna mot insidan av knäna för att öppna höfterna. Håll bröstet upprätt. Om hälarna lyfter: ställ dem på en bok eller hoprullad handduk. Andas djupt och slappna av i höfterna. 60 sek.",
pig:"Från alla fyra: dra höger knä framåt mot höger hand. Lägg smalbenet snett framför dig (behöver inte vara parallellt — anpassa). Sträck vänster ben rakt bakåt. Sjunk ner och känn stretch djupt i höger skinka. 50 sek per sida.",
ccF:"På alla fyra, händer under axlar, knän under höfter. Inandning: svanka ryggen, lyft bröstet och svanskotan (ko). Utandning: runda ryggen uppåt som en katt, tryck händer mot golvet, fäll hakan. Rör dig långsamt — en hel andning per rörelse. 8–10 repetitioner.",
tN:"På alla fyra. Sträck höger arm mot taket (inandning), vrid bröstkorgen uppåt och öppna bröstet. Utandning: trä höger arm under kroppen till vänster, sänk höger axel mot golvet. Känn rotationen i övre ryggen (bröstryggen). 6 per sida.",
spTw:"Ligg på rygg, knän böjda. Fäll båda knäna till höger mot golvet. Sträck vänster arm rakt ut åt sidan. Håll axlarna mot golvet. Andas djupt och sjunk djupare in i vridningen för varje utandning. 50 sek per sida.",
thExt:"Ligg på rygg med en hoprullad handduk tvärs under övre ryggen (i höjd med skulderbladen). Knän böjda, fötter i golvet. Lägg händerna bakom huvudet. Låt övre ryggen böjas bakåt över handduken. Andas in och låt bröstkorgen öppna sig. 60 sek.",
wG:"\"Världens bästa stretch\": Stort utfallssteg framåt med höger fot. Placera vänster hand i golvet innanför höger fot. Rotera höger arm uppåt mot taket — följ handen med blicken. Känn stretch i höft, bröst och övre rygg. Tillbaka och byt sida. 5 per sida.",
cos:"Bred ställning. Sjunk ner åt höger i en djup sidoknäböj — håll vänster ben rakt. Bröst upprätt. Gå bara så djupt du kan med bra form. Bra för höftrörlighet och innerlårsflexibilitet. Byt sida. 5 per sida.",
scorp:"Ligg på mage, armar utsträckta åt sidorna (T-form). Böj höger knä och försök nå höger fot mot vänster hand bakom ryggen. Håll axlarna så platta mot golvet som möjligt. Känn stretch i höftböjare och bröst. 5 per sida.",
fig4:"Stå nära vägg/stol för balans. Lägg höger vrist ovanpå vänster knä (som en fyra). Böj stående benet och sjunk ner som i en halv knäböj. Tryck försiktigt höger knä utåt. Känn stretch djupt i höger skinka. 40 sek per sida.",
sq:"Fötter axelbrett, tår lätt utåt. Knäp händer vid bröstet. Spänn magen. Tryck höfterna bakåt och böj knäna tills låren är parallella med golvet (eller så djupt du kan med bra form). Driv genom hälarna för att resa dig. Bröst upprätt, knän i linje med tårna, vikten på mittfot och hälar.",
rL:"Stå rakt, fötter höftbrett. Kliv ett ben bakåt ca 60–90 cm. Böj båda knäna till ca 90°. Framknä rakt ovanför vristen, bakknä svävar strax ovanför golvet. Tryck genom framfotens häl för att resa dig. Fötter på \"tågspår\" (höftbrett isär) — inte på lina.",
gB:"Ligg på rygg, knän böjda, fötter platt i golvet höftbrett. Luta bäckenet för att platta ryggen mot golvet. Kläm ihop skinkorna och tryck höfterna uppåt tills kroppen bildar en rak linje från knä till axlar. Håll 1–2 sek i toppen. Driv genom hälarna — inte tårna.",
wSit:"Rygg mot vägg, fötter ca 60 cm ut. Glid ner tills låren är parallella med golvet. Huvud, axlar och rygg pressade mot väggen. Armar korsade över bröstet (INTE på låren). Andas stadigt. Håll hela tiden.",
cR:"Stå nära vägg, fötter höftbrett. Press genom framfötterna och lyft hälarna så högt det går. Kläm vaderna 1–2 sek i toppen. Sänk långsamt och kontrollerat. Magen inåt, rör dig rakt uppåt utan att luta.",
lL:"Stå rakt, fötter ihop. Ta ett stort kliv åt höger. Tryck höfterna bakåt, böj höger knä medan vänster ben hålls rakt. Bröst upp, fot platt mot golvet. Tryck tillbaka till start. Alternera sidor.",
dB:"Ligg på rygg, armar rakt mot taket, ben i bordsskiva, höfter och knän i 90°. PRESSA NEDRE RYGGEN HÅRT MOT GOLVET — det viktigaste. Sträck höger arm bakåt + vänster ben framåt samtidigt — bara så långt ryggen förblir platt. Tillbaka till start. Byt sida. Andas ut vid utsträckning.",
bM:"Börja i glute bridge-position med höfterna lyfta högt. Driv ett knä mot bröstet (lyft foten från golvet). Tillbaka, byt ben direkt. Höfterna ska vara i nivå och lyfta hela tiden — inte sjunka eller vridas mellan marscherna.",
gM:"Stå med fötter höftbrett, knän lätt böjda. Armar korsade över bröstet. Böj framåt från höfterna — tryck rumpan bakåt som att stänga en bildörr bakom dig. Sänk överkroppen tills du känner stretch i bakre låren. Rygg rak, knäböjning fixerad. Driv höfterna framåt genom skinkorna.",
bC:"Ligg på rygg, fingertoppar vid öronen (dra inte i nacken). Lyft huvud och axlar. Sträck höger ben ut rakt och dra vänster knä in — vrid överkroppen så höger armbåge rör sig mot vänster knä. Byt sida. Rotationen kommer från revbenen och magen, inte nacken.",
sup:"Ligg på mage. AXELVÄNLIGT: håll armarna längs sidorna med handflatorna uppåt (inte utsträckta framåt). Lyft bröst och ben från golvet. Kläm ihop skinkorna hårt. Håll 2–3 sek i toppen. Sänk med kontroll. Titta ner i mattan — böj inte nacken uppåt.",
hB:"Ligg platt på rygg. Pressa nedre ryggen i golvet. Lyft benen 5–10 cm (tår spetsade) och axelbladen från golvet. Kroppen bildar en bananform. Om ryggen lyfter: böj knäna eller lyft benen högre. Andas stadigt — inte hålla andan.",
suSq:"Fötter bredare än axelbrett, tår utåt ca 45°. Händer vid bröstet. Tryck knäna utåt i tårnas riktning. Sänk tills låren är parallella. Driv genom hälarna. Bål upprätt. Fokuserar extra på innerlår och skinkor.",
cL:"Stå höftbrett. Kliv höger fot bakåt och bakom vänster ben diagonalt — som en nigning. Böj båda knäna, framknä ca 90°. Bål upprätt, magen hårt spänd. Tryck genom framfotens häl. Gå långsamt — balansen är utmaningen här.",
slB:"Som vanlig glute bridge men sträck ett ben rakt upp mot taket (eller håll knät mot bröstet). Driv genom den planterade fotens häl. HÅLL HÖFTERNA RAKA — vanligaste felet är att den osupporterade sidan sjunker. 20 sek per sida.",
rT:"Sitt med knän böjda. Luta bakåt till 45° — V-form med bål och lår. Knäpp händerna vid bröstet. Vrid hela överkroppen höger, händerna mot golvet vid höger höft. Tillbaka till mitten, vrid vänster. Hela bröstet och axlarna roterar — inte bara armarna.",
pSq:"Sjunk ner i knäböj. Istället för att resa dig helt: res dig bara 10 cm, sänk igen. Pulsera utan att låsa knäna. Bröst upp, knän utåt. Konstant spänning = bränner ordentligt.",
};

const PREP_SEC = 15;

const WU = [
{ id:"w1", name:"Marsch på stället", cat:"warmup", ws:30, rs:0, d:D.march },
{ id:"w2", name:"Vristcirklar", cat:"warmup", ws:20, rs:0, d:D.ankleC },
{ id:"w3", name:"Höftcirklar", cat:"warmup", ws:20, rs:0, d:D.hipC },
{ id:"w4", name:"Bensvingar", cat:"warmup", ws:20, rs:0, d:D.legSw },
{ id:"w5", name:"Stående katt-ko", cat:"warmup", ws:30, rs:0, d:D.catCow },
{ id:"w6", name:"Lätta knäböj", cat:"warmup", ws:30, rs:0, d:D.wuSq },
];
const CD = [
{ id:"c1", name:"Främre lårstretch", cat:"cooldown", ws:40, rs:0, d:D.qStr },
{ id:"c2", name:"Bakre lårstretch", cat:"cooldown", ws:40, rs:0, d:D.hStr },
{ id:"c3", name:"Andning (BP-sänkande)", cat:"cooldown", ws:30, rs:0, d:D.breath },
];

const WKS = [
{ num:1, ph:"Grund", days:[
{ label:"Dag 1", title:"A1 — Wall Squats + Höfter", type:"mobility", rnds:1, exercises:[
{ id:"1a1",name:"Wall squat — set 1",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"1a2",name:"Höftböjarstretch",cat:"mobility",ws:90,rs:0,d:D.hipFl},
{ id:"1a3",name:"Wall squat — set 2",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"1a4",name:"90/90 höftrotation",cat:"mobility",ws:90,rs:0,d:D.nn},
{ id:"1a5",name:"Wall squat — set 3",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"1a6",name:"Djup knäböj-hold",cat:"mobility",ws:60,rs:0,d:D.dsqH},
{ id:"1a7",name:"Wall squat — set 4",cat:"wallsquat",ws:120,rs:0,d:D.ws},
]},
{ label:"Dag 2", title:"B1 — Underkropp", type:"strength", rnds:2, exercises:[
{ id:"1b1",name:"Knäböj",cat:"strength",ws:40,rs:15,d:D.sq},
{ id:"1b2",name:"Bakåtutfall",cat:"strength",ws:40,rs:15,d:D.rL},
{ id:"1b3",name:"Glute bridge",cat:"strength",ws:40,rs:15,d:D.gB},
{ id:"1b4",name:"Vägg-sit",cat:"strength",ws:40,rs:15,d:D.wSit},
{ id:"1b5",name:"Tåhävningar",cat:"strength",ws:40,rs:15,d:D.cR},
{ id:"1b6",name:"Sidoutfall",cat:"strength",ws:40,rs:15,d:D.lL},
]},
{ label:"Dag 3", title:"A2 — Wall Squats + Rygg", type:"mobility", rnds:1, exercises:[
{ id:"1c1",name:"Wall squat — set 1",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"1c2",name:"Katt-ko på golvet",cat:"mobility",ws:90,rs:0,d:D.ccF},
{ id:"1c3",name:"Wall squat — set 2",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"1c4",name:"Trä nålen (bröstrygg)",cat:"mobility",ws:90,rs:0,d:D.tN},
{ id:"1c5",name:"Wall squat — set 3",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"1c6",name:"Liggande ryggvridning",cat:"mobility",ws:100,rs:0,d:D.spTw},
{ id:"1c7",name:"Wall squat — set 4",cat:"wallsquat",ws:120,rs:0,d:D.ws},
]},
]},
{ num:2, ph:"Grund", days:[
{ label:"Dag 1", title:"B2 — Mage & baksida", type:"strength", rnds:2, exercises:[
{ id:"2a1",name:"Dead bug",cat:"strength",ws:40,rs:15,d:D.dB},
{ id:"2a2",name:"Glute bridge-marsch",cat:"strength",ws:40,rs:15,d:D.bM},
{ id:"2a3",name:"Good morning",cat:"strength",ws:40,rs:15,d:D.gM},
{ id:"2a4",name:"Cykelcrunch",cat:"strength",ws:40,rs:15,d:D.bC},
{ id:"2a5",name:"Superman",cat:"strength",ws:40,rs:15,d:D.sup},
{ id:"2a6",name:"Hollow body hold",cat:"strength",ws:40,rs:15,d:D.hB},
]},
{ label:"Dag 2", title:"A3 — Wall Squats + Helkropp", type:"mobility", rnds:1, exercises:[
{ id:"2b1",name:"Wall squat — set 1",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"2b2",name:"Världens bästa stretch",cat:"mobility",ws:100,rs:0,d:D.wG},
{ id:"2b3",name:"Wall squat — set 2",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"2b4",name:"Kosackknäböj",cat:"mobility",ws:100,rs:0,d:D.cos},
{ id:"2b5",name:"Wall squat — set 3",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"2b6",name:"Skorpionstretch",cat:"mobility",ws:100,rs:0,d:D.scorp},
{ id:"2b7",name:"Wall squat — set 4",cat:"wallsquat",ws:120,rs:0,d:D.ws},
]},
{ label:"Dag 3", title:"B3 — Helkroppscirkel", type:"strength", rnds:2, exercises:[
{ id:"2c1",name:"Sumoknäböj",cat:"strength",ws:40,rs:15,d:D.suSq},
{ id:"2c2",name:"Nignings-utfall",cat:"strength",ws:40,rs:15,d:D.cL},
{ id:"2c3",name:"Enbensbro",cat:"strength",ws:40,rs:15,d:D.slB},
{ id:"2c4",name:"Rysk twist",cat:"strength",ws:40,rs:15,d:D.rT},
{ id:"2c5",name:"Good morning",cat:"strength",ws:40,rs:15,d:D.gM},
{ id:"2c6",name:"Dead bug",cat:"strength",ws:40,rs:15,d:D.dB},
{ id:"2c7",name:"Pulsknäböj",cat:"strength",ws:30,rs:0,d:D.pSq},
]},
]},
{ num:3, ph:"Progression", days:[
{ label:"Dag 1", title:"A1 — Höfter ↑", type:"mobility", rnds:1, prog:"Djupare wall squat. Duvstretch ny.", exercises:[
{ id:"3a1",name:"Wall squat (djupare)",cat:"wallsquat",ws:120,rs:0,d:D.ws+" PROGRESSION: Sjunk 5–10 cm djupare."},
{ id:"3a2",name:"Höftböjarstretch",cat:"mobility",ws:100,rs:0,d:D.hipFl},
{ id:"3a3",name:"Wall squat — set 2",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"3a4",name:"Duvstretch",cat:"mobility",ws:100,rs:0,d:D.pig},
{ id:"3a5",name:"Wall squat — set 3",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"3a6",name:"Djup knäböj-hold",cat:"mobility",ws:90,rs:0,d:D.dsqH},
{ id:"3a7",name:"Wall squat — set 4",cat:"wallsquat",ws:120,rs:0,d:D.ws},
]},
{ label:"Dag 2", title:"B1 — Underkropp ↑", type:"strength", rnds:2, prog:"3s excentrisk. Pulsknäböj bonus.", exercises:[
{ id:"3b1",name:"Knäböj (3s ner)",cat:"strength",ws:40,rs:15,d:D.sq+" PROG: Sänk i 3 sek."},
{ id:"3b2",name:"Bakåtutfall (3s ner)",cat:"strength",ws:40,rs:15,d:D.rL+" PROG: Sänk i 3 sek."},
{ id:"3b3",name:"Enbensbro",cat:"strength",ws:40,rs:15,d:D.slB},
{ id:"3b4",name:"Vägg-sit",cat:"strength",ws:40,rs:15,d:D.wSit},
{ id:"3b5",name:"Tåhävningar",cat:"strength",ws:40,rs:15,d:D.cR},
{ id:"3b6",name:"Sidoutfall",cat:"strength",ws:40,rs:15,d:D.lL},
{ id:"3b7",name:"Pulsknäböj (bonus)",cat:"strength",ws:30,rs:0,d:D.pSq},
]},
{ label:"Dag 3", title:"A2 — Rygg ↑", type:"mobility", rnds:1, prog:"Bröstrygg-extension ny. Längre holds.", exercises:[
{ id:"3c1",name:"Wall squat (djupare)",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"3c2",name:"Bröstrygg-extension",cat:"mobility",ws:100,rs:0,d:D.thExt},
{ id:"3c3",name:"Wall squat — set 2",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"3c4",name:"Trä nålen (fler reps)",cat:"mobility",ws:100,rs:0,d:D.tN},
{ id:"3c5",name:"Wall squat — set 3",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"3c6",name:"Liggande ryggvridning",cat:"mobility",ws:110,rs:0,d:D.spTw},
{ id:"3c7",name:"Wall squat — set 4",cat:"wallsquat",ws:120,rs:0,d:D.ws},
]},
]},
{ num:4, ph:"Progression", days:[
{ label:"Dag 1", title:"B2 — Mage & baksida ↑", type:"strength", rnds:2, prog:"3s paus dead bug. Långsam crunch. Hollow body hel.", exercises:[
{ id:"4a1",name:"Dead bug (3s paus)",cat:"strength",ws:40,rs:15,d:D.dB+" PROG: Håll 3 sek utsträckt."},
{ id:"4a2",name:"Glute bridge-marsch",cat:"strength",ws:40,rs:15,d:D.bM},
{ id:"4a3",name:"Good morning",cat:"strength",ws:40,rs:15,d:D.gM},
{ id:"4a4",name:"Cykelcrunch (långsam)",cat:"strength",ws:40,rs:15,d:D.bC+" PROG: 2 sek per sida."},
{ id:"4a5",name:"Superman",cat:"strength",ws:40,rs:15,d:D.sup},
{ id:"4a6",name:"Hollow body (hel)",cat:"strength",ws:40,rs:15,d:D.hB},
]},
{ label:"Dag 2", title:"A3 — Helkropp ↑", type:"mobility", rnds:1, prog:"Figur-4 ny. Djupare kosack.", exercises:[
{ id:"4b1",name:"Wall squat (mot 90°)",cat:"wallsquat",ws:120,rs:0,d:D.ws+" PROG: Sikta mot 90° vinkel."},
{ id:"4b2",name:"Världens bästa stretch",cat:"mobility",ws:110,rs:0,d:D.wG},
{ id:"4b3",name:"Wall squat — set 2",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"4b4",name:"Stående figur-4",cat:"mobility",ws:90,rs:0,d:D.fig4},
{ id:"4b5",name:"Wall squat — set 3",cat:"wallsquat",ws:120,rs:0,d:D.ws},
{ id:"4b6",name:"Kosackknäböj (djupare)",cat:"mobility",ws:110,rs:0,d:D.cos+" PROG: Djupare, långsammare."},
{ id:"4b7",name:"Wall squat — set 4",cat:"wallsquat",ws:120,rs:0,d:D.ws},
]},
{ label:"Dag 3", title:"B3 — Helkropp ↑", type:"strength", rnds:2, prog:"Sumo 3s hold. Spark efter nigning. Fötter uppe twist.", exercises:[
{ id:"4c1",name:"Sumoknäböj (3s hold)",cat:"strength",ws:40,rs:15,d:D.suSq+" PROG: 3 sek i botten."},
{ id:"4c2",name:"Nigningsutfall + spark",cat:"strength",ws:40,rs:15,d:D.cL+" PROG: Sidospark efter varje rep."},
{ id:"4c3",name:"Enbensbro",cat:"strength",ws:40,rs:15,d:D.slB},
{ id:"4c4",name:"Rysk twist (fötter uppe)",cat:"strength",ws:40,rs:15,d:D.rT+" PROG: Lyft fötterna från golvet."},
{ id:"4c5",name:"Good morning",cat:"strength",ws:40,rs:15,d:D.gM},
{ id:"4c6",name:"Dead bug",cat:"strength",ws:40,rs:15,d:D.dB},
{ id:"4c7",name:"Pulsknäböj (avslut)",cat:"strength",ws:30,rs:0,d:D.pSq},
]},
]},
];

const CC = {
warmup:{emoji:"🔥",color:"#b07d10",bg:"var(--cwu)",label:"Uppvärmning"},
wallsquat:{emoji:"🧱",color:"#b5362a",bg:"var(--cws)",label:"Wall squat"},
mobility:{emoji:"🌿",color:"#2e7d4f",bg:"var(--cmob)",label:"Rörlighet"},
strength:{emoji:"💪",color:"#d45b12",bg:"var(--cstr)",label:"Styrka"},
cooldown:{emoji:"🧊",color:"#7b68ae",bg:"var(--ccd)",label:"Nedvarvning"},
};
const TB = {
mobility:{emoji:"🧱🌿",color:"#2e7d4f",bg:"var(--tbm)",label:"Wall squat & Rörlighet"},
strength:{emoji:"⚡",color:"#d45b12",bg:"var(--tbs)",label:"Styrka"},
};

function buildSeq(day) {
  const s = [];
  WU.forEach((e,i) => s.push({...e, sec:"warmup", si:i}));
  for (let r=1; r<=(day.rnds||1); r++)
    day.exercises.forEach((e,i) => s.push({...e, sec:"main", si:i, rnd:r, tRnds:day.rnds||1}));
  CD.forEach((e,i) => s.push({...e, sec:"cooldown", si:i}));
  return s;
}

function calcTime(day) {
  let t=0;
  const seq = buildSeq(day);
  seq.forEach((e,i) => { if(i>0) t+=PREP_SEC; t+=e.ws+e.rs; });
  return t;
}

function fmt(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }

export default function App() {
  const [ck, setCk] = useState({});
  const [exp, setExp] = useState({});
  const [wk, setWk] = useState(0);
  const [loading, setLoading] = useState(true);
  const [T, setT] = useState(null);
  // Read dark pref synchronously to avoid flash
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("wt4-dark") === "1"; } catch(e) { return false; }
  });
  const tRef = useRef(null);
  const aRef = useRef(null);
  const audioRef = useRef(null);
  const prevTRef = useRef(null);

  function getCtx() {
    if (!audioRef.current)
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioRef.current.state === 'suspended') audioRef.current.resume();
    return audioRef.current;
  }

  useEffect(() => {
    (async()=>{try{const r=await window.storage.get("wt4-ck");if(r?.value)setCk(JSON.parse(r.value));}catch(e){}setLoading(false);})();
  },[]);

  // Sync dark class to <html> so CSS vars cascade to body too
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const save=useCallback(async n=>{try{await window.storage.set("wt4-ck",JSON.stringify(n));}catch(e){}},[]);

  const toggleDark = useCallback(() => {
    setDark(d => {
      const nd = !d;
      try { window.storage.set("wt4-dark", nd ? "1" : ""); } catch(e) {}
      return nd;
    });
  }, []);

  const tog=(w,d,eid)=>{const k=`${w}-${d}-${eid}`;setCk(p=>{const n={...p,[k]:!p[k]};save(n);return n;});};
  const togE=id=>setExp(p=>({...p,[id]:!p[id]}));
  const resetW=wi=>{setCk(p=>{const n={...p};Object.keys(n).forEach(k=>{if(k.startsWith(`${wi}-`))delete n[k];});save(n);return n;});};

  useEffect(()=>{
    if(!T||!T.run) return;
    if(T.tl>0){
      tRef.current=setTimeout(()=>setT(t=>({...t,tl:t.tl-1})),1000);
    } else {
      advance();
    }
    return ()=>clearTimeout(tRef.current);
  },[T]);

  useEffect(()=>{
    if(aRef.current) aRef.current.scrollIntoView({behavior:"smooth",block:"center"});
  },[T?.seqIdx,T?.phase]);

  // Sound effect — fires on every timer state change
  useEffect(() => {
    const prev = prevTRef.current;
    prevTRef.current = T;
    // Session just finished
    if (prev && !T) { try { sndDone(getCtx()); } catch(e) {} return; }
    if (!T || !T.run) return;
    // Phase transition
    const phaseChanged = !prev || prev.phase !== T.phase;
    if (phaseChanged) {
      if (T.phase === 'work') { try { sndGo(getCtx());   } catch(e) {} return; }
      if (T.phase === 'rest') { try { sndRest(getCtx()); } catch(e) {} return; }
      return; // prep: silent, countdown ticks will play
    }
    // Countdown ticks in last 5 seconds
    if (T.tl > 0 && T.tl <= 5) {
      try {
        if (T.phase === 'prep') sndPrepTick(getCtx());
        else if (T.phase === 'work') sndEndTick(getCtx());
      } catch(e) {}
    }
  }, [T]);

  function startDay(di) {
    const seq=buildSeq(WKS[wk].days[di]);
    setT({dayIdx:di, seqIdx:0, phase:"work", tl:seq[0].ws, run:true, seq});
  }

  function advance() {
    setT(t=>{
      if(!t) return null;
      const cur=t.seq[t.seqIdx];
      if(t.phase==="prep") return {...t, phase:"work", tl:cur.ws};
      if(t.phase==="work" && cur.rs>0) return {...t, phase:"rest", tl:cur.rs};
      const key=`${wk}-${t.dayIdx}-${cur.id}`;
      setCk(p=>{const n={...p,[key]:true};save(n);return n;});
      const nx=t.seqIdx+1;
      if(nx>=t.seq.length) return null;
      return {...t, seqIdx:nx, phase:"prep", tl:PREP_SEC};
    });
  }

  function pause(){setT(t=>t?{...t,run:!t.run}:null);}
  function skip(){advance();}
  function stop(){setT(null);}

  function activeFor(di,sec,si) {
    if(!T||T.dayIdx!==di) return null;
    const c=T.seq[T.seqIdx];
    if(c.sec===sec && c.si===si) return T.phase;
    return null;
  }
  function activeRound() {
    if(!T) return null;
    const c=T.seq[T.seqIdx];
    return c.tRnds>1?{r:c.rnd,t:c.tRnds}:null;
  }

  function wp(wi){let tot=0,dn=0;WKS[wi].days.forEach((d,di)=>{[...WU,...d.exercises,...CD].forEach(e=>{tot++;if(ck[`${wi}-${di}-${e.id}`])dn++;});});return{tot,dn,pct:tot?Math.round(dn/tot*100):0};}
  function dp(wi,di){const a=[...WU,...WKS[wi].days[di].exercises,...CD];let dn=0;a.forEach(e=>{if(ck[`${wi}-${di}-${e.id}`])dn++;});return{tot:a.length,dn,pct:a.length?Math.round(dn/a.length*100):0};}

  if(loading) return <div style={{padding:40,textAlign:"center",fontFamily:"'DM Sans',sans-serif",color:"var(--muted)"}}>Laddar…</div>;

  const week=WKS[wk]; const wProg=wp(wk);

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"var(--bg)",minHeight:"100vh",color:"var(--text)",paddingBottom:40}}>
      <style>{css}</style>

      <div style={{background:"linear-gradient(135deg,#8b2e1e,#b5362a 50%,#c44a3e)",padding:"24px 20px 18px",color:"white"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/pressless-logo.svg" alt="PressLess"
              style={{width:44,height:44,borderRadius:8,objectFit:"contain",mixBlendMode:"screen",flexShrink:0}} />
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,margin:0,fontWeight:600}}>PressLess</h1>
          </div>
          <button
            onClick={toggleDark}
            title={dark ? "Ljust tema" : "Mörkt tema"}
            style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,padding:"6px 10px",fontSize:16,cursor:"pointer",lineHeight:1,marginLeft:8,flexShrink:0}}
          >{dark ? "☀️" : "🌙"}</button>
        </div>
        <p style={{margin:"4px 0 10px",opacity:.8,fontSize:13}}>3 dagar/vecka · 4 veckor · med timer</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["🧱 Wall squats (BP)","🌿 Rörlighet","💪 Styrka"].map(t=>(<span key={t} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,.15)"}}>{t}</span>))}
        </div>
      </div>

      <div style={{display:"flex",gap:6,padding:"12px 16px 8px",overflowX:"auto"}}>
        {WKS.map((w,i)=>{const p=wp(i);const a=i===wk;return(
          <button key={i} onClick={()=>{setWk(i);stop();}} style={{flex:"1 0 auto",padding:"10px 12px",borderRadius:10,border:"none",background:a?"#b5362a":"var(--tab)",color:a?"white":"var(--tab-t)",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:a?"0 2px 8px rgba(181,54,42,.3)":"0 1px 3px rgba(0,0,0,.06)",minWidth:72}}>
            <div>V{w.num}</div><div style={{fontSize:10,opacity:.7,marginTop:1}}>{w.ph}</div>
            {p.dn>0&&<div style={{fontSize:10,marginTop:2}}>{p.pct}%</div>}
          </button>);
        })}
      </div>

      <div style={{padding:"4px 16px 8px"}}>
        <div style={{background:"var(--bar)",borderRadius:6,height:6,overflow:"hidden"}}>
          <div style={{width:`${wProg.pct}%`,height:"100%",borderRadius:6,transition:"width .4s",background:wProg.pct===100?"#4caf50":"linear-gradient(90deg,#b5362a,#e06050)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginTop:4}}>
          <span>Vecka {week.num}: {wProg.dn}/{wProg.tot}</span>
          {wProg.dn>0&&<button onClick={()=>{if(confirm("Nollställ v"+week.num+"?"))resetW(wk);}} style={{background:"none",border:"none",color:"#c77",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Nollställ</button>}
        </div>
      </div>

      {week.ph==="Progression"&&(<div style={{margin:"0 16px 8px",padding:"10px 14px",background:"var(--pb-bg)",borderRadius:10,border:"1px solid var(--pb-bdr)",fontSize:12,lineHeight:1.5}}><strong>📈 Progressionsvecka!</strong> Svårare varianter — se noter per pass.</div>)}

      {week.days.map((day,di)=>{
        const dProg=dp(wk,di);const tb=TB[day.type];const done=dProg.pct===100;
        const tSec=calcTime(day); const tMin=Math.ceil(tSec/60);
        const live=T&&T.dayIdx===di; const ar=activeRound();

        return(
        <div key={di} style={{margin:"8px 16px 16px",background:"var(--card)",borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)",overflow:"hidden",border:done?"2px solid #4caf50":live?"2px solid #b5362a":"1px solid var(--card-b)"}}>
          <div style={{padding:"14px 16px 10px",borderBottom:"1px solid var(--card-hb)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><span style={{fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.5}}>{day.label}</span>{done&&<span style={{marginLeft:8}}>✅</span>}</div>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:tb.bg,color:tb.color}}>{tb.emoji} {tb.label}</span>
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:400,margin:"4px 0 0",color:"var(--text)"}}>
              {day.title}<span style={{fontFamily:"'DM Sans'",fontSize:13,fontWeight:500,color:"var(--muted)",marginLeft:8}}>~{tMin} min</span>
            </h2>
            {day.prog&&<p style={{margin:"6px 0 0",fontSize:12,color:"#d45b12",fontWeight:500}}>↑ {day.prog}</p>}

            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
              {!live?(
                <button onClick={()=>startDay(di)} style={{padding:"8px 18px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#b5362a",color:"white",cursor:"pointer",boxShadow:"0 2px 6px rgba(181,54,42,.25)"}}>▶ Starta pass</button>
              ):(
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <button onClick={pause} style={{padding:"8px 14px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:700,background:T.run?"#f0a030":"#2e7d4f",color:"white",cursor:"pointer"}}>{T.run?"⏸ Paus":"▶ Fortsätt"}</button>
                  <button onClick={skip} style={{padding:"8px 12px",borderRadius:8,border:"1px solid var(--card-b)",fontFamily:"inherit",fontSize:12,background:"var(--card)",color:"var(--tab-t)",cursor:"pointer"}}>⏭</button>
                  <button onClick={stop} style={{padding:"8px 12px",borderRadius:8,border:"1px solid var(--card-b)",fontFamily:"inherit",fontSize:12,background:"var(--card)",color:"#c55",cursor:"pointer"}}>⏹</button>
                </div>
              )}
              <div style={{flex:1}}>{dProg.dn>0&&(<div style={{background:"var(--ptrack)",borderRadius:4,height:4}}><div style={{width:`${dProg.pct}%`,height:"100%",borderRadius:4,transition:"width .3s",background:done?"#4caf50":"#b5362a"}}/></div>)}</div>
            </div>
            {live&&ar&&<div style={{marginTop:8,fontSize:13,fontWeight:700,color:"#b5362a",background:"var(--cws)",display:"inline-block",padding:"3px 10px",borderRadius:6}}>Runda {ar.r} av {ar.t}</div>}
          </div>

          <div style={{padding:"6px 0"}}>
            <SL cat="warmup" text="Uppvärmning · 2:30"/>
            {WU.map((ex,i)=><Row key={ex.id} ex={ex} ck={!!ck[`${wk}-${di}-${ex.id}`]} exp={!!exp[`${wk}-${di}-${ex.id}`]} onCk={()=>tog(wk,di,ex.id)} onExp={()=>togE(`${wk}-${di}-${ex.id}`)} act={activeFor(di,"warmup",i)} tl={T?.dayIdx===di?T.tl:0} tot={activeFor(di,"warmup",i)==="work"?ex.ws:activeFor(di,"warmup",i)==="rest"?ex.rs:PREP_SEC} rRef={activeFor(di,"warmup",i)?aRef:null}/>)}

            {day.type==="mobility"?(
              <SL cat="wallsquat" text={`Wall squats + Rörlighet · ${fmt(day.exercises.reduce((a,e)=>a+e.ws+e.rs,0)+(day.exercises.length-1)*PREP_SEC)}`}/>
            ):(
              <SL cat="strength" text={`Styrka · ${fmt((day.exercises.reduce((a,e)=>a+e.ws+e.rs,0)+(day.exercises.length-1)*PREP_SEC)*(day.rnds||1)+PREP_SEC*(day.rnds-1||0))}`} extra={day.rnds>1?`${day.rnds} rundor`:""}/>
            )}
            {day.exercises.map((ex,i)=><Row key={ex.id} ex={ex} ck={!!ck[`${wk}-${di}-${ex.id}`]} exp={!!exp[`${wk}-${di}-${ex.id}`]} onCk={()=>tog(wk,di,ex.id)} onExp={()=>togE(`${wk}-${di}-${ex.id}`)} act={activeFor(di,"main",i)} tl={T?.dayIdx===di?T.tl:0} tot={activeFor(di,"main",i)==="work"?ex.ws:activeFor(di,"main",i)==="rest"?ex.rs:PREP_SEC} rRef={activeFor(di,"main",i)?aRef:null}/>)}

            <SL cat="cooldown" text="Nedvarvning · 1:50"/>
            {CD.map((ex,i)=><Row key={ex.id} ex={ex} ck={!!ck[`${wk}-${di}-${ex.id}`]} exp={!!exp[`${wk}-${di}-${ex.id}`]} onCk={()=>tog(wk,di,ex.id)} onExp={()=>togE(`${wk}-${di}-${ex.id}`)} act={activeFor(di,"cooldown",i)} tl={T?.dayIdx===di?T.tl:0} tot={activeFor(di,"cooldown",i)==="work"?ex.ws:activeFor(di,"cooldown",i)==="rest"?ex.rs:PREP_SEC} rRef={activeFor(di,"cooldown",i)?aRef:null}/>)}
          </div>
        </div>);
      })}

      <div style={{margin:"8px 16px",padding:"14px 16px",background:"var(--legend)",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Färgkoder</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {Object.entries(CC).map(([k,v])=>(<span key={k} style={{fontSize:12,padding:"4px 10px",borderRadius:8,background:v.bg,color:v.color,fontWeight:500}}>{v.emoji} {v.label}</span>))}
          <span style={{fontSize:12,padding:"4px 10px",borderRadius:8,background:"var(--ptag)",color:"var(--ptag-t)",fontWeight:500}}>⏳ Gör dig redo</span>
        </div>
      </div>
      <div style={{textAlign:"center",padding:"12px 16px",fontSize:11,color:"var(--faint)"}}>▶ Starta pass för automatisk timer · Instruktioner visas under övningen</div>
    </div>
  );
}

function SL({cat,text,extra}){const c=CC[cat];return(<div style={{padding:"10px 16px 4px"}}><div style={{fontSize:10,fontWeight:700,color:c.color,textTransform:"uppercase",letterSpacing:1}}>{c.emoji} {text}</div>{extra&&<div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{extra}</div>}</div>);}

function Row({ex,ck:checked,exp,onCk,onExp,act,tl,tot,rRef}){
  const c=CC[ex.cat];
  const isPrep=act==="prep",isWork=act==="work",isRest=act==="rest",isAct=!!act;
  const pct=isAct&&tot>0?(tl/tot)*100:0;

  const bg=isPrep?"var(--row-p)":isWork?"var(--row-w)":isRest?"var(--row-r)":checked?"var(--row-ck)":ex.cat==="wallsquat"?"var(--row-ws)":"var(--row-d)";
  const bc=isPrep?"#5c6bc0":isWork?"#e84c30":isRest?"#4caf50":c.color;
  const phLabel=isPrep?"GÖR DIG REDO":isWork?"KÖR":isRest?"VILA":null;
  const phColor=isPrep?"#3949ab":isWork?"#c0392b":"#27864a";
  const phBg=isPrep?"#5c6bc0":isWork?"#e84c30":"#4caf50";

  const showDesc = isAct || exp;

  return(
    <div ref={rRef} style={{borderLeft:`3px solid ${bc}`,marginLeft:16,marginRight:12,marginBottom:2,borderRadius:"0 8px 8px 0",overflow:"hidden",background:bg,transition:"background .15s",position:"relative"}}>
      {isAct&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,transition:"width 1s linear",background:isPrep?"rgba(92,107,188,.08)":isWork?"rgba(232,76,48,.08)":"rgba(76,175,80,.08)",zIndex:0,borderRadius:"0 8px 8px 0"}}/>}

      <div style={{display:"flex",alignItems:"flex-start",padding:"10px 10px 10px 12px",gap:10,position:"relative",zIndex:1}}>
        <button onClick={e=>{e.stopPropagation();onCk();}} style={{width:24,height:24,minWidth:24,borderRadius:6,border:`2px solid ${checked?"#4caf50":"var(--chk)"}`,background:checked?"#4caf50":"var(--card)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,padding:0}}>
          {checked&&<span style={{color:"white",fontSize:14,lineHeight:1}}>✓</span>}
        </button>

        <div onClick={onExp} style={{flex:1,cursor:"pointer",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:14}}>{c.emoji}</span>
            <span style={{fontSize:14,fontWeight:ex.cat==="wallsquat"?700:600,textDecoration:checked&&!isAct?"line-through":"none",color:checked&&!isAct?"var(--muted)":isAct?phColor:ex.cat==="wallsquat"?"#b5362a":"var(--text)"}}>{ex.name}</span>
          </div>

          {isAct?(
            <div style={{marginTop:6,marginLeft:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:700,color:phColor}}>{fmt(tl)}</span>
                <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:4,background:phBg,color:"white",letterSpacing:.5}}>{phLabel}</span>
              </div>
              {isPrep&&<div style={{fontSize:12,color:"#5c6bc0",marginTop:4,fontWeight:500}}>Läs instruktionen och gör dig redo…</div>}
            </div>
          ):(
            <div style={{fontSize:11,color:"var(--tmeta)",marginTop:2,marginLeft:20}}>
              {fmt(ex.ws)}{ex.rs>0?` + ${ex.rs}s vila`:""}
            </div>
          )}

          {showDesc&&(
            <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:isPrep?"var(--dp)":isWork?"var(--dw)":isRest?"var(--dr)":c.bg,fontSize:13,lineHeight:1.65,color:"var(--dt)",border:isAct?`1px solid ${bc}22`:"none"}}>
              {ex.d}
            </div>
          )}
        </div>

        {!isAct&&<button onClick={onExp} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--exp)",padding:4,marginTop:2,transform:exp?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▼</button>}
      </div>
    </div>
  );
}
