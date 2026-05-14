import { useState, useEffect, useCallback, useRef } from "react";

const css = `
*{box-sizing:border-box;}
body{background:#0F0F14;margin:0;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:#0F0F14;}
::-webkit-scrollbar-thumb{background:#252535;border-radius:3px;}
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
  warmup:   { emoji:"🔥", color:"#F59E0B", label:"Uppvärmning" },
  wallsquat:{ emoji:"🧱", color:"#FF6D1F", label:"Wall squat" },
  mobility: { emoji:"🌿", color:"#9B65FF", label:"Rörlighet" },
  strength: { emoji:"💪", color:"#FF8C47", label:"Styrka" },
  cooldown: { emoji:"🧊", color:"#9B65FF", label:"Nedvarvning" },
};
const TB = {
  mobility:{ emoji:"🧱🌿", color:"#9B65FF", label:"Wall squat & Rörlighet" },
  strength:{ emoji:"⚡",   color:"#FF8C47", label:"Styrka" },
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
  const tRef = useRef(null);
  const aRef = useRef(null);

  useEffect(() => {
    (async()=>{try{const r=await window.storage.get("wt4-ck");if(r?.value)setCk(JSON.parse(r.value));}catch(e){}setLoading(false);})();
  },[]);

  const save=useCallback(async n=>{try{await window.storage.set("wt4-ck",JSON.stringify(n));}catch(e){}},[]);

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

  if(loading) return (
    <div style={{padding:40,textAlign:"center",fontFamily:"'DM Sans',sans-serif",color:"#8B8BA0",background:"#0F0F14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,letterSpacing:"0.1em",color:"#4A4A60"}}>LADDAR…</span>
    </div>
  );

  const week=WKS[wk]; const wProg=wp(wk);

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0F0F14",minHeight:"100vh",color:"#F0EEF8",paddingBottom:60}}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={{background:"linear-gradient(160deg,#1A0A2E 0%,#0F1520 60%,#1A0A0E 100%)",padding:"32px 20px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src="/pressless-logo.png" alt="PressLess"
              style={{width:44,height:44,borderRadius:10,objectFit:"contain",flexShrink:0}}/>
            <h1 style={{
              fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,
              letterSpacing:"-0.02em",margin:0,
              background:"linear-gradient(135deg,#FF6D1F,#7B3FE4)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"
            }}>PressLess</h1>
          </div>
        </div>
        <p style={{margin:"0 0 14px",color:"#8B8BA0",fontSize:13,fontWeight:400}}>
          3 dagar/vecka · 4 veckor · med timer
        </p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["🧱 Wall squats (BP)","🌿 Rörlighet","💪 Styrka"].map(t=>(
            <span key={t} style={{
              fontSize:12,padding:"4px 12px",borderRadius:20,
              background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.06)",
              color:"#8B8BA0",fontWeight:500
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Week selector ── */}
      <div style={{display:"flex",gap:8,padding:"16px 20px 8px",overflowX:"auto"}}>
        {WKS.map((w,i)=>{
          const p=wp(i); const a=i===wk;
          return(
            <button key={i} onClick={()=>{setWk(i);stop();}} style={{
              flex:"1 0 auto",padding:"12px 14px",borderRadius:14,
              border:a?"none":"1px solid rgba(255,255,255,0.06)",
              background:a?"linear-gradient(135deg,#FF6D1F,#7B3FE4)":"#17171F",
              color:"#F0EEF8",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,
              cursor:"pointer",
              boxShadow:a?"0 4px 20px rgba(255,109,31,0.25)":"none",
              minWidth:72,transition:"all 0.3s ease"
            }}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15}}>V{w.num}</div>
              <div style={{fontSize:10,opacity:0.75,marginTop:2}}>{w.ph}</div>
              {p.dn>0&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,marginTop:3,letterSpacing:"0.08em"}}>{p.pct}%</div>}
            </button>
          );
        })}
      </div>

      {/* ── Week progress bar ── */}
      <div style={{padding:"4px 20px 14px"}}>
        <div style={{background:"#1E1E2A",borderRadius:6,height:5,overflow:"hidden"}}>
          <div style={{
            width:`${wProg.pct}%`,height:"100%",borderRadius:6,
            transition:"width 0.4s ease",
            background:"linear-gradient(90deg,#FF6D1F,#7B3FE4)"
          }}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#8B8BA0",letterSpacing:"0.08em",textTransform:"uppercase"}}>
            VECKA {week.num} · {wProg.dn}/{wProg.tot}
          </span>
          {wProg.dn>0&&(
            <button onClick={()=>{if(confirm("Nollställ v"+week.num+"?"))resetW(wk);}} style={{
              background:"none",border:"none",color:"#4A4A60",fontSize:11,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"color 0.2s"
            }}>Nollställ</button>
          )}
        </div>
      </div>

      {/* ── Progression banner ── */}
      {week.ph==="Progression"&&(
        <div style={{
          margin:"0 20px 12px",padding:"12px 16px",
          background:"#1E1E2A",borderRadius:14,
          border:"1px solid rgba(255,255,255,0.06)"
        }}>
          <span style={{color:"#FF8C47",fontSize:13,fontWeight:500}}>
            📈 Progressionsvecka! Svårare varianter — se noter per pass.
          </span>
        </div>
      )}

      {/* ── Day cards ── */}
      {week.days.map((day,di)=>{
        const dProg=dp(wk,di); const tb=TB[day.type]; const done=dProg.pct===100;
        const tSec=calcTime(day); const tMin=Math.ceil(tSec/60);
        const live=T&&T.dayIdx===di; const ar=activeRound();

        return(
          <div key={di} style={{
            margin:"0 20px 16px",
            background:"#17171F",
            borderRadius:20,
            border:done
              ?"1px solid rgba(34,197,94,0.25)"
              :live
              ?"1px solid rgba(255,109,31,0.25)"
              :"1px solid rgba(255,255,255,0.06)",
            overflow:"hidden",
            boxShadow:live?"0 0 40px rgba(255,109,31,0.08)":done?"0 0 24px rgba(34,197,94,0.06)":"none",
            transition:"all 0.3s ease"
          }}>
            {/* Card header */}
            <div style={{padding:"20px 20px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{
                    width:3,height:16,borderRadius:2,flexShrink:0,
                    background:"linear-gradient(#F59E0B,#FF6D1F)"
                  }}/>
                  <span style={{
                    fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
                    color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.12em"
                  }}>{day.label}</span>
                  {done&&(
                    <span style={{
                      fontSize:11,padding:"2px 8px",borderRadius:20,
                      background:"rgba(34,197,94,0.12)",color:"#22C55E",fontWeight:600
                    }}>Klar ✓</span>
                  )}
                </div>
                <span style={{
                  fontSize:12,padding:"4px 10px",borderRadius:20,
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.06)",
                  color:"#8B8BA0",fontWeight:500
                }}>{tb.emoji} {tb.label}</span>
              </div>

              <h2 style={{
                fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,
                letterSpacing:"-0.01em",margin:"0 0 4px",color:"#F0EEF8"
              }}>{day.title}</h2>

              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:day.prog?8:0}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4A4A60",letterSpacing:"0.05em"}}>
                  ~{tMin} MIN
                </span>
              </div>

              {day.prog&&(
                <p style={{margin:"0 0 12px",fontSize:12,color:"#FF8C47",fontWeight:500}}>
                  ↑ {day.prog}
                </p>
              )}

              {/* Action row */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:14}}>
                {!live?(
                  <button onClick={()=>startDay(di)} style={{
                    padding:"11px 24px",borderRadius:14,border:"none",
                    fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,
                    background:"linear-gradient(135deg,#FF6D1F,#7B3FE4)",
                    color:"white",cursor:"pointer",
                    boxShadow:"0 4px 16px rgba(255,109,31,0.3)",
                    transition:"all 0.3s ease"
                  }}>▶ Starta pass</button>
                ):(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={pause} style={{
                      padding:"11px 18px",borderRadius:14,
                      fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,
                      background:T.run?"rgba(255,109,31,0.15)":"rgba(34,197,94,0.15)",
                      color:T.run?"#FF8C47":"#22C55E",cursor:"pointer",
                      border:T.run?"1px solid rgba(255,109,31,0.3)":"1px solid rgba(34,197,94,0.3)",
                      transition:"all 0.3s ease"
                    }}>{T.run?"⏸ Paus":"▶ Fortsätt"}</button>
                    <button onClick={skip} style={{
                      padding:"11px 14px",borderRadius:14,
                      border:"1px solid rgba(255,255,255,0.06)",
                      fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,
                      background:"#1E1E2A",color:"#8B8BA0",cursor:"pointer",
                      transition:"all 0.3s ease"
                    }}>⏭</button>
                    <button onClick={stop} style={{
                      padding:"11px 14px",borderRadius:14,
                      border:"1px solid rgba(255,109,31,0.2)",
                      fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,
                      background:"rgba(255,109,31,0.08)",color:"#FF6D1F",cursor:"pointer",
                      transition:"all 0.3s ease"
                    }}>⏹</button>
                  </div>
                )}
                <div style={{flex:1}}>
                  {dProg.dn>0&&(
                    <div style={{background:"#1E1E2A",borderRadius:6,height:5,overflow:"hidden"}}>
                      <div style={{
                        width:`${dProg.pct}%`,height:"100%",borderRadius:6,
                        transition:"width 0.4s ease",
                        background:"linear-gradient(90deg,#22C55E,#16A34A)"
                      }}/>
                    </div>
                  )}
                </div>
              </div>

              {live&&ar&&(
                <div style={{
                  marginTop:12,display:"inline-flex",alignItems:"center",gap:6,
                  padding:"5px 12px",borderRadius:20,
                  background:"rgba(255,109,31,0.12)",
                  border:"1px solid rgba(255,109,31,0.25)"
                }}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#FF8C47",letterSpacing:"0.08em"}}>
                    RUNDA {ar.r} AV {ar.t}
                  </span>
                </div>
              )}
            </div>

            {/* Exercise list */}
            <div style={{paddingBottom:12}}>
              <SL cat="warmup" text="Uppvärmning · 2:30"/>
              {WU.map((ex,i)=>(
                <Row key={ex.id} ex={ex}
                  ck={!!ck[`${wk}-${di}-${ex.id}`]}
                  exp={!!exp[`${wk}-${di}-${ex.id}`]}
                  onCk={()=>tog(wk,di,ex.id)}
                  onExp={()=>togE(`${wk}-${di}-${ex.id}`)}
                  act={activeFor(di,"warmup",i)}
                  tl={T?.dayIdx===di?T.tl:0}
                  tot={activeFor(di,"warmup",i)==="work"?ex.ws:activeFor(di,"warmup",i)==="rest"?ex.rs:PREP_SEC}
                  rRef={activeFor(di,"warmup",i)?aRef:null}
                />
              ))}

              {day.type==="mobility"?(
                <SL cat="wallsquat" text={`Wall squats + Rörlighet · ${fmt(day.exercises.reduce((a,e)=>a+e.ws+e.rs,0)+(day.exercises.length-1)*PREP_SEC)}`}/>
              ):(
                <SL cat="strength" text={`Styrka · ${fmt((day.exercises.reduce((a,e)=>a+e.ws+e.rs,0)+(day.exercises.length-1)*PREP_SEC)*(day.rnds||1)+PREP_SEC*(day.rnds-1||0))}`} extra={day.rnds>1?`${day.rnds} rundor`:""}/>
              )}
              {day.exercises.map((ex,i)=>(
                <Row key={ex.id} ex={ex}
                  ck={!!ck[`${wk}-${di}-${ex.id}`]}
                  exp={!!exp[`${wk}-${di}-${ex.id}`]}
                  onCk={()=>tog(wk,di,ex.id)}
                  onExp={()=>togE(`${wk}-${di}-${ex.id}`)}
                  act={activeFor(di,"main",i)}
                  tl={T?.dayIdx===di?T.tl:0}
                  tot={activeFor(di,"main",i)==="work"?ex.ws:activeFor(di,"main",i)==="rest"?ex.rs:PREP_SEC}
                  rRef={activeFor(di,"main",i)?aRef:null}
                />
              ))}

              <SL cat="cooldown" text="Nedvarvning · 1:50"/>
              {CD.map((ex,i)=>(
                <Row key={ex.id} ex={ex}
                  ck={!!ck[`${wk}-${di}-${ex.id}`]}
                  exp={!!exp[`${wk}-${di}-${ex.id}`]}
                  onCk={()=>tog(wk,di,ex.id)}
                  onExp={()=>togE(`${wk}-${di}-${ex.id}`)}
                  act={activeFor(di,"cooldown",i)}
                  tl={T?.dayIdx===di?T.tl:0}
                  tot={activeFor(di,"cooldown",i)==="work"?ex.ws:activeFor(di,"cooldown",i)==="rest"?ex.rs:PREP_SEC}
                  rRef={activeFor(di,"cooldown",i)?aRef:null}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Legend ── */}
      <div style={{
        margin:"8px 20px",padding:"18px 20px",
        background:"#17171F",borderRadius:20,
        border:"1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{width:3,height:14,borderRadius:2,background:"linear-gradient(#F59E0B,#FF6D1F)"}}/>
          <span style={{
            fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
            color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.12em"
          }}>Färgkoder</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {Object.entries(CC).map(([k,v])=>(
            <span key={k} style={{
              fontSize:12,padding:"4px 12px",borderRadius:20,
              background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.06)",
              color:v.color,fontWeight:500
            }}>{v.emoji} {v.label}</span>
          ))}
          <span style={{
            fontSize:12,padding:"4px 12px",borderRadius:20,
            background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.06)",
            color:"#7B3FE4",fontWeight:500
          }}>⏳ Gör dig redo</span>
        </div>
      </div>

      <div style={{textAlign:"center",padding:"12px 20px 8px",fontSize:11,color:"#4A4A60",fontFamily:"'DM Sans',sans-serif"}}>
        ▶ Starta pass för automatisk timer · Instruktioner visas under övningen
      </div>
    </div>
  );
}

function SL({cat,text,extra}) {
  const c = CC[cat];
  return (
    <div style={{padding:"14px 20px 6px",display:"flex",alignItems:"flex-start",gap:10}}>
      <div style={{width:3,minHeight:28,borderRadius:2,background:"linear-gradient(#F59E0B,#FF6D1F)",flexShrink:0,marginTop:1}}/>
      <div>
        <div style={{
          fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
          color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.12em"
        }}>{c.emoji} {text}</div>
        {extra&&(
          <div style={{fontSize:11,color:"#8B8BA0",marginTop:2,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ex,ck:checked,exp,onCk,onExp,act,tl,tot,rRef}) {
  const c = CC[ex.cat];
  const isPrep=act==="prep", isWork=act==="work", isRest=act==="rest", isAct=!!act;
  const pct = isAct && tot > 0 ? (tl/tot)*100 : 0;

  const bc = isAct
    ? (isPrep?"#7B3FE4":isWork?"#FF6D1F":"#22C55E")
    : checked?"#22C55E":"#4A4A60";

  const rowBg = isPrep?"rgba(123,63,228,0.07)"
    : isWork?"rgba(255,109,31,0.07)"
    : isRest?"rgba(34,197,94,0.07)"
    : checked?"rgba(34,197,94,0.04)"
    : "rgba(255,255,255,0.015)";

  const phLabel = isPrep?"GÖR DIG REDO":isWork?"KÖR":isRest?"VILA":null;
  const phColor = isPrep?"#9B65FF":isWork?"#FF8C47":"#22C55E";
  const phBg    = isPrep?"rgba(123,63,228,0.18)":isWork?"rgba(255,109,31,0.18)":"rgba(34,197,94,0.18)";
  const phBorder= isPrep?"rgba(123,63,228,0.35)":isWork?"rgba(255,109,31,0.35)":"rgba(34,197,94,0.35)";

  const showDesc = isAct || exp;

  return (
    <div ref={rRef} style={{
      borderLeft:`3px solid ${bc}`,
      margin:"0 20px 6px",
      borderRadius:12,overflow:"hidden",
      background:rowBg,
      transition:"all 0.2s ease",
      position:"relative"
    }}>
      {/* Progress fill */}
      {isAct&&(
        <div style={{
          position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,
          transition:"width 1s linear",
          background:isPrep?"rgba(123,63,228,0.05)":isWork?"rgba(255,109,31,0.05)":"rgba(34,197,94,0.05)",
          zIndex:0,borderRadius:12
        }}/>
      )}

      <div style={{display:"flex",alignItems:"flex-start",padding:"12px 12px 12px 14px",gap:12,position:"relative",zIndex:1}}>
        {/* Checkbox */}
        <button onClick={e=>{e.stopPropagation();onCk();}} style={{
          width:28,height:28,minWidth:28,borderRadius:8,
          border:checked?"none":"2px solid #4A4A60",
          background:checked?"#22C55E":"transparent",
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          marginTop:1,padding:0,flexShrink:0,
          boxShadow:checked?"0 0 12px rgba(34,197,94,0.4)":"none",
          transition:"all 0.2s ease"
        }}>
          {checked&&<span style={{color:"white",fontSize:15,lineHeight:1,fontWeight:700}}>✓</span>}
        </button>

        {/* Content */}
        <div onClick={onExp} style={{flex:1,cursor:"pointer",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:14}}>{c.emoji}</span>
            <span style={{
              fontSize:14,fontWeight:600,
              textDecoration:checked&&!isAct?"line-through":"none",
              color:checked&&!isAct?"#4A4A60":isAct?phColor:"#F0EEF8",
              transition:"color 0.2s"
            }}>{ex.name}</span>
          </div>

          {isAct?(
            <div style={{marginTop:8,marginLeft:22}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{
                  fontFamily:"'JetBrains Mono',monospace",fontSize:34,fontWeight:500,
                  color:phColor,letterSpacing:"0.05em",lineHeight:1
                }}>{fmt(tl)}</span>
                <span style={{
                  fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,
                  background:phBg,color:phColor,
                  border:`1px solid ${phBorder}`,
                  fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"
                }}>{phLabel}</span>
              </div>
              {isPrep&&(
                <div style={{fontSize:12,color:"#9B65FF",marginTop:5,fontWeight:500}}>
                  Läs instruktionen och gör dig redo…
                </div>
              )}
            </div>
          ):(
            <div style={{
              fontSize:11,color:"#8B8BA0",marginTop:3,marginLeft:22,
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.05em"
            }}>
              {fmt(ex.ws)}{ex.rs>0?` + ${ex.rs}s VILA`:""}
            </div>
          )}

          {showDesc&&(
            <div style={{
              marginTop:10,padding:"12px 14px",borderRadius:10,
              background:"#1E1E2A",
              border:"1px solid rgba(255,255,255,0.06)",
              fontSize:13,lineHeight:1.7,color:"#8B8BA0",fontWeight:400
            }}>
              {ex.d}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        {!isAct&&(
          <button onClick={onExp} style={{
            background:"none",border:"none",cursor:"pointer",
            fontSize:11,color:"#4A4A60",padding:4,marginTop:4,flexShrink:0,
            transform:exp?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s ease"
          }}>▼</button>
        )}
      </div>
    </div>
  );
}
