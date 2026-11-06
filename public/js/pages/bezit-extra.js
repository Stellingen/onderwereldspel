// Bezit, uitbreiding november 2026: iconen, gevels, witwasprofielen en bonnetjes voor de nieuwe zaken (zie het blok
// 'Meer zaken' onderaan data.js). Laadt na bezit.js, witwas.js en politie.js en vult hun tabellen aan.

// Iconen (24×24, lijnstijl zoals de rest van BZ_IC)
Object.assign(BZ_IC,{
 fiets:'<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h6l2 8M10 8l4 8M8.5 6h3M15 5h2l1 3"/>',
 markt:'<path d="M3 9l2-5h14l2 5z"/><path d="M3 9c0 1.3 1 2 2.25 2S7.5 10.3 7.5 9c0 1.3 1 2 2.25 2S12 10.3 12 9c0 1.3 1 2 2.25 2s2.25-.7 2.25-2c0 1.3 1 2 2.25 2S21 10.3 21 9"/><path d="M5 11v10M19 11v10M5 16h14"/>',
 avond:'<path d="M5 9h14l-1 12H6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/><path d="M14.5 16.5a2.8 2.8 0 1 1-2.6-4 2.2 2.2 0 0 0 2.6 4z"/>',
 garagebox:'<path d="M3 21V9l9-5 9 5v12"/><path d="M6 21v-9h12v9M6 15h12M6 18h12"/>',
 nagel:'<rect x="7" y="11" width="10" height="10" rx="2"/><path d="M9 11V8h6v3M10.5 8V3h3v5"/>',
 souvenir:'<path d="M12 21v-9"/><path d="M12 12c-4 0-6-3-6-7l3 2 3-4 3 4 3-2c0 4-2 7-6 7z"/><path d="M12 18c-2-3-5-3-7-2M12 17c2-2.5 4.5-2.5 6-1.5"/>',
 wasstraat:'<path d="M3 19v-3l2-4h14l2 4v3z"/><path d="M3 16h18"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/><path d="M8 3c-1 1.5-1.5 2.3-1.5 3a1.5 1.5 0 0 0 3 0c0-.7-.5-1.5-1.5-3zM16 3c-1 1.5-1.5 2.3-1.5 3a1.5 1.5 0 0 0 3 0c0-.7-.5-1.5-1.5-3z"/>',
 pizza:'<path d="M12 21L3 6a14 9 0 0 1 18 0z"/><path d="M4.6 8.6a12 7 0 0 1 14.8 0"/><circle cx="10" cy="11" r="1.2"/><circle cx="14" cy="13" r="1.2"/><circle cx="12" cy="16.5" r="1"/>',
 taxi:'<path d="M3 18v-3l2-5h14l2 5v3z"/><path d="M3 15h18"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><rect x="9" y="5" width="6" height="3" rx="1"/>',
 bruin:'<path d="M6 6h10v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M16 9h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M6 6a2.5 2.5 0 0 1 3-3 3 3 0 0 1 5 0 2.5 2.5 0 0 1 2 3"/><path d="M9.5 10v7M12.5 10v7"/>',
 koerier:'<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/><path d="M7.5 5.2l9 4.6"/>',
 coffeeshop:'<path d="M12 21v-6"/><path d="M12 15c-1.6-4-1.6-8 0-12 1.6 4 1.6 8 0 12z"/><path d="M12 15c-2-3-5-5-8-6 1 3 4 5.5 8 6zM12 15c2-3 5-5 8-6-1 3-4 5.5-8 6z"/><path d="M12 15c-3-.5-5.5 0-7.5 1.5 2.5.8 5 .3 7.5-1.5zM12 15c3-.5 5.5 0 7.5 1.5-2.5.8-5 .3-7.5-1.5z"/>',
 studenten:'<path d="M3 20V5M3 15h18v5M21 15v-2a2 2 0 0 0-2-2h-8v4"/><circle cx="6.5" cy="11.5" r="1.8"/>',
 sport:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
 groothandel:'<path d="M4 18V9h6l2 4v5"/><path d="M4 13h8"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="11" cy="18.5" r="1.8"/><path d="M15 4v15h6"/><path d="M15 15h4"/>',
 rondvaart:'<path d="M2 15h20l-2.5 4h-15z"/><path d="M5 15v-4h12l2 4"/><path d="M8 11v4M11 11v4M14 11v4"/><path d="M2 21.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
 restaurant:'<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 21V3c-2.5 1.5-3.5 4-3.5 8h3.5"/>',
 hostel:'<path d="M7 8a5 5 0 0 1 10 0v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M10 5V3h4v2"/><path d="M9 14h6v4H9zM7 11h10"/>',
 wissel:'<circle cx="8" cy="8" r="5"/><circle cx="16" cy="16" r="5"/><path d="M9.6 6.2a2.2 2.2 0 1 0 0 3.6M5.6 7.3h3M5.6 8.7h3M16 13.3v5.4M17.6 14.4h-2.2a1 1 0 0 0 0 2h1.2a1 1 0 0 1 0 2h-2.2"/>',
 verhuur:'<circle cx="8" cy="15" r="5"/><path d="M11.5 11.5L20 3M16 7l2.5 2.5M18.5 4.5l2 2"/><circle cx="8" cy="15" r="1.5"/>',
 parkeer:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V7h3.5a3 3 0 0 1 0 6H10"/>',
 transport:'<path d="M2 6h12v11H2zM14 10h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
 juwelier:'<circle cx="12" cy="15" r="6"/><path d="M9 6l1.5-3h3L15 6l-3 3z"/>',
 importeur:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M3.5 10.5c5 1 12 1 17 0M10.2 14L7 20M13.8 14l3.2 6"/>',
 beach:'<path d="M3 11a9 7 0 0 1 18 0z"/><path d="M12 4v17M7.5 11L12 4l4.5 7"/><path d="M3 21c3-2 15-2 18 0"/>',
 diamant:'<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3L7.5 9 12 21l4.5-12L15 3"/>',
 galerie:'<rect x="3" y="4" width="18" height="16" rx="1"/><rect x="6" y="7" width="12" height="10"/><path d="M6 15l4-4 3 3 2-2 3 3"/><circle cx="15" cy="10" r="1"/>',
 kantoor:'<path d="M6 21V5l6-2v18M12 21V7l6 2v12M3 21h18"/><path d="M8.5 7v.01M8.5 11v.01M8.5 15v.01M15 12v.01M15 16v.01"/>',
 rederij:'<path d="M2 15h20l-3 5H5z"/><path d="M5 15V8h3v7M8 11h4v4M12 8h4v7M16 11h3v4"/><path d="M14 8V4"/>',
 gcasino:'<path d="M12 3C9 7 4 9.5 4 13.5a4 4 0 0 0 7 2.6L10 21h4l-1-4.9a4 4 0 0 0 7-2.6C20 9.5 15 7 12 3z"/>'});
BZ_CATC.toer='#ffd166';

// Nieuwe gevels voor de banners (zelfde nachtstijl, 320×220, grond op y=190). lit(i) = raam i brandt (meer vestigingen = meer licht).
window.BZ_ART={
 // grachtenpanden: drie smalle huizen met trap-, hals- en klokgevel aan het water; de middelste is jouw zaak
 canal:(c,u,lit,ic)=>{const H=[[70,56,'#2a2420',52,'trap'],[128,66,'#1f2228',30,'hals'],[196,56,'#2b2320',46,'klok']];
  const gable=(x,w,t,s)=>s==='trap'?`M${x} 176V${t+26}h${w*.14}v-9h${w*.14}v-9h${w*.44}v9h${w*.14}v9h${w*.14}V176z`
   :s==='hals'?`M${x} 176V${t+24}h${w*.22}v-12q${w*.28}-18 ${w*.56} 0v12h${w*.22}V176z`
   :`M${x} 176V${t+24}h${w*.2}q0-16 ${w*.3}-18q${w*.3} 2 ${w*.3} 18h${w*.2}V176z`;
  return H.map(([x,w,f,t,s],h)=>{const cols=h===1?3:2,cw=w/(cols*2+1);
   return `<path d="${gable(x,w,t,s)}" fill="${f}" stroke="#3a332d"/><path d="M${x+w/2} ${t+6}v-6h5" stroke="#4a4038" stroke-width="2" fill="none"/>
    ${[0,1,2].map(r=>Array.from({length:cols},(_,q)=>{const i=h*9+r*cols+q;return `<rect x="${x+cw*(1+q*2)}" y="${t+36+r*30}" width="${cw}" height="20" fill="${lit(i)?'url(#'+u+'w)':'#111317'}" opacity="${lit(i)?.8:1}"/>`}).join('')).join('')}
    ${h===1?`<rect x="${x+6}" y="146" width="${w-12}" height="30" fill="#0c0e11" stroke="${c}" stroke-opacity=".6"/><rect x="${x+6}" y="146" width="${w-12}" height="30" fill="url(#${u}g)"/>`
     :`<rect x="${x+w/2-8}" y="150" width="16" height="26" fill="#16191e" stroke="#3a3f47"/>`}`}).join('')+
  `<g transform="translate(161 136)"><path d="M-17 0h34" stroke="#4a4038" stroke-width="2"/><rect x="-14" y="2" width="28" height="22" rx="2" fill="${c}" opacity=".95"/></g>${ic(161,149,17,'#0b0c0e')}
   <rect x="0" y="174" width="320" height="4" fill="#2a2f37"/><rect x="0" y="178" width="320" height="12" fill="#0a131b"/>
   ${[[80,184,40],[150,182,30],[210,186,46]].map(([x,y,w])=>`<path d="M${x} ${y}h${w}" stroke="${c}" stroke-opacity=".35" stroke-width="1.5"/>`).join('')}`},
 // rondvaartboot op de gracht met een brug erachter
 boat:(c,u,lit,ic)=>`<rect x="0" y="120" width="320" height="70" fill="#0a131b"/>
   <path d="M30 120V96h260v24h-60a70 40 0 0 0-140 0z" fill="#2b2320" stroke="#3a332d"/><path d="M30 96h260" stroke="#4a4038" stroke-width="3"/>
   ${[44,84,236,276].map(x=>`<path d="M${x} 96v-10" stroke="#9aa1ab" stroke-width="1.5"/><circle cx="${x}" cy="84" r="3" fill="#ffd27a" opacity=".85"/>`).join('')}
   <ellipse cx="160" cy="120" rx="70" ry="6" fill="url(#${u}g)" opacity=".8"/>
   <g transform="translate(0 0)"><path d="M48 170h228l-14 14H62z" fill="#1d2027" stroke="${c}" stroke-opacity=".7"/>
    <path d="M70 170v-20q0-8 8-8h170q10 0 16 10l8 18z" fill="#14171c" stroke="#3a3f47"/>
    ${Array.from({length:8},(_,i)=>`<rect x="${78+i*22}" y="148" width="16" height="16" rx="2" fill="${lit(i)?'url(#'+u+'w)':'#111317'}" opacity="${lit(i)?.85:1}"/>`).join('')}
    <path d="M48 170h228" stroke="${c}" stroke-width="2"/></g>
   <circle cx="282" cy="56" r="20" fill="${c}" opacity=".12"/>${ic(282,56,24,c)}
   ${[[60,188,50],[150,186,40],[230,188,50]].map(([x,y,w])=>`<path d="M${x} ${y}h${w}" stroke="${c}" stroke-opacity=".35" stroke-width="1.5"/>`).join('')}`,
 // marktkramen met gestreepte luifels en lampjes
 stall:(c,u,lit,ic)=>{const st=(x,w,y,k)=>`<g><path d="M${x} ${y}h${w}l8 18H${x-8}z" fill="#e9e5db"/>${Array.from({length:Math.floor(w/12)},(_,i)=>`<path d="M${x+i*12+2} ${y}h6l${2+i*.3} 18h-7z" fill="${c}"/>`).join('')}
    <path d="M${x-4} ${y+18}V190M${x+w+4} ${y+18}V190" stroke="#4a4038" stroke-width="3"/><rect x="${x-4}" y="${y+56}" width="${w+8}" height="10" fill="#3a2a1c"/>
    ${[0,1,2].map(i=>`<rect x="${x+4+i*(w/3)}" y="${y+66}" width="${w/3-6}" height="${190-y-66}" fill="#2a2018" stroke="#3a2a1c"/>`).join('')}
    ${Array.from({length:4},(_,i)=>`<circle cx="${x+8+i*(w-16)/3}" cy="${y+50}" r="5" fill="${['#ff6b6b','#ffd166','#7ee081','#ff9f43'][(i+k)%4]}" opacity=".9"/>`).join('')}</g>`;
  return `<path d="M20 70q140 30 280 0" stroke="#3a3f47" fill="none"/>${Array.from({length:14},(_,i)=>{const x=24+i*20,y=70+Math.sin(i/13*Math.PI)*15;return `<circle cx="${x}" cy="${y}" r="2.6" fill="${lit(i)?'#ffd27a':'#2a2f37'}"/>`}).join('')}
   ${st(60,84,96,0)}${st(176,84,96,2)}<rect x="138" y="70" width="44" height="26" rx="3" fill="${c}" opacity=".95"/>${ic(160,83,18,'#0b0c0e')}`},
 // strandpaviljoen met terras, parasols en de zee
 beach:(c,u,lit,ic)=>`<rect x="0" y="120" width="320" height="34" fill="#0b1824"/><path d="M0 128h320M0 140h320" stroke="${c}" stroke-opacity=".15"/>
   <path d="M0 150q80-14 160-4t160-6V190H0z" fill="#2a251c"/>
   <path d="M86 150V104h150v46" fill="#1d2027" stroke="#3a3f47"/><path d="M76 104l14-18h142l14 18z" fill="#2a2e35" stroke="${c}" stroke-opacity=".6"/>
   ${Array.from({length:6},(_,i)=>`<rect x="${96+i*22}" y="112" width="16" height="26" fill="${lit(i)?'url(#'+u+'w)':'#111317'}" opacity="${lit(i)?.85:1}"/>`).join('')}
   <path d="M70 150h182v6H70z" fill="#5a4630"/><path d="M76 156v20M246 156v20" stroke="#5a4630" stroke-width="3"/>
   ${[[44,150],[278,154]].map(([x,y])=>`<path d="M${x-22} ${y-30}a22 12 0 0 1 44 0z" fill="${c}" opacity=".85"/><path d="M${x} ${y-30}V${y+16}" stroke="#d9d4c7" stroke-width="2"/>`).join('')}
   <rect x="140" y="72" width="42" height="12" rx="2" fill="${c}"/>${ic(161,78,10,'#0b0c0e')}`};

// Witwassen: belasting en tempo per nieuwe zaak (zelfde opbouw als WW_PROF in witwas.js). Vastgoed wast niet.
Object.assign(WW_PROF,{
 fiets:{tax:.21,t:'btw 21%',w:'Toeristen betalen contant en vragen geen bon',m:40},
 markt:{tax:.21,t:'btw 21%',w:'Contant over de kraam, niemand telt mee',m:45},
 avond:{tax:.09,t:'btw 9%',w:'Boodschappen vallen onder het lage btw-tarief',m:40},
 nagel:{tax:.21,t:'btw 21%',w:'De pinautomaat is altijd net stuk',m:35},
 souvenir:{tax:.21,t:'btw 21%',w:'Toeristen betalen contant en komen nooit terug',m:45},
 wasstraat:{tax:.21,t:'btw 21%',w:'Veel auto\'s per uur, kleine bedragen',m:45},
 pizza:{tax:.09,t:'btw 9%',w:'Eten valt onder het lage btw-tarief',m:40},
 taxi:{tax:.09,t:'btw 9%',w:'Personenvervoer valt onder het lage btw-tarief',m:45},
 bruin:{tax:.21,t:'btw 21%',w:'Drank, en vaste klanten die contant afrekenen',m:45},
 koerier:{tax:.21,t:'btw 21%',w:'Ritjes van alle maten, veel contant',m:55},
 coffeeshop:{tax:.21,t:'btw 21%',w:'Alles contant, de voordeur is gedoogd',m:75},
 sport:{tax:.09,t:'btw 9%',w:'Sporten valt onder het lage btw-tarief',m:45},
 groothandel:{tax:.21,t:'btw 21%',w:'Pallets en vrachten: grote facturen',m:85},
 rondvaart:{tax:.09,t:'btw 9%',w:'Een rondvaart is personenvervoer: laag btw-tarief',m:50},
 restaurant:{tax:.09,t:'btw 9%',w:'Eten valt onder het lage btw-tarief, en de rekeningen zijn hoog',m:60},
 hostel:{tax:.21,t:'btw 21%',w:'Overnachtingen zijn sinds 2026 21% btw',m:50},
 wissel:{tax:.258,t:'vennootschapsbelasting 25,8%',w:'Geldwissel is vrij van btw, je betaalt over de winst',m:130},
 verhuur:{tax:.21,t:'btw 21%',w:'Een dag Lamborghini kost meer dan een maandloon',m:100},
 transport:{tax:.258,t:'vennootschapsbelasting 25,8%',w:'Internationaal vervoer is 0% btw, je betaalt over de winst',m:85},
 juwelier:{tax:.21,t:'btw 21%',w:'Eén horloge is meteen een groot bedrag',m:130},
 importeur:{tax:.21,t:'btw 21%',w:'Hele containers vol sportwagens',m:120},
 beach:{tax:.21,t:'btw 21%',w:'Dure flessen op het strand, alles contant',m:70},
 diamant:{tax:.21,t:'btw 21%',w:'Klein, duur, en niemand kan de waarde narekenen',m:150},
 galerie:{tax:.09,t:'btw 9%',w:'Kunst valt onder het lage btw-tarief en niemand weet wat een doek waard is',m:140},
 rederij:{tax:.258,t:'vennootschapsbelasting 25,8%',w:'Internationaal vervoer is 0% btw, je betaalt over de winst',m:110},
 gcasino:{tax:.378,t:'kansspelbelasting 37,8%',w:'Over het spelresultaat, maar er gaat enorm veel doorheen',m:110}});

// Bonnetjes voor het verhoor bij de politie (Bon aanleveren)
if(typeof PB_ITEMS==='object')Object.assign(PB_ITEMS,{
 fiets:[['Fiets huren 1 dag',14],['Fiets huren 3 dagen',35],['E-bike 1 dag',29],['Fietstour centrum',32.5],['Fietsslot',8]],
 markt:[['Zonnebril',10],['Telefoonhoesje',7.5],['Handtas',25],['Sjaal',8],['Oplader',6]],
 avond:[['Krat bier',19.99],['Chips',2.49],['Vloei',1.2],['Energydrank',2.25],['Diepvriespizza',4.5],['Sigaretten',10.2]],
 nagel:[['Gellak handen',35],['Nieuwe set acryl',55],['Wimperextensions',69],['Pedicure',39.5],['Nail art per nagel',2.5]],
 souvenir:[['Klompjes sleutelhanger',4.95],['Tulpenbollen',9.95],['Delfts blauw tegeltje',12.5],['Magneet',3.5],['Goudse kaas 500 g',11.95]],
 wasstraat:[['Wasprogramma Basis',9.5],['Wasprogramma Premium',17.5],['Binnenkant stofzuigen',12],['Velgen poetsen',8],['Wasabonnement maand',29]],
 pizza:[['Pizza margherita',11.5],['Pizza quattro formaggi',14.5],['Calzone',15],['Tiramisu',6.5],['Cola 1,5 l',3.95]],
 taxi:[['Rit centrum',18.4],['Rit Schiphol',59],['Wachttijd',7.5],['Rit Zuidas',24.6],['Nachttoeslag',10]],
 bruin:[['Pils',3.6],['Jonge jenever',3.4],['Bitterballen',7.5],['Uitsmijter',9.5],['Rondje voor de zaak',36]],
 koerier:[['Spoedrit stad',24.5],['Pakket landelijk',12.95],['Nachtbezorging',45],['Rit met bakfiets',15],['Toeslag zwaar pakket',9]],
 coffeeshop:[['Pre-roll',8],['Space cake',10],['Muntthee',3],['Smoothie',5.5],['Vloei',1.5]],
 sport:[['Maandabonnement',39.95],['Dagpas',12.5],['Personal training',55],['Eiwitshake',4.5],['Bokshandschoenen',49.95]],
 groothandel:[['Pallet frisdrank',420],['Doos chips (24)',38.5],['Sigaretten (slof)',95],['Rol plastic folie',22.5],['Pallet water',310]],
 rondvaart:[['Rondvaart volwassene',19.5],['Rondvaart kind',11],['Avondvaart met diner',89],['Drankje aan boord',4.5],['Partyboot per uur',350]],
 restaurant:[['Proeverij 7 gangen',129],['Fles bourgogne',145],['Kreeft',58],['Champagne per glas',24],['Kaasplank',22.5]],
 hostel:[['Bed slaapzaal',42],['Privékamer',129],['Locker',5],['Ontbijt',8.5],['Toeristenbelasting',7]],
 wissel:[['Wissel EUR/USD',500],['Wissel EUR/GBP',750],['Commissie',12.5],['Goudbaar 10 g',780],['Spoedwissel',25]],
 verhuur:[['Huur Huracán 1 dag',1450],['Huur G-klasse 1 dag',690],['Chauffeur per uur',85],['Bezorgen aan huis',150],['Extra kilometers',220]],
 transport:[['Vracht Amsterdam-Warschau',2450],['Koeltransport',1890],['Wachturen chauffeur',140],['Tolkosten',185],['Overslag',360]],
 juwelier:[['Horloge',12950],['Gouden ketting',3450],['Ring met briljant',6800],['Oorbellen',1290],['Graveren',45]],
 importeur:[['Porsche 911 GT3',248000],['Invoerrechten',14500],['Transport per container',3200],['Keuring RDW',650],['Kentekenplaten',75]],
 beach:[['Strandbed',1000],['Fles champagne',450],['Sushi platter',68],['Cocktail',16],['Fles rosé',85]],
 diamant:[['Briljant 1 karaat',8900],['Briljant 0,5 karaat',3450],['Certificaat',150],['Slijpen',650],['Taxatie',250]],
 galerie:[['Schilderij (olie op doek)',38000],['Ets, gesigneerd',4500],['Beeldje brons',12500],['Lijst op maat',890],['Transport en verzekering',650]],
 gcasino:[['Fiches',5000],['Champagne',190],['Entree',5],['Hotelkamer',390],['Diner',145]]});
