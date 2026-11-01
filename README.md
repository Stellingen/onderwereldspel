# Onderwereld

Een maffia-klikspel in de browser met accounts. Begin als Rookie en werk je op tot Peetvader.

- **Website** (`/`, `public/js/landing.js`): elk onderwerp heeft een eigen pagina en adres (History API; de server geeft
  bekende paden `index.html` met de juiste titel, onbekende paden een 404 met dezelfde pagina "Doodlopende steeg"): `/misdaden` (alle 72 klussen in een kans-tegen-buit grafiek, filter per rang en sorteren),
  `/casino` en `/casino/<spel>` (elk spel een eigen illustratie, regels en uitbetalingen; de tabellen van Kluiskraker, Visdief en Suikerbaron
  komen live uit `slot.js`, `vis.js` en `zoet.js`; oefendemo's van Mines, roulette en de munt), `/families` en `/families/<id>` (verhaal uit
  `lore.js`, plek in de voedselketen, de machtsverhoudingen van nu uit `famwar.js`, doorgroeien tot Onderbaas en Baas), `/rangen`
  en `/training`. De voorpagina heeft een 3D-stadskaart met een meldkamer en een loopbaanlijn van Rookie tot Peetvader die je
  kunt slepen. Inloggen en account aanmaken werken zoals voorheen (`?login=1`, `?register=1`).
  Bovenaan staat het genre en kort "gratis · in je browser of als app · alleen virtueel spelgeld"; de meldkamer is gelabeld als
  sfeerimpressie (de meldingen zijn verzonnen, geen echte gebeurtenissen of spelers). Kansen op de voorpagina tonen de kans op de
  rang zelf (basiskans + 2 per rang, net als `chanceRaw` in het spel) met de basiskans erbij, zodat ze kloppen met wat je in het
  spel ziet (zonder training, spullen of familie). Onderaan **veelgestelde vragen** (`#faq`, uitklapbaar, ook met het toetsenbord):
  gratis, downloaden/als app, echt geld (nee), leeftijd (casino 18+), voortgang, wachtwoord vergeten (geen herstel: er is geen
  e-mailadres), ranglijst en meldkamer. In de footer klein: 18+ voor het casino, alleen virtueel spelgeld, niets uit te betalen.
- **Merknaam** staat op één plek: `brand.json` (`name`, `short`, `genre`, `tagline`, `url`). De server vult hem in `index.html`,
  `game.html` en `admin.html` in (`{{BRAND}}`, `{{TITLE}}`, `{{DESC}}`, `{{CANONICAL}}`, …), in het manifest, de sitemap en de
  deelgegevens, en geeft hem als `window.BRAND` aan de scripts (landing, installatie-uitleg). Tijdelijk overschrijven kan met
  de omgevingsvariabele `BRAND_NAME`; `SITE_URL` overschrijft het adres. Het gewone woord "onderwereld" in verhalen blijft staan.
- **Vindbaarheid**: elke publieke pagina heeft een eigen titel, beschrijving en canonical (server én browser), OG/Twitter-tags
  met `public/og.jpg` (echte screenshot van de voorpagina, 1200×630), JSON-LD `VideoGame` op de voorpagina (alleen feiten: naam,
  taal, gratis), `/robots.txt` (geen `/api/`, `/admin`, `/game`) en `/sitemap.xml` (voorpagina, onderwerpen, spellen en families).
  `/game` en `/admin` zijn `noindex`. `/index.html` stuurt door naar `/`. Wat alleen met Search Console te controleren is
  (indexering, rich results, previews op sociale media) is nog niet gedaan.
- **Spel** (`/game.html`) alleen voor ingelogde spelers; voortgang wordt opgeslagen in MySQL
- **Ranglijst** met echte spelers en rivalen uit de stad
- **72 misdaden** over 12 rangen (zes per rang), met energie (1 punt per 12 s, ook in het casino of de cel; uit de cel kom je met minstens +4% van je max per minuut, dus 5 minuten = +20%) zodat je niet alles kunt speedrunnen.
  Hoe hoger je rang, hoe meer elke klus oplevert: +6% buit per rang (Peetvader +66%), bovenop je familiebonus.
  **Levels binnen je rang**: elke rang heeft 5 levels (★ tot ★★★★★) op basis van je XP in die rang. Elk level geeft +3% buit
  en +1% op je passieve inkomen. Peetvader heeft eigen levels (100k, 150k, 225k, 340k en 500k XP). Je ziet je level in de
  topbalk, op het dashboard en op je profiel.
- **Wegrijden** (`carchase.js`): word je betrapt bij autodiefstal (straat afzoeken, carjacken, of een afgebroken diefstal na
  verversen) en kies je vluchten, dan rijd je weg met de auto (arrest() met `opts.chase`, `escapeGame()` kiest het spel). Eerst
  een kort filmpje: je karakter in je eigen outfit rent naar de auto, de motor brult, zwaailichten erachter. Daarna een
  achtervolging door de stad 's nachts (2,5D, natte weg met weerspiegelingen): ← → / A-D of vegen = baan wisselen,
  ↑ / spatie / omhoog vegen = nitro, ↓ / S / REM-knop = remmen. Ontwijk verkeer en politieversperringen; politieauto's komen
  van achteren naast je en knipperen naar jouw baan voordat ze je klem rijden (wissel weg, rem of geef nitro). Zijstraten
  (groen bord "Steeg") neem je door in de buitenste baan aan die kant te zitten: +22 m voorsprong en +1 nitro. Je verliest bij
  te veel klappen ("Motor kapot!") of als de politie je inhaalt ("Klem gereden!"); de spiegel bovenin toont hoe ver ze zijn.
  Niveau 1-5 (CC_LV): sneller, drukker, meer versperringen en politie, minder voorsprong en nitro. Rijvaardigheid, uitrusting,
  outfit, familie en lidmaatschap geven meer ruimte en voorsprong. Elke rij is haalbaar: het vrije gat ligt hooguit één baan
  naast het vorige en er zit altijd tijd tussen om een auto voorbij te gaan. Getest met een speelbot (`ov._cc()` test-hook).
- **Vluchtspel** (`flee.js`): gaat een klus mis, dan ren je weg door een steeg of een gebouw (2.5D): wissel van baan met
  pijltjes/A-D, vegen of tikken, spring met omhoog of spatie, ontwijk obstakels en agenten. Op straat is dat makkelijk, in een
  afgesloten gebouw bijna onmogelijk. Sinds de ombouw: een korte intro (de agent betrapt je, jij rent weg; tik om over te slaan),
  je eigen outfit op de renner, **bukken** onder steigers en rolluiken (↓, S, omlaag vegen of de knop), regen buiten, de zaklamp van
  de agent die dichterbij komt, en een langere, snellere route (±25% langer, krappere gaten). Getest met een bot (reactie 0,3 s):
  niveau 1 tot 4 te halen, niveau 5 alleen met snelle reacties. Elke achtervolging loopt op van makkelijk naar moeilijk: eerst losse obstakels met
  ruimte ertussen, dan hekken, auto's en mensen of honden die oversteken, en na de rode streep op de route de **eindsprint**:
  rijen vlak na elkaar (slalom), overstekers en bewakers die met je meeschuiven. Ongeveer 35% meer rijen en meer obstakels per rij, in ongeveer dezelfde tijd, met
  nieuwe soorten (container, vuilniszakken, dranghek, natte-vloerbord, printer, bureaustoel, schoonmaker, hond). De tijd tussen
  twee rijen zakt van ±1,05× naar ±0,6× het tempo van het niveau, nooit onder een halve seconde. Conditie, vervoer, outfit,
  familie en woning maken het makkelijker. Lukt het: vrij en niet gezocht. Mislukt het: cel met 20% extra straf.
- **Misdaden** (`misdaden.js`): klussen onder je rang gaan makkelijker: per rang erboven +1% extra kans, de hitte drukt minder op je kans en het plafond gaat van 95% naar 98% (er blijft altijd 2% risico). Lukt zo'n klus (2+ rangen eronder), dan stijgt je hitte 2 tot 3. elke klus heeft een eigen icoon en een balk met kans, opbrengst (plus XP en cred) en wat er
  gebeurt als het misgaat (straf en hoe moeilijk vluchten is). Bovenaan de drie beste klussen voor jou, met opbrengst per energie.
- **Training** met tijdsloten (11 plekken; nieuw: **Uithouding**, elke klus kost tot 30% minder energie en je laadt tot 30% sneller op,
  en **Ademhaling**, tot +3%-punt slaagkans en meer ruimte bij vluchten): elke sessie is één level, tot level 50. Elk level is duurder (conditie: €60 voor level 1,
  ongeveer €690.000 voor level 50). Oude saves worden omgerekend: elke gedane sessie telt als één level.
  9 plekken: Conditie, Vingervlugheid, Snelheid, Rijvaardigheid, Charisma en (vanaf een rang) Schieten (Dief: +0,5% slaagkans
  per level bij zware klussen vanaf Gangster), Hacken (Boef: +0,5% buit per level), Handelsgeest (Gangster: +0,4% passief inkomen
  en −1% beleggingskosten per level) en Rechtenkennis (Soldaat: −1% celstraf en −0,4% borg per level). Bovenaan staat een
  overzicht met een ring per skill en wat er klaar staat.
- **Ontspanning** in drie niveaus: Even bijkomen (espresso, shoarma, nieuwe look), Echt ontspannen (sauna, privéclub,
  onderduiken) en Luxe (wellness in Zeeland vanaf Gangster, jacht bij Monaco vanaf Capo, privéjet naar Ibiza vanaf Consigliere).
  Hoe beter, hoe duurder en hoe langer de wachttijd (20 minuten tot 8 uur). Prijs = basis × (1 + 0,5 per rang) × (1 + 10% per
  rang-level). Luxe geeft ook een tijdelijke buitbonus (+10% of +15%).
- **Blackjack** aan een volle tafel (6 kaartspellen, dealer staat op 17, splitsen/verdubbelen, 3:2) met side bets
  Perfect Pairs (perfect pair 27:1, gekleurd 12:1, gemengd 6:1; RTP ±97% bij 6 decks) en 21+3 (€10 tot €500 per rang: Straatschoffie €500, Boef €2.500, Peetvader €6.000), hoofdinzet tot €50.000. **Three Card Poker** met Ante/Play, Pair Plus en 6-Card Bonus (zelfde maximum per rang). Knoppen: Kaart (hit), Passen (stand), Verdubbelen, Splitsen; kan verdubbelen of splitsen niet, dan is de knop rood en doorgestreept met de reden (geen paar, te weinig saldo). Play bij Three Card Poker is gelijk aan de ante, net als in het casino. **Texas Hold'em** (casinovariant, `public/js/pages/holdem.js`): ante, dan 2 kaarten + flop; meespelen = call van 2× de ante, anders passen (ante kwijt). Dealer speelt vanaf een paar vieren; speelt hij niet, dan betaalt de ante volgens de tabel (royal 100:1, straight flush 20:1, carré 10:1, full house 3:1, flush 2:1, rest 1:1) en krijg je de call terug. AA Bonus (jouw 2 + flop, vanaf paar azen of twee paar 7:1 tot royal 100:1). Doorgerekend (`sim_holdem.js`): ±98% RTP over alle inzetten, AA Bonus ±94%. **Lobby**: tik je op Casino, dan kies je eerst een spel uit banners met de illustratie erachter (slots, snel spel, aan tafel); in een spel brengt "Alle spellen" je terug. De illustraties staan in `public/js/covers.js` en worden ook door de website gebruikt. Code: `public/js/pages/tafels.js`.
- **Ranglijst**: podium voor de top 3 (goud, zilver, brons), jouw plek met hoeveel je nog nodig hebt, en gekleurde rangen in de lijst.
- **Verblijf** (`verblijf.js`, scènes en inrichten in `inrichting.js`): de winkel heeft filters (gezondheid en rust, energie, onderduiken en hitte, veiligheid, focus en vluchten). **indeling**: bovenaan rusten, dokter en onderduiken (op de telefoon drie compacte tegels), daaronder twee grote knoppen: **Winkel** (spullen per kaart met wat ze doen en de prijs; wat bij een betere woning hoort staat er al op slot; betalen met contant of van je bankrekening) en **Upgraden** (de woningladder met vergelijking, kopen met wit geld of van de bank). Daaronder je woning; tik erop om in te richten. Oorspronkelijk: de woningen staan bovenaan als ladder, elk met een
  isometrische scène (onder de brug, kraakpand, huurkamer, grachtenappartement, penthouse, villa) en een aantal plekken
  (1, 2, 4, 6, 9, 13). Klik op je woning om in te richten: 19 spullen, neerzetten, opbergen of verkopen (de helft terug);
  wat niet past na een verhuizing gaat naar de opslag. Bekijk een andere woning voor een vergelijking.
  Rusten vult je energie en geeft +20% gezondheid of meer (beter huis = meer), daarna 5 minuten wachten (beter huis = korter).
  Dokter: +20% gezondheid in 10 seconden, daarna 10 minuten wachten. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.
  **Inrichting**: 37 stukken in vijf soorten (gezondheid en rust 10, energie 8, onderduiken en hitte 7, veiligheid 4, focus en
  vluchten 8; de soort is het belangrijkste voordeel). Nieuw: meditatiekussen, koelkast vol energiedrank, medicijnkastje,
  schaaktafel, politiescanner, smoothiebar, daglichtlamp, stadskaart met routes, alarmsysteem, spinningfiets, vermommingskast,
  massagestoel, draaiende boekenkast, klimmuur, powernap-capsule, ijsbad, bubbelbad en paniekkamer. Ze staan in je woning op vaste
  vrije plekken (`VH_SPOT`, tekeningen in `VH_GEN`).
- **Auto's** (51 modellen, nieuw o.a. busjes, pick-up, muscle cars, luxe sedans, limousine en klassiekers; in de collectie heeft
  elk model zijn eigen kleur en staat erbij wat voor auto het is; nog niet gestolen is grijzer): **lobby** met bovenaan de brede banner **Garage** (je gestolen auto's, met je drie duurste erop), daarna Straat afzoeken, Carjacken, Het Autokerkhof en De heler. In de garage is elke auto een grote kaart (zeldzaamheid, heet/gemeld/heler zoekt hem, bouwjaar, km-stand, staat, nieuwprijs). Duidelijke knop **Terug naar auto's**. **Garage**: 2 plekken, uit te bouwen naar 4/6/8/10 (€25.000/€90.000/€300.000/€900.000 wit). **Verkopen** gaat via kopers die bieden (68% tot 110% van de gemiddelde prijs), met de nieuwprijs ernaast; 3 biedingen per speluur (10 min), daarna wachten. Netjes verkocht = wit geld, contant of overgemaakt naar je bank. Een deel van de gestolen auto's (en elke gecarjackte) is **als gestolen gemeld**: die wil geen koper, alleen het autokerkhof, de heler of je familie. Zoekt de heler het model dat je vindt (straat of stoplicht), dan staat dat er meteen bij. **Collectie en kansen**: per zeldzaamheid grote kaarten per model met waarde, kans, gezien/gestolen en of de heler hem zoekt. **Het Autokerkhof** (vanaf Dief, €80.000 wit) sloopt elke auto voor 60% van de waarde in zwart geld. 38 modellen, elk getekend in zijn eigen klasse (stadsauto, hatchback, sedan, stationwagen, SUV, super-SUV, sportwagen, GT, supercar, hypercar, terreinwagen, limousine en meer) op basis van echte afmetingen, zonder merktekens (`carSvg` in `carheist.js`). Klik op "Zoek een auto" (2 energie) en je komt willekeurig iets tegen; de kans per model staat
  **Na het stelen** (straat afzoeken of carjacken) verschijnt een keuzevak: naar je garage (de nieuwe auto licht daar op), terug naar
  het overzicht, of, als de heler dit model zoekt, meteen verkopen aan de heler (precies deze auto, ×1,4 tot ×1,9, zwart geld).
  **Straat afzoeken maakt moe**: elke zoektocht in een reeks kost meer energie (2, 3, 4, 5, 6, 8, 10, 12, 14, 17, 20, 23, 26, 30, 34;
  voor iedereen gelijk). Gewoon mag 6 keer achter elkaar, VIP 10 en High roller 15; daarna uitrusten: 8 / 6 / 4 minuten. Zoek je
  zo lang niet, dan begin je ook weer bij 2. Onder de knoppen staat een balk 'Conditie' met wat elke zoektocht kost (`S.carHunt`).
  ernaast (een Fiat Panda ruim 6%, een Lamborghini Huracán 0,4%, een Bugatti Chiron 0,15%). Elke vondst heeft een eigen bouwjaar,
  kilometerstand, staat en dus prijs binnen de prijsklasse van het model. Stelen met 'Contact maken': zeldzamer = meer sloten achter elkaar,
  minder tijd per reeks en rode pijlen die je andersom moet indrukken. Rijvaardigheid geeft meer tijd en een betere prijs.
- **Onderduiken** (Verblijf): loopt door als je weggaat. Op Verblijf zakt je hitte 20% per minuut en word je bijna nooit herkend;
  elders loop je vermomd rond: 5% per minuut en een agent kan je herkennen (dan word je opgepakt). Bij 0% ben je niet meer gezocht.
- **Borg** groeit met je rang: als Dief kost 2 minuten zo'n €900, als Peetvader 10 minuten zo'n €150.000. Charisma geeft korting.
- **Telefoon**: onderbalk met Start, Misdaden, Auto's, Casino en **Meer**. Meer opent een menu met alle pagina's per groep
  (Straat, Geld, Macht, Overig), met per pagina wat er speelt (energie, cel-tijd, inkomen per speldag, codes om te claimen).
  De vijfde knop heet altijd **Meer** (oplichtend als je op een pagina uit het menu zit), zodat je het menu nooit kwijtraakt.
  Bovenin het menu een zoekveld dat pagina's én wat je erop kunt doen vindt (kliniek, onderduiken, trainen, roulette,
  codes, witwassen...; Enter opent het eerste resultaat, een casinospel opent meteen dat spel), en je laatst bezochte pagina's.
  De statusbalk heeft twee rijen zonder zijwaarts vegen: boven je rang (VIP- of HR-tag erboven), energie, cred, gezondheid
  en hitte (tik op energie, gezondheid of hitte om er iets aan te doen), onder je geld: contant (wit) groot, zwart en bank. In het casino: saldo groot met daaronder
  wit en zwart apart, bank rechts, en een rij knoppen voor cashback claimen, de geluksdobbelsteen en de verdenking.
  De statusbalk blijft bovenaan staan als je scrolt (in het casino schuiven claim/geluk weg en blijven saldo en bank staan); bovenin houdt een strook in de achtergrondkleur alles
  vrij van de klok, batterij en het eiland van de iPhone (ook in pop-ups en het vluchtspel). De nieuwsband en
  het kruimelpad vallen weg, en de casinospellen staan als 2 rijen knoppen. Hertekenen houdt je scrollpositie vast; in de slots
  worden alleen de onderdelen bijgewerkt die veranderen. Op de computer is niets veranderd.
- **App-icoon**: hoed voor een straatlantaarn (`public/icons/`), met `manifest.webmanifest`, apple-touch-icon en favicon.
  Op de telefoon: delen → "Zet op beginscherm" (iPhone) of menu → "App installeren" (Android); hij opent dan zonder browserbalk.
- **Opslaan en één apparaat tegelijk**: de server bewaart je voortgang met een versienummer. Wie het spel opent, wordt het actieve
  apparaat; een ander (ouder) apparaat mag daarna niet meer opslaan en krijgt de melding "Je speelt op een ander apparaat" met een
  knop om daar verder te spelen (dan laadt hij de actuele stand). Zo kun je geen geld dubbel uitgeven op twee apparaten. Na een
  casinoronde gaat de stand meteen naar de server. Valt de server even weg, dan probeert het spel het opnieuw; browser-voortgang
  wint alleen als die op dezelfde versie verder bouwt.
- **Arrestaties zijn verversbestendig**: openstaande keuze komt terug, afgebroken vlucht of autodiefstal telt als mislukt.
- **Speldag = 4 uur.** Bedrijven verdienen per speldag; het geld gaat in de kas en wordt om 00:00, 04:00, 08:00, 12:00, 16:00
  en 20:00 (eigen klok) uitbetaald. Terugverdientijd van ±3 speldagen (wasserette) tot ±8 (privéjet).
- **Straatcredit** krijg je voor geslaagde klussen: hoe beter uitgevoerd (perfect ×1,5, netjes ×1,2) en hoe beter je uitrusting
  (per soort je beste item, +4% per niveau), hoe meer. Families vragen nu veel meer cred (De Nieuwe Garde 30 … La Cupola 1.000).
- **Witwassen**: elke route (je zaak, Ome Kees, het casino) heeft bovenaan een illustratie.
- **Bezit**: opent op **Mijn bezit**: je eigen zaken (een tegel per zaak met vestigingen, level en inkomen) en daaronder de knop **Koop meer zaken**. Die opent de winkel met tabbladen per categorie (met aantal en icoon): Winkels en diensten, Horeca en nachtleven, Auto's, Handel en transport en **Vastgoed** (Bovenwoningen, Winkelpanden, Bedrijfshallen, Vastgoedportefeuille: 20% meer huur, maar je kunt er niet door witwassen); met **Mijn bezit** ga je terug. Elke zaak is een banner met een eigen gevel (winkelpui, garage, toren, haven of hangar; verlichte ramen = je vestigingen), tik erop voor de vestigingen en upgrades. Hoe witwassen via een zaak werkt (belasting en snelheid per soort zaak) staat bij Zwart geld en witwassen. 17 soorten bedrijven, van Wasserette (€5.000, €1.250 per speldag) tot Privéjet-charter (€4 mln., €392.250 per speldag), elk vanaf een
  bepaalde rang. Klik op een bedrijf voor de details: tot 10 vestigingen per soort (elke volgende 25% duurder) en elke
  vestiging los upgraden van level 1 naar 5 (×1 / ×1,5 / ×2,2 / ×3,1 / ×4,3 inkomen) met eigen upgradenamen.
  **Bonus op al je inkomen**: +25% basis, +0,5% per vestiging en +0,25% per upgrade (samen tot +50%), +3% per rang, +0,5% per level.
  Zo levert elk bedrijf meer op naarmate je imperium groeit en je hoger in rang komt (Bezit toont de verdeling).
  "Upgrade alles wat kan" upgradet steeds de laagste vestiging eerst. Oude saves worden omgezet (aantal → vestigingen op level 1).
- **12 families** (`public/js/pages/families.js`), van De Nieuwe Garde (vanaf Loopjongen, 30 cred) via La Cupola (1.000 cred) tot De Erven Morano (vanaf Peetvader, 4.500 cred en 25 huurmoorden).
  Iedereen begint onderaan als *Aspirant* en klimt met **eer** via Lid, Vertrouweling, Luitenant en Rechterhand naar *Erelid*.
  Als Aspirant krijg je 50% van de familiebonus (kans, buit, straf) en van het eigen voordeel, elk level +10%. Bij elke promotie
  krijg je geld. Grotere families vragen meer eer (+50% per familie). Overstappen kan, maar dan begin je weer onderaan.
  - *Eigen voordeel*: Nieuwe Garde −20% wachttijd klussen, Kurogumi +20% passief inkomen, Colombra −40% borg, Bratva Volkov
    +25% makkelijker vluchten en +10% ontsnappen, Los Halcones +25% autowaarde, Lucchetti 20% kans dat je zaak wordt
    geseponeerd, Gambrino +20% XP, La Cupola +10% XP, +10% inkomen en −20% hitte.
  - *Eer*: elke geslaagde klus (je straatcredit telt als eer), elke gestolen auto, auto's afleveren in de garage (30% van de
    waarde plus eer) en missies.
  - *Dagelijkse missies*: 5 per dag (nieuw om middernacht). Haal er minimaal 3, anders verlies je 10% van je eer. Alle 5 geeft
    extra eer en straatcredit. Grotere families geven zwaardere doelen (tot 10 auto's stelen, 8 auto's afleveren, €1,4 mln.
    verdienen) en een grote klus die vuurkracht en uitrusting vraagt: van een avondwinkel overvallen (mes) tot de bank
    (AK-47, kogelvrij vest, signaalverstoorder) en De Nederlandsche Bank (machinegeweer, militaire uitrusting, thermische lans).
    Missiegeld groeit met je familielevel (Erelid ×2).
  - *Machtsverhoudingen en bendeoorlog* (`famwar.js`): elke periode van 5 speldagen (20 uur) staat er een nieuwe stand van alle
    families, voor iedereen gelijk (vaste seed per periode); de grootste families blijven meestal bovenaan. De laatste 2 speldagen
    is het oorlog tegen de familie boven je: 3 slagen per oorlog op een stadskaart met 19 wijken (aanvallen en verdedigen op
    timing). Winst geeft geld, eer, cred en XP en duwt je familie omhoog; verlies kost gezondheid. De top 3 krijgt per periode een
    uitkering.
  - *De familie leiden*: na Erelid volgen **Onderbaas** (genoeg eer en 3 gewonnen slagen) en **Baas** (een duel tegen de baas uit
    het verhaal). Beide krijgen elke speldag een afdracht en een sterkere familiebonus (Onderbaas 110%, Baas 125%).
  - Klik op een familie voor het verhaal (`lore.js`), haar plek in de stad over de laatste 8 periodes, toelating en voordeel.
- **UX-update: spelfixes, toegankelijkheid en oefenen** (`public/js/practice.js`, `public/css/ux-game.css`):
  - *Oefenen · telt niet mee*: rennen (misdaden), contact maken en wegrijden (auto's). Alleen de minigame zelf wordt gestart,
    nooit de actie eromheen: energie, geld, hitte, straf, cred, auto's en statistieken blijven gelijk (getest door S voor en na
    te vergelijken). Eerst uitleg en niveau, dan Start en een aftelling. Niet in de cel of tijdens een echte achtervolging.
  - *Verblijf*: de knop "Weer over" telt mee met dezelfde klok als de ring (bleef eerst op de tijd van het tekenen staan).
  - *Poker* (Three Card en Hold'em): vóór het delen staat wat een hand maximaal kost (ante + side bets nu, play of call straks).
    Je fiche en laatste inzet worden per spel onthouden in deze browser (`ow_tb_pref`); het bonnetje toont netto én bruto.
  - *Training*: kleine effecten met passende precisie (+0,4% in plaats van +0%); kans-effecten in %-punt (`pctTxt`).
  - *Misdaden*: onder je kans staat de basiskans (zoals op de voorpagina); de titel en schermlezertekst geven de hele opbouw
    (basis + rang + uitrusting … − hitte, × lidmaatschap). Bij de buit staan rang en level apart, met uitleg dat de levelbonus
    per rang opnieuw begint (daardoor zakt de buit na een promotie even, bijv. ×1,12 naar ×1,06).
  - *Roulette*: elk vak heeft een eigen toegankelijke naam (kolommen met hun echte nummers), een rustige live-regio voor fiche,
    inzet, draaien en uitslag, zichtbare focus en "rood"/"zwart" als woord bij de ruitjes.
  - *Bajes*: de bibliotheek noemt alleen een omgedraaid boek bij naam en kondigt paren aan; bij het werk zie je vooraf hoe lang
    je nog zit, met een waarschuwing als je straf eerder om is dan het klusje, en een duidelijke melding als je vrijkomt tijdens
    het werk (loon voor wat af was, geen strafvermindering).
- **Bajes** (`bajes.js`, werk in `jailjobs.js`): een straf duurt 30 tot 60 seconden langer, zodat je er iets kunt doen. Vier
  klussen in de bajes (wasserij: sorteren, keuken: timing, werkplaats: ritme bij het nummerplaten slaan, bibliotheek: geheugen),
  elk 16 tot 25 seconden met een wachttijd. Ze betalen een klein bedrag dat met je rang meegroeit en goed werk haalt tijd van je
  straf (hooguit 40%). Bij langere straffen komen er gebeurtenissen met een keuze: ruzie op de luchtplaats, een bewaker met een
  deal (Henk wordt een vaste contact: −10% op elke volgende straf), een tip van je celgenoot, een celinspectie of een advocaat.
  Borg betalen werkt zoals voorheen. **Ontsnappen is een spel** (`jailbreak.js`, `jailbreak.css`): na een kort filmpje (de cel bij
  nacht, je eigen karakter met je outfit, een geslepen lepel) volgen drie fases. 1) De tralies: vijl in het ritme (druk als de
  naald in het groene stuk staat), mis je dan maak je lawaai, en komt de bewaker langs dan doe je niks. 2) De gang, van bovenaf:
  stap voor stap naar de deur, bewakers lopen hun ronde en zoeklampen draaien; in het licht = gezien, en voor de celtelling heb je
  een beperkt aantal stappen. 3) De muur: links en rechts om de beurt klimmen en stilhouden als het zoeklicht op je staat.
  Moeilijkheid (Makkelijk tot Bijna onmogelijk) komt uit escChance() (lidmaatschap, familie, outfit) en de straf die nog over is:
  meer kans = bredere groene zone, kortere lichtkegels, meer stappen en een trager zoeklicht. Alle drie de gangen zijn
  doorgerekend oplosbaar (`jbSolve`). Mislukt: +30s straf (ook bij verversen tijdens een poging, via S.pendingEsc). Gelukt: vrij
  en op de gezochtlijst.
- **Wapens & uitrusting** (`public/js/pages/wapens.js`): een **winkelstraat** met vier zaken als banner met gevel: Het Arsenaal (wapens en bescherming), Bouwmarkt Hamer (gereedschap), Belwinkel De Lijn (communicatie) en Motorhuis Snel (vervoer om te vluchten); tik op een zaak om naar binnen te gaan. 24 items in 5 soorten, elk met tiers en een rang-eis. Per soort telt je
  beste item. Wapens: slaagkans en vuurkracht (Vlindermes tot Machinegeweer, +3% tot +18%). Bescherming: slaagkans en kortere
  celstraf. Gereedschap: buit en meer tijd bij auto stelen. Communicatie: minder hitte na elke klus (−10% tot −55%).
  Vervoer: makkelijker vluchten (opgevoerde scooter +6% tot helikopter op afroep +25%), de duurdere ook wat minder hitte.
  Oude saves: vroeger telde alles bij elkaar op; overbodige oude items worden terugbetaald.
- **Politiebureau** (`public/js/pages/politie.js`, `public/css/politie.css`). Word je opgepakt (jailFor), dan neemt de politie
  contant **zwart** geld boven de grens in beslag: je houdt €10.000 (gewoon), €15.000 (VIP) of €30.000 (High roller). Per
  arrestatie een dossier; binnen 24 uur terug te eisen op het bureau, één poging, en alleen met een zaak die het kan verklaren
  (een zaak om door wit te wassen, geen vastgoed). De balie kiest: een **verhoor** (vragen over je echte zaak en de arrestatie:
  welke zaak, waar, hoeveel vestigingen, wat ze per speldag verdienen, hoeveel geld, hoe laat; tijd per vraag) of een **bon
  aanleveren** (de echte kassabon even bekijken, dan namaken uit losse regels met bijna-goede valse regels ertussen, printen,
  de rechercheur legt hem naast het origineel). Minstens 80% goed: het geld komt wit terug min 21% belasting (net als witwassen
  via je zaak). Minder, te laat of verversen tijdens een poging: het geld is weg. Hoe groter het bedrag naast je inkomen per
  speldag, hoe moeilijker. Bovenaan een 3D-model van het bureau (CSS 3D, sleep om te draaien).
- **Bank** (`public/js/pages/bank.js`, koersen in `public/js/market.js`) is een **bank-app** (OnderBank): bovenaan je totaal bij
  de bank, wat er per uur vanzelf bijkomt (rente, uitkering, lopende deposito's), de verdeling en een bankpas met je naam (kleur per
  lidmaatschap), met vier snelknoppen: **Storten** en **Opnemen** openen de **pinautomaat** als venster over de app (toetsen,
  je toetsenbord of het veld; 25% / 50% / 75% / Alles; OK, Corr, Stop; daarna een bevestiging en geld uit de gleuf; Esc of het
  kruisje sluit), **Vastzetten** gaat naar een nieuw deposito en **Beleggen** naar de fondsen. Tabbladen: **Overzicht** (de drie
  rekeningen als kaarten met eigen icoon en knoppen, transacties en wat je op zak hebt), **Rekening** (spaarrekening met
  rekeningnummer, rente, vergelijking en de laatste 30 transacties), **Deposito's** en **Beleggen**. Transacties (`S.bkTx`, `bkTx`):
  stortingen, opnames, deposito's, beleggingen, auto's verkocht naar de bank en betalingen van de bank (borg, woning, inrichting).
  Per lidmaatschap: spaarrente 0,10% / 0,12% / 0,15% per uur
  (gewoon / VIP / High roller), 2 / 5 / 10 depositoplekken en in totaal €100.000 / €300.000 /
  €1 mln. beleggen, keer (1 + je rang): een Peetvader met High roller mag tot ±€12 mln. inleggen (ook in coins). Lopende deposito's en beleggingen boven die grens blijven gewoon staan. Alles bij de bank ben je niet kwijt als je gepakt wordt.
  - *Spaarrekening*: 0,10% rente per uur (VIP 0,12%), vrij opneembaar, ook offline tot 12 uur. (Was 1% per 10 minuten:
    dat is ruim 300% per dag en maakte beleggen zinloos.)
  - *Deposito* in speltijd (1 speldag = 4 uur): een halve speldag (2 uur), 1, 2 of 3 speldagen (12 uur). Rente gewoon / VIP /
    High roller: halve speldag 1,5 / 1,8 / 2,2%, 1 speldag 3 / 3,6 / 4,4%, 2 speldagen 5,5 / 6,6 / 8%, 3 speldagen 8 / 9,6 / 11,6%.
    Veel meer dan de spaarrekening (0,10% per uur), maar je geld staat vast en het maximum per deposito groeit met je rang.
    VIP en High roller zien de gewone rente doorgestreept met hun eigen rente ernaast. Alleen te openen met geld van je spaarrekening.
    Kan niet zakken; na afloop gaat alles vanzelf naar je spaarrekening. Eerder opzeggen kost 2% en je krijgt geen rente.
    Lopende deposito's houden de rente waarmee ze zijn geopend.
  - *Beleggen*: Staatsobligaties, Vastgoedfonds Zuidas, Haven Rotterdam NV en OnderCoin. Elk fonds keert per uur uit (rente, huur,
    dividend, staking: ±5% tot ±17% per dag) en heeft een koers die kan stijgen en dalen. De koersen zijn voor alle spelers gelijk en
    lopen door als je offline bent (vaste functie van de tijd, Brownse brug, dus geen server nodig). Kosten 0,25% tot 1% bij kopen
    en verkopen (VIP de helft). Kans op verlies na 24 uur: 0% / 13% / 30% / 37%, na 7 dagen 0% / 0% / 1% / 9%.
  - *Nieuwe coins* (`market.js`, `MK.coin`/`MK.coins`): elke 4 uur komt er een nieuwe coin op de markt, voor iedereen dezelfde.
    60% is een memecoin: stijgt hard (±25–40% per uur), maar kan elk moment crashen; haalt hij 50× dan crasht hij zeker. Bij een crash
    staat er "Dit was een scam", is je inleg weg en gaat hij van de markt (nog 12 uur zichtbaar). 40% is een echte coin: rustiger, licht
    stijgend, na 48 uur naar de grote beurs (je stukken worden verkocht tegen de laatste koers). Echt of meme zie je alleen aan de naam
    en de grafiek. Doorgerekend: een memecoin een uur vasthouden levert gemiddeld ±92% op, verkopen bij 2× of na 3 uur ±83%
    (de crashkans per uur is iets groter dan de groei). Er staat ±37% van de tijd een memecoin op de markt. Kosten 1,2%.
  - Max per deposito en per fonds: €250.000 × 2 per rang (Capo €64 mln., Peetvader €512 mln.).
- **Profiel** met codes inwisselen (één keer per account, vastgelegd in de database). Codes staan in `server.js` (`CODES`): `lotto` (€1.500), `welkom` (€500), `casino` (€5.000), `vip` (€20.000), `spinnetje` (€25.000), `jackpot` (€1.000.000) `trainwreck` (€3.000.000; daarna kun je in Kluiskraker inzetten tot €500.000 per spin) en `highroller` (€50.000; ook te typen als "High Roller", spaties en streepjes tellen niet mee). De oude codes `m1` tot en met `m9` zijn weg en verdwijnen ook uit 'gebruikte codes'. Daarnaast is er een **rangcode** per rang (de naam van de rang, bv. `straatschoffie` €150 tot `peetvader` €500.000), alleen geldig als je die rang hebt bereikt.
- **Kluiskraker**: cluster-slot op **10×10** met 9 symbolen (5+ aangrenzende gelijke symbolen, uitbetaling per clustergrootte
  tot 20+), Loper als wild, vakjes die bij elke winst x2, x4 … tot **x4096** worden. **3 kluizen = 10 free spins, 4 = 12, 5 = 14,
  6+ = superbonus.** Extra kluizen **tumbelen erin**: zolang er winst valt vallen er nieuwe symbolen in, en liggen er al 3 kluizen,
  dan valt een 4e, 5e of 6e makkelijker in. Tijdens de bonus geven 2+ kluizen extra spins.
  **Gouden baar**: valt hij in de gewone bonus, dan blijft hij de hele bonus vast op zijn vakje liggen (ook bij tumbles en nieuwe
  spins) en telt hij als **loper**, dus hij helpt clusters maken. Heb je er 3, dan win je de max win (heel zeldzaam).
  **Superbonus**: 8 spins met veel meer lopers; daar is één Gouden baar al de max win.
  **Balans zoals Pragmatic Play** (Sugar Rush, Gates of Olympus): winst ±1 op 2,7 spins (1 op 5 spins minstens je inzet terug),
  bonus 1 op ±400 / 350 / 300 (gewoon / VIP / High roller) maar gemiddeld ±105× je inzet (mediaan ±55×, 1 op 10 onder 20×,
  3 op 10 boven 100×). Clusters van 5 betalen 0,35× (Speelkaart) tot 4,5× (Goudstaaf), van 10 stuks 3× tot 40×; grote clusters zijn
  op 10×10 met 9 symbolen zeldzaam (12+ ±1 op 6.000 spins). Een gekochte bonus betaalt 35–36% van de tabel (je begint met 8 vakjes op
  x2, de kluisvakjes op x2 en 2 extra spins), mediaan ±50×.
  **Kluizen betalen zelf ook** in de spin die de bonus geeft (gewoon en gekocht, geteld na het doortumbelen): 3 = 5×, 4 = 10×,
  5 = 25×, 6+ = 100× je inzet (meer dan 5 Goudstaven, want 3+ kluizen is veel zeldzamer). Daarvoor is de bonusfactor FS_K
  omlaag (0,91 → 0,846) en BUY_KT ook (gekocht valt vaak 4+ kluizen: kluiswinst ±9% van de prijs). Gemeten met `kkm2.js`
  (6 mln. rondes): RTP 92,5 / 94,5 / 95,7%, waarvan kluiswinst 1,9 / 2,2 / 2,8%; bonus gemiddeld ±102×, mediaan ±53×.
  Bonus kopen (`simbuy5.js`, 2× 200.000): ±93 / 94,3 / 96%, waarvan kluiswinst ±8,6 / 8,8 / 9%.
  **Vakjes gaan mee de bonus in**: wat in de spin vóór de bonus gemarkeerd is blijft gemarkeerd (de volgende winst daar is meteen
  x2), x2 en hoger blijft staan, en elk vakje waar een kluis ligt begint op x2 (gemiddeld ±3 op x2 en ±2,5 gemarkeerd). Geldt ook
  voor een gekochte bonus. Doorgerekend met `kkr.js` (basisspins + per trigger 10 bonussen met dezelfde startvakjes). Doorgerekend met `sim9.js`, `simbuy4.js`, `kkm.js` (verdeling) en `kkb.js` (basisspel).
  **Max win**: 5.000× je inzet per ronde, ook bij een gekochte bonus (de inzet telt, niet de prijs van de bonus); ±1 op 1.000 gekochte bonussen.
  **Bonus kopen** (100× de inzet) zet je aan met een schakelaar naast de draaiknop; je krijgt altijd 3 kluizen bovenop wat er
  vanzelf valt en kunt doortumbelen tot de superbonus; +2 free spins (superbonus +1). **8 vakjes beginnen op x2** en er is een
  **vangnet**: altijd minstens 20× je inzet terug. Verdeling (gewoon): mediaan ±52×, 25% van de keren 100× of meer, 9% 200× of meer.
  **Inzet kiezen** gaat via een pop-up (ook bij Visdief).
  **Snelheid** 1× (rustig), 2× (sneller) en 3× (snelst), voor alle slots en Hoogvlieger, bewaard bij je account. Eén schuifje
  (`slotSpdHtml` in kluiskraker.js): een meter die meedraait, ▶-pijltjes per stand en een gekleurd blokje dat meeschuift, in de
  kleur van het spel (groen, turquoise, roze, goud). Smal: alleen 1×/2×/3×; breed: met Rustig/Sneller/Snelst eronder.
  Het verandert alleen de animatie, nooit de uitkomst.
  Links bij **Laatste rondes** zie je minstens je laatste 4 winsten (rondes zonder winst achter elkaar staan als één regel) en een knop naar al je rondes (de laatste 100 worden bewaard).
  Op brede schermen staat rechts het saldo over de volle breedte, daaronder deze spin en gewonnen; in de bonus deze spin naast de spins die nog over zijn, en daaronder de bonuswinst. Dan de inzet met − en + ernaast en alle inzetten van €10 t/m €50K in één raster. High rollers zien onderaan een knop High roller die de inzetten €100K t/m €500K toont (en terug). Daaronder de snelheid 1×/2×/3×, bonus kopen en Draaien.
  **Betalen met** kies je in de casinobalk: **Automatisch** (standaard: eerst je zwarte geld, is dat op dan je witte), **Alleen wit** of
  **Alleen zwart**. De balk laat altijd zien waarmee je speelt ("Eerst €3.000 zwart, dan wit") en staat op de telefoon bovenaan vast,
  samen met cashback claimen, geluk en de verdenking. Wit (legaal, te verantwoorden) laat de verdenking niet oplopen; met zwart wordt
  wat je wint wit, maar de verdenking loopt op: per ronde (inzet/limiet van je rang ×35 + 0,04) × spel (slots 1,4, roulette 1, kaarten 0,85,
  dubbel of niks 0,8, Mines en Hoogvlieger 0,55) × lidmaatschap (gewoon 1, VIP 0,65, High roller 0,35) × de **ogen** van de
  beveiliging (dicht 0,25, open 1, rood op jouw tafel 2; per 40 seconden wisselend). Zakt 4%/min in het casino, 8%/min als je weg
  bent. Op 100%: **verbannen** (30 / 20 / 10 minuten), het casino wordt rood; daarna staat de verdenking weer op 0%.
  **Teller in de bonus**: extra spins (2+ kluizen) komen pas bij de teller als de spin helemaal is uitgetumbeld (eerst
  "+2 spins", dan bijv. 3 / 14); vooraf verraadt de teller niets. Op de telefoon staan de free spins rechts in het saldovak en
  staat het saldovak (ook bij gewone spins, dan met je inzet rechts) direct onder het bord, de knoppen daaronder, met "Bonus: X× inzet" tot nu toe (Visdief net zo, ook op de computer).
  **Geschiedenis**: de laatste 40 rondes (inzet, betaald, terug, ×) worden bij je account bewaard; knop met het klokje bovenin.
  **Narekenen**: `verify.js`-controle (clusters, lopers, baren, vakjes, tumbles, totalen, afronding) gaf 0 afwijkingen op 900 rondes.
  Het bord is net zo hoog dat het met de knoppen ernaast zonder scrollen op een laptopscherm past.
  Spatiebalk = draaien. **Seed**: elke spin komt uit jouw seed + spinnummer. Doorgerekend (`sim12.js`, 1,8 mln. spins per
  lidmaatschap plus ruim 100.000 bonussen, `bsplit.js` voor gekochte bonussen): gewoon bonus ±1 op 195 (superbonus ±1 op
  21.000), RTP ±92%; VIP ±1 op 175, RTP ±95%; High roller ±1 op 145, RTP ±96%. Bonus kopen ±95% / 95,5% / 96,5%.
  **Uitbetalingstabel** (5 op een cluster, bij €10 inzet als VIP): speelkaart €2, sigaar €4, munt €6, dobbelsteen €7, fiche €8,
  horloge €12, ring €20, diamant €27, goudstaaf €80; grotere clusters schalen mee (goudstaaf 20+ ±€5.200). Basisspel 143% van
  de tabel (VIP ×0,99, High roller ×0,89), de bonus 77,5%. Sinds de hogere uitbetalingen valt de loper in het basisspel iets
  minder vaak (17,55 in plaats van 22) en is de goudstaaf iets zeldzamer, zodat de RTP gelijk bleef.
- **Lopende bonus blijft bewaard**: een slotronde wordt bij de start meteen verrekend en opgeslagen (met de seed). Ververs je
  midden in een bonus van een slot, of open je het spel op een ander apparaat, dan zie je "Je bonus loopt nog":
  hij speelt verder vanaf de free spin waar je was (zonder dubbel uitbetalen). **Overslaan of doorspoelen kan niet**: ook de
  draaiknop en de spatiebalk spelen eerst de lopende bonus verder. Klik je tijdens een bonus weg (ander spel, andere pagina,
  telefoon op slot of andere app), dan **pauzeert** hij ("Gepauzeerd", met "Bonus verder afspelen") in alle drie de slots;
  vroeger speelde Visdief en Suikerbaron dan in een tel uit en bleef er een oud bord met nieuwe winlijnen staan. Wordt het spel
  ergens anders geopend terwijl een bonus loopt, dan speelt die eerst rustig uit en komt de melding pas daarna.
- **Bonussen aan tafel nagerekend**: de handbeoordeling van Hold'em (alle 2.598.960 handen van 5 kaarten), de 6-Card Bonus
  en Three Card Poker (alle 22.100 handen) komen precies overeen met de bekende aantallen, en een paar azen, een straat in
  Pair Plus en drie gelijke in de 6-Card Bonus worden echt uitbetaald. De **AA Bonus** telt je beste hand uit je 2 kaarten + alle 5 tafelkaarten (flop, turn en
  river), vanaf drie gelijke: royal 200, straight flush 60, carré 40, full house 8, flush 6, straat 4, drie gelijke 2 (: 1).
  Eerder telde alleen de flop (zoals in het echte Casino Hold'em) met een hogere tabel; met 7 kaarten valt er veel vaker iets
  (±15% van de rondes), vandaar de lagere tabel. Pair Plus telt alleen je eigen 3 kaarten (er liggen geen tafelkaarten), de
  6-Card Bonus jouw 3 + die van de dealer. Op het bonnetje staat waarom er niets viel. AA Bonus RTP ±91%.
- **Roulette** (Europees, één nul, 2,7% huisvoordeel): groot wiel met rollende bal bovenaan, echte inzettafel eronder.
  Nummer, split, rij, hoek, zes, drie met nul, eerste vier, kolom, dozijn en de kansen, plus groepen op het wiel
  (Buren van nul, Overkant, Weesjes, Nulspel). Ongedaan maken, fiches weghalen (ook met rechtsklik), alles wissen,
  verdubbelen en herhalen; een fiche zetten werkt alleen dat vak bij (de pagina ververst niet). Op de telefoon staat de tafel rechtop.
  Maximum per vak: €50.000; vanaf Soldaat €75.000 op getallen en €100.000 op de rest, vanaf Onderbaas €150.000 en €200.000.
  De bon met de uitbetaling staat links naast het wiel. Code: `public/js/pages/roulette.js`.
- **Lidmaatschap: VIP en High roller.** De beheerder geeft het (Beheer → speler → Lidmaatschap); zonder keuze telt de oude
  code `vip` nog als VIP. Tag bij je naam (High roller paars) en in de ranglijst.
  | | VIP | High roller |
  |---|---|---|
  | Slaagkans misdaden (na alle bonussen, max 95%) | ×1,15 | ×1,40 |
  | Buit | +10% | +25% |
  | Wachttijden (klussen, auto's, training, ontspanning, rusten, dokter, familieklus, huurmoord) | 75% | 55% |
  | Groen gat bij vluchten en kans om te ontsnappen | ×1,15 | ×1,40 |
  | Straatcredit | +15% | +40% |
  | Bank: rente / kosten beleggen / depositoplekken | +15% / −15% / +1 | +40% / −40% / +2 |
  | Casino-cashback (Kluiskraker, Visdief, Suikerbaron, Mines, Hoogvlieger 0,5%, roulette 1%, poker 0,75%, blackjack 0,25%) | ×1 | ×1,5 |
  | Huurmoorden: rustiger vizier / meer tijd | −7,5% / +15% | −20% / +40% |
  | Hoge inzetten in de slots | – | ja (ook met code `trainwreck`) |
  Casino, doorgerekend (gewoon / VIP / High roller): Kluiskraker (10×10, max 5.000×) bonus 1 op 400 / 350 / 300, RTP 92,5% / 94% / 95,5%, bonus kopen
  ±93% / 94,5% / 96%; Visdief bonus 1 op 200 / 172 / 143, RTP 91,5% / 94% / 96,5%, kopen ±97%; Suikerbaron (6×5, max 5.000×) bonus
  1 op 330 / 300 / 250, RTP 94,9% / 95,7% / 96,2%, kopen ±95% / 96% / 97%; Hoogvlieger landt 23% / 24% / 25%,
  RTP 88% / 91,5% / 96%. Alles blijft onder 100%, ook met cashback.
- **Huurmoorden** (`hits.js`): de drie niveaus (Straat, Professioneel, Elite) staan als banners met de doelwitten in het vizier; tik op een niveau voor de contracten. 9 contracten in drie niveaus (Straat, Professioneel vanaf Capo, Elite vanaf Onderbaas) en een
  reputatie in 6 niveaus (+3% beloning per niveau). Per contract kies je de methode: **mes** (sluipen, stilstaan als hij omkijkt,
  toeslaan op een timingring), **pistool**, **geweer** (vizier met wind) of een **ongeluk** (vanaf Capo, een slingerende lading
  van een kraan). Een methode die de klant wil geeft +20%. Daarna kun je **gezocht** worden: 12, 25 of 45 minuten, ondergedoken
  drie keer zo snel voorbij, meer kans op controles, en vanaf niveau 2 soms een premiejager (snel trekken). Onopvallende
  kleding maakt gezocht worden minder waarschijnlijk. Oorspronkelijk: 6 contracten (moeilijkheid 1–6, Huurmoordenaar
  tot Peetvader). Je richt door een vizier dat meebeweegt met je adem: muis (telefoon: slepen), spatie/Adem ingedrukt = rustig
  vizier, klik/Vuur = schieten. Hoofd = perfect (+25% geld, cred ×1,5), romp = gelukt. Mis = doelwit rent weg; laatste kogel mis
  of een omstander geraakt = arrestatie (met vluchtspel). Rustiger vizier door training Schieten, beter wapen, lidmaatschap en
  Het Schaduwcontract. Verversen tijdens een contract telt als mislukt. Code: `public/js/pages/hits.js`.
- **Familiegesprek**: aansluiten gaat via een gesprek van 3 vragen over de familie (eigen voordeel, grote klus, rang, cred,
  omschrijving, buitbonus), alles staat op de familiekaart. Training **Charisma** helpt: elke 15 levels een hint (er valt een fout
  antwoord weg) en vanaf level 25 mag je één keer fout zitten. Afgewezen = 15 minuten wachten (VIP/High roller korter).
- **Tags**: echte spelers krijgen in de ranglijst en de zijbalk een groene tag "Speler", plus VIP of High roller.
- **Kluiskraker op brede schermen**: rechts alles om te spelen (saldo, inzet per groep, een opvallende kaart "Bonus kopen" en
  onderaan DRAAIEN), links info (deze sessie, laatste rondes, spelregels, seed). Het bord draait als een rol: de oude symbolen
  schuiven kolom voor kolom naar beneden uit beeld, precies gelijk met de nieuwe die vallen en met een kleine bounce vast landen.
- **Vaste hand (huurmoorden)**: als beginner trillen je handen (een snelle bibber bovenop het zwiepen van het vizier; adem
  inhouden helpt maar een beetje). Vijf niveaus van Bibberend tot IJskoud, opgebouwd uit training Schieten (45%), geslaagde
  contracten (35%) en rang (20%).
- **Ervaring (auto's)**: Groentje tot Meesterdief, uit het aantal gestolen auto's en je rang. Als groentje heb je minder tijd per
  pijl (tot −22%) en meer kans (tot 28%) dat een voorbijganger je ziet: dan verlies je tijd, en mislukt het, dan belde hij 112
  maar ben je op tijd weg (geen politie). Ook niet elk alarm trekt meteen politie aan (kans op wegkomen kleiner bij duurdere auto's).
- **Vakmanschap (misdaden)**: elke geslaagde klus telt mee voor die klus: 10× Brons, 30× Zilver, 75× Goud, 150× Meester.
  Per niveau +2% kans en +5% buit op die klus (Meester: +8% en +20%). Te zien als ruitjes en een voortgangsbalk op elke klus.
- **Carjacken** (`public/js/pages/carjack.js`, vanaf Boef, met een wapen): tweede manier om aan een auto te komen. Geen zoektocht;
  er stopt een auto voor rood (tot en met zeldzaamheid 4) en je drukt drie keer op het juiste moment (portier, bestuurder eruit, gas
  erop). Het groene stuk is groter met ervaring, Conditie, Rijvaardigheid en een zwaarder wapen. De auto is "heet" (15% minder waard,
  meer hitte). Mislukt: hij rijdt weg, de bestuurder vecht terug (gezondheid) of er staat politie om de hoek. 12 energie, 4 min wachten.
- **Bestellingen van de heler**: elke speldag 3 gevraagde modellen; lever er een uit je garage af voor ×1,4 tot ×1,9 de waarde
  en wat straatcredit. Het dashboard meldt het als je een gevraagde auto hebt.
- **Opslaan**: elke browser heeft een vaste apparaat-id. Kwam de serveropslag van dit apparaat en is de browseropslag nieuwer
  (app gesloten terwijl de laatste opslag onderweg was), dan wint de browser. Opslaan gaat één tegelijk; de server negeert een
  oudere stand van hetzelfde apparaat die later binnenkomt. Bij verbergen/sluiten (ook `freeze`) wordt meteen opgeslagen.
- **Wraak en bendegevecht** (`public/js/pages/feud.js`): na een huurmoord (18–48%), een ontsnapt doelwit (30%) of een gemiste
  laatste kogel (45%, in plaats van politie) komen de mensen van het doelwit je zoeken. Je hebt 30 minuten. Meevechten vraagt
  gezondheid (52–87%, naar moeilijkheid) en 15 energie; 3 rondes, 2 winnen, met je familie aan je zijde. Winnen = geld, cred, XP
  en eer; verliezen = gezondheid en wat geld. Zit je in een familie en kom je niet (weigeren of tijd verlopen), dan word je eruit
  gezet en ben je er 30 speldagen verbannen (1 speldag = 4 uur, dus 5 echte dagen). Zonder familie vinden ze je toch
  (−20% gezondheid en wat geld). Zat je vast, dan wordt het zonder jou geregeld.
- **Zware families**: Het Schaduwcontract (Huurmoordenaar, 1.400 cred, 3 huurmoorden), De Nachtwacht (Capo, 2.000, 8),
  De Ronde Tafel (Consigliere, 3.000, 15) en De Erven Morano (Peetvader, 4.500, 25), elk met een eigen voordeel en een grote klus.

- **Mines**: 5×5 vakjes, kies 1 tot 24 bommen of een stand (Makkelijk 3, Normaal 5, Moeilijk 10, Expert 15, Extreem 20,
  Gekkenhuis 24: eerste vakje al 24,5×). Elk veilig vakje verhoogt de multiplier (98% van de echte kans, RTP 98%, max 10.000×). Cash out wanneer je wilt; de bommen
  liggen vast zodra je start en het spel blijft staan als je ververst. Code: `public/js/pages/mines.js`.
- **Visdief** (5 rollen × 4, 20 lijnen): 3 boeien = 10 free spins, elke extra boei +2 (4 = 12), een volle rij van 5 = 15; per rol
  kan er één boei vallen. **Bonus kopen** (66×, met de schakelaar): altijd 3 boeien, op de andere rollen kan er vanzelf nog een vallen.
  Breed bord (rollen breder dan hoog, houten kade, water in de rollen) met saldo, deze spin, laatste winst en de bediening
  eronder, even breed als het bord. Doorgerekend (`visim2.js`, 3 mln. spins per lidmaatschap, `vbuy2.js`): gewoon bonus ±1 op 200,
  RTP ±91,5%; VIP ±1 op 172, RTP ±94%; High roller ±1 op 143, RTP ±96,5%; bonus kopen ±97%.
- **Suikerbaron** (heette eerst Zoete Buit; `/casino/zoete-buit` stuurt door; 6 × 5 snoep, uitbetaling overal; motor `public/js/zoet.js`, tekeningen `zoet-art.js`, scherm
  `pages/zoetebuit.js`, stijl `css/zoet.css`): 8 of meer van hetzelfde snoepje waar dan ook betaalt (8–9, 10–11, 12–14, 15+),
  winnende snoepjes knallen weg en er vallen nieuwe in (tumbles) zolang er winst valt. Negen snoepjes van drop (±0,45× bij 8)
  tot snoeppot (±14,4× bij 8, ±216× bij 15+). **4 lolly's** (geteld na het tumbelen) = 10 free spins en de lolly's betalen zelf
  3× / 5× / 100× (4 / 5 / 6+). In de bonus vallen **kauwgomballen** met ×2 tot ×1.000; valt er winst in een spin, dan worden
  alle ballen opgeteld en keer de winst van die spin gedaan. 3 lolly's in de bonus = 5 extra spins. Bonus kopen 100×, max win
  5.000× je inzet. Doorgerekend met een simulatie in Node per lidmaatschap (basisspel en bonus apart): gewoon RTP ±94,9%, bonus
  ±1 op 330; VIP ±95,7%, ±1 op 300; High roller ±96,2%, ±1 op 250; bonus kopen ±95% / 96% / 97%. Een bonus geeft gemiddeld ±94×
  (mediaan 65×); 5.000× zit er ±1 op 10.000–16.000 gekochte bonussen in. Eigen naam en tekeningen (geen kopie van een bestaand
  spel), allemaal in één stijl; logo met een hoge hoed. Eén doorlopend snoepthema rond het bord. Op de computer staat rechts alles om
  te spelen: saldo, een raster met alle inzetten (met bonus kopen aan zie je per inzet de prijs van de bonus en is grijs wat je niet
  kunt betalen, plus een knop naar de hoogste bonus die je wel kunt betalen), de draaiknop, snelheid en bonus kopen, sessie en seed.
  Lolly-spanning na 3 lolly's, confetti, snelheden en spatiebalk zoals bij de andere slots.
- **Casino op rang**: het casino gaat open vanaf Loopjongen (tafels, Mines, Hoogvlieger, Dubbel of niks), de slots pas vanaf
  Dief. Lager zie je een gesloten deur met hoeveel XP je nog nodig hebt; in de lobby staan de slots op slot. Een lopende bonus
  mag je altijd afmaken. **Te lang spelen valt op**: na een uur aan één stuk in het casino (20 minuten niets spelen = nieuwe
  sessie) loopt de verdenking op, met waarschuwingen op 60, 90 en 110 minuten; na twee uur ben je een speldag (4 uur) niet
  welkom. Een klus, missie of iets anders dat XP geeft zet de klok terug (`S.czT`, `czTimeSus`).
- **Rondleiding** (`js/tour.js`): nieuwe accounts krijgen een tour van 13 stappen over de echte schermen (menu, energie,
  wit/zwart geld, misdaden, verblijf, auto's, training, bezit, bank, casino, rang). Het onderdeel licht op, ernaast een kaartje;
  op de telefoon boven of onder in beeld, met een verwijzing naar Meer als het daar zit. Overslaan, Vorige/Volgende en de
  pijltjestoetsen. Terug te vinden op het dashboard (lagere rangen) en via "rondleiding" in het zoekmenu.
  De CSS-klassen van de tour beginnen met `tg-` (`.tr-card` is van de trainingskaarten; door die botsing stonden de
  trainingen even over elkaar heen).
- **Eigen geluid per slot** (`sfx.js`: `SFX.kk`, `SFX.vd`, `SFX.zb`, allemaal opgewekt met Web Audio): Kluiskraker metaal en munten,
  Visdief hout, water en een boeibel, Suikerbaron plopjes en glinsters. Bij het binnenkomen van de bonus (gewonnen of gekocht) een
  eigen deuntje met een korte animatie: Kluiskraker een kluisdeur (cijferslot, grendel, deur zwaait open naar het goud), Visdief een
  boei die in het water plonst (spetters en een golf), Suikerbaron een krullolly die het bord in draait met een regen van snoep.
  Op snelheid 3× is de intro korter. De titel van de bonus ("12 free spins", "Superbonus") staat in de intro zelf, in de stijl
  van het spel: goud uit de kluis, wit uit het water, roze tussen de snoepjes.
- **Indeling (computer)**: vanaf 1280px breed staat alles over jou in de rechterkolom: naam, status (vrij, gezocht, cel,
  ondergedoken), rang en level met XP-balk, wit geld, zwart geld en bank (drie aparte regels met eigen kleur en icoon), energie, gezondheid, hitte en familie, daaronder wat er klaarstaat,
  een snelle klus, het logboek en de top 5 (met jouw plek als je er niet in staat). Klik op energie, gezondheid of hitte voor
  een paneel met wat je er nu aan kunt doen (ontspannen, kliniek, omkopen, rusten, onderduiken). De nieuwsband is weg. Het menu
  links toont kleine standen (#plek op de ranglijst, auto's in de garage, cel- en wachttijd). In het casino is er geen
  rechterkolom maar een saldobalk bovenaan: saldo om mee te spelen (knippert groen of rood bij een verandering) met wit en zwart
  apart eronder, bank, lidmaatschap en cashback
  om te claimen. Smallere schermen en de telefoon houden de statusbalk bovenaan.
- **Outfit** (`public/js/pages/look.js`): **drie winkelstraten** als banners: Albert Cuypmarkt (lage klasse, Rookie tot Dief), Kalverstraat (midden, Boef tot Huurmoordenaar) en P.C. Hooftstraat (hoog, vanaf Capo), plus Dobbelstenen en Je kast. Iets boven je rang kopen mag met toeslag (+40% en +25% per rang die je mist). 25 nieuwe stukken (o.a. bucket hat, durag, panamahoed, designer zonnebril, diamanten grill, spijkerjack, voetbalshirt, linnen colbert, krokodillenleren jas, kasjmier overjas, limited sneakers, loafers met gesp, lakschoenen, Cubaanse ketting, platina kruis, iced-out hanger en horloge, presidentshorloge, skeleton-horloge, duimring, diamanten zegelring); de Borsalino zit nu op het voorhoofd met de rand achter het hoofd. kleding en sieraden op zes plekken (hoofd, kleding, schoenen, ketting, pols,
  ring), 55 stukken. Vaak zijn er stukken van dezelfde prijs met een ander voordeel, zodat je kiest wat voor figuur je wordt:
  onopvallend (minder hitte, meer kans), sportief (makkelijker vluchten, sneller energie), patser (meer buit en inkomen, maar
  meer hitte) of zakelijk (meer inkomen, lagere borg, XP). Drie of vijf stukken in dezelfde stijl geven een setbonus (Grijze
  muis, Atleet, Patser, Zakenman). Een etalagepop laat zien wat je draagt; met de muis over een stuk pas je het. Wat je koopt
  blijft in je kast, omkleden is gratis. De effecten lopen via `fitFx` in `state.js`; onopvallende kleding maakt ook gezocht
  worden minder waarschijnlijk (`wantMod`).
  **Geluksdobbelsteen** (zevende plek, Geluk): gebruik je hem, dan krijg je 10 minuten een percentage extra op je winst in
  Kluiskraker en Visdief, daarna 5 uur rust. Gebroken +4% (€2.500), hout +5% (€20.000, Loopjongen), been +8% (€150.000, Boef),
  zilver +11% (€750.000, Soldaat) en goud +18% (€5 mln., alleen High roller). Het extra geld wordt na de ronde apart getoond;
  roulette, blackjack, poker, mines, hoogvlieger en de munt houden de echte kansen. Gebruiken kan op Outfit en in de saldobalk
  van het casino.
- **Zwart geld en witwassen** (`public/js/pages/witwas.js`, kern in `state.js`): geld uit klussen, huurmoorden, auto's
  verkopen, de heler, de familie (missies, klussen, oorlog, afdracht) en bendegevechten is zwart (`S.zwart`, het deel van je
  contant geld dat zwart is). Gewoon uitgeven (wapens, kleding, training, ontspannen, inrichting) gaat eerst van zwart. De bank
  (storten, deposito's, beleggen), zaken kopen en verbouwen en verhuizen kan alleen met wit geld. Witwassen kan op drie
  manieren: **via je zaken** (een werkdag aan de kassa: druk op een zwarte bon vlak nadat een echte klant afrekent, niet als de
  inspecteur meekijkt; te opvallend = 30% in beslag en hitte; daarna gaat het geld door de boeken van die zaak). Een beter uitgebouwde zaak heeft meer klanten en minder bonnen nodig (12 tot 8).
  **Belasting per soort zaak**, zoals in Nederland (2026): btw 21% (wasserette, belwinkel, autogarage, shishalounge, club,
  autodealer, onderdelenhandel, hotel: logies is sinds 2026 21%), btw 9% (snackbar, kapper), kansspelbelasting 37,8% (speelhal) en
  vennootschapsbelasting 25,8% (haven en privéjets: internationaal vervoer is 0% btw). **Snelheid** hangt af van wat die zaak zelf
  omzet: per minuut gaat er omzet per speldag ÷ 240 × M doorheen (M per zaak in `WW_PROF`: wasserette 40, kapper 35, club 55,
  speelhal 70, haven 80, onderdelenhandel 90, jet 100, autodealer 120), plus 45 seconden voor de boekhouding. Per speldag kan er per
  zaak maximaal 3× zijn eigen inkomen door. Twee wasserettes op level 10 doen zo ±€4.200 per minuut en ±€75.000 per dag; een
  autodealer wast grote bedragen snel (één auto is meteen veel geld), de speelhal het snelst maar met 37,8% belasting. Per soort
  zaak loopt één ronde tegelijk. Het witwaspaneel heeft tabbladen (Je zaken, Ome Kees, Casino); bij je zaken een kaart per route
  (belasting, per minuut, wat er vandaag nog door kan, met de goedkoopste en snelste gemarkeerd) en een schuifbalk die
  belasting, wat er wit uitkomt en hoe lang het duurt direct laat zien. **Via Ome
  Kees**: tot €500.000 meteen, daarboven 10 minuten. Hij begint op 60%; je band met hem (elke keer vanaf €5.000 telt, vol na 60
  keer: tot −20%) en je rang (tot −15%) halen dat omlaag tot minimaal 25%, dus altijd iets duurder dan je eigen zaak. Maximum
  per speldag groeit met je rang. **Via het casino**: wat je met zwart geld wint is wit; de verdenking loopt dan op, op 100%
  word je verbannen. Bezit, bank, casinowinst,
  codes, rangbeloningen en werk in de bajes leveren wit geld op. Oude saves: al je contant geld telt als wit.
- **Profielen**: standaard privé. Op Profiel → Zichtbaarheid zet je het openbaar; dan zien anderen via de ranglijst je
  vermogen, familie, woning, outfit en prestaties. Bij een privé profiel zien ze alleen naam en rang. Beheerders zien elk
  profiel, en in het beheerdashboard staat per speler of zijn profiel openbaar is en wat hij deed (zijn logboek uit het spel).
  API: `GET /api/profile/:naam` en `POST /api/profile/privacy {public}`; kolom `users.public_profile`.
- **Live bijwerken**: Bezit, Wapens, Families, Profiel, Bank, Training, Huurmoorden en het dashboard verversen elke seconde als
  er iets verandert, zodat knoppen meteen kloppen. In de slots loopt het saldo ook live mee.
- **Hoogvlieger**: een propellervliegtuigje (met rookspoor) vliegt op eigen kracht over zee, zonder vaste baan. Overal in de lucht
  hangen willekeurig items (30% minder dan eerst). Hij stijgt op en glijdt daarna rustig omlaag; hij beweegt niet uit zichzelf op
  en neer. Alleen wat hij raakt verandert zijn koers: een plusje (+1 tot +10) geeft een flinke stuiter omhoog, ×2 tot ×5
  vermenigvuldigen en geven een kleine stuiter, een bom (÷2) ontploft en hij valt een stuk, waarna hij weer verder glijdt.
  Op zee liggen vliegdekschepen met water ertussen; blijft hij op het dek staan, dan win je inzet × multiplier (max 250×). De
  vlucht wordt bij het opstijgen in één keer doorgerekend en ligt dan vast; de **snelheid** (1×/2×/3×, ook tijdens de vlucht)
  verandert alleen hoe snel je hem ziet. Doorgerekend (avsim4.js, 3 × 250.000 vluchten per lidmaatschap): vlucht meestal 12 tot
  64 s (mediaan ±25 s), ±7 items raak; gewoon landt ±23%, RTP ±88%; VIP (dekken 5% langer) ±24%, RTP ±91,5%; High roller (10%
  langer) ±25%, RTP ±96%. Code: `public/js/pages/vlucht.js`.
- **Dubbel of niks**: een munt die echt in 3D wordt opgegooid, precies 50% kans (crypto-random), geen huisvoordeel.
  Win je, dan kies je: je pot pakken of nog een keer gooien voor het dubbele, tot 10 keer (×1024). De pot blijft bewaard bij verversen.
  Code: `public/js/pages/munt.js`.
- **Roulette op de telefoon**: wiel en uitslag naast elkaar, laatste worpen en de bon eronder, en een vaste balk onderin met je
  inzet en de draaiknop; na het draaien schuift de pagina terug naar het wiel. Op de computer blijft alles zoals het was.
- Kleur per sectie (Straat oranje, Geld groen, Macht paars, Overig blauw) en een zijbalk op brede schermen.

## Beheer (admin-dashboard)

Op **`/admin`** (link "Beheer" in het menu, alleen zichtbaar voor beheerders). Je logt in met je gewone account.
Beheerder word je door je gebruikersnaam in Railway bij de variabele **`ADMIN_USERS`** te zetten (meerdere met komma's,
bijvoorbeeld `jouwnaam,tweede`), of doordat een andere beheerder je rechten geeft in het dashboard.
Wat kan het: spelers zoeken en filteren (VIP, High roller, geblokkeerd, beheerders), sorteren (actief, rang, geld, nieuw);
per speler contant geld of spaarrekening bijschrijven, afschrijven of op een bedrag zetten (typ `250k`, `1,5m` of `2.000.000`);
rang en level zetten of XP erbij; lidmaatschap Gewoon / VIP / High roller; straatcredit; uit de cel, energie vol, hitte 0;
spel herladen, beheerder maken, blokkeren (met reden) en het account resetten (met bevestiging, optioneel codes vrijgeven).
Elke aanpassing staat in het logboek.
**Zelfverklarend**: een welkomstbalk bij het eerste bezoek, een **?**-knop met uitleg, een korte uitleg op elke kaart, klikbare
tegels bovenaan (online, verdacht, VIP, High roller, verbannen) en de hele spelerslijst met "Meer spelers laden".
**Verbannen**: de speler wordt uitgelogd en ziet bij openen of inloggen "Dit profiel is verbannen" met de knop
"Maak een nieuw profiel" (de voorpagina opent dan meteen het formulier voor een nieuw account).
**Mogelijk misbruik** (alleen voor beheerders): een oranje driehoek bij de speler in de lijst en een grote driehoek op zijn profiel.
Klik erop voor de details. Signalen: *Autoclicker* (gemeten in het spel: 80+ klikken in 10 seconden of 30 klikken met een
machinaal vast ritme), *Onverklaarde geldsprong* (vermogen stijgt in één opslag meer dan €75 mln. én 3× zo veel als het was, zonder dat casino, bedrijven of codes het verklaren),
*XP-sprong* (meer dan 8.000 XP in één opslag), *Energie boven het maximum*, *Klussen te snel* (30+ klussen in minder dan 20 s)
en *Oud apparaat blijft opslaan* (25 keer in 10 minuten). Beheerders kunnen ook zelf een signaal noteren. "Afgehandeld" sluit
de signalen (ze blijven zichtbaar als afgehandeld); "Verbannen" verbant meteen met de signalen als reden. Het spel van de speler stopt meteen met opslaan, toont "Je account is bijgewerkt"
en laadt de nieuwe stand; de speler ziet een melding met wat er is aangepast. Code: `admin.js` (server), `public/admin.html`,
`public/js/admin.js`.

## Railway instellen

De app-service **Gangster Spel** draait `node server.js` (staat in `railway.json`). Zet bij die service onder **Variables**:

| Variabele | Waarde |
|---|---|
| `MYSQL_URL` | `${{ MySQL.MYSQL_URL }}` (kies de MySQL-service via de referentie-knop) |
| `JWT_SECRET` | een lange willekeurige tekst, bijvoorbeeld 40+ tekens |
| `ADMIN_USERS` | gebruikersnaam (of namen met komma's) die beheerder is |

De tabellen `users` en `game_state` worden bij de eerste start automatisch aangemaakt.
Controleer de verbinding op `/api/health`: daar moet `"db": true` staan.

Een eigen domein koppel je bij de service onder **Settings → Networking → Custom Domain**.

## Lokaal draaien

```
npm install
MYSQL_URL=mysql://user:pass@localhost:3306/railway JWT_SECRET=iets node server.js
```

Zonder database start de site ook, maar dan werkt inloggen niet. Open je `public/game.html` direct als bestand, dan speel je offline met opslag in je browser.

## Structuur

```
server.js            Express: API (registreren, inloggen, opslaan, ranglijst), pagina's met merknaam/titels, robots, sitemap, 404
brand.json           merknaam, genre, tagline en adres (één plek om de naam te wijzigen)
db.js                MySQL-verbinding en tabellen
public/index.html    landingspagina
public/game.html     spel (controleert login, laadt voortgang uit de database)
public/css/          style.css (spel) en landing.css
public/js/landing.js inloggen/registreren, misdaadkaart en interactieve landing
public/js/update.js  nieuwe versie? (/api/version): scripts laden met ?v=<commit>, balk 'Nieuwe versie' en vanzelf verversen als het kan
public/js/slot.js    wiskunde van de Kluiskraker (pure functies)
public/js/flee.js    vluchtspel bij een mislukte klus
public/js/carchase.js wegrijden met de auto als je bij autodiefstal betrapt wordt
public/js/icons.js   symbolen van de Kluiskraker
public/js/*.js       spelmodules; public/js/pages/ bevat één bestand per tabblad
```

## API

| Methode | Pad | Wat |
|---|---|---|
| POST | `/api/register` | `{username, password}` → token |
| POST | `/api/login` | `{username, password}` → token |
| GET | `/api/me` | ingelogde gebruiker (header `Authorization: Bearer <token>`) |
| GET/POST | `/api/state` | voortgang laden / opslaan |
| GET | `/api/leaderboard` | top 25 spelers |
| POST | `/api/redeem` | `{code}` → eenmalig spelgeld per account |
| GET | `/api/profile/:naam` | profiel van een speler; privé geeft alleen naam en rang (behalve voor de speler zelf en beheerders) |
| POST | `/api/profile/privacy` | `{public: true/false}` → eigen profiel openbaar of privé |
| GET | `/api/health` | status van server en database |
| GET | `/api/admin/stats`, `/api/admin/players?q=&f=&sort=`, `/api/admin/player/:id`, `/api/admin/log` | beheer (alleen beheerders) |
| POST | `/api/admin/player/:id/action` | `{type: money/xp/cred/fix/tier/ban/admin/reset/kick, …}` |

## UX-update (november 2026)
- **Bedragen passend**: `fmtS` (data.js) geeft korte bedragen (€1,7 mln, €37,8 mld, €1,2 bln) en `fmtFit(n,max)` gebruikt het hele
  bedrag als het past, anders kort. `fitN(k)` rekent uit hoeveel tekens er op dit scherm passen. Gebruikt in de bovenbalk op de
  telefoon, de casinobalk en het menublad; het volledige bedrag staat in de tooltip en op bank, dashboard, profiel en de rechterkolom.
  Lange namen worden niet afgekapt: de letter krimpt mee (`nameFs`). Geld staat op de telefoon altijd op een eigen rij (`.tb-br`).
  Gecontroleerd met een scanner op afgekapte of met … ingekorte bedragen en namen (360, 390, 768, 1440 px, 37,8 miljard, naam van 20 tekens).
- **Tekst past altijd in zijn vak** (ui.js, `fitText`): elementen met `data-fit="<min px>"` en de selectors in `FIT_AUTO` (bedragen,
  namen, korte labels die vroeger met … werden ingekort) krijgen een kleinere letter als de tekst breder is dan het vak; past het ook op
  de kleinste letter niet, dan loopt de tekst door op een tweede regel. Draait na elke `render()`, `setHTML`, de deelverversingen van
  Kluiskraker/Visdief, bij het openen van het menublad en voor losse vensters (MutationObserver op body). Gebruikt `!important`
  in de inline stijl, zodat ook vaste maten in de css meegeven. Grids met één kolom zijn `minmax(0,1fr)` en `auto-fill`-grids
  `minmax(min(Npx,100%),1fr)`, zodat een lang woord nooit de hele pagina breder maakt dan het scherm.
  Gecontroleerd met de echte lettertypes op alle pagina's, tabbladen, de 9 casinospellen, het menublad, details en oefenvensters,
  op 320, 360, 375, 390, 430, 768, 1024 en 1440 px, met de langste rangnamen (Huurmoordenaar, Straatschoffie, Consigliere).
- **Casino**: klein onderaan elk casinoscherm "18+ · spel met virtueel spelgeld; geen echt geld inzetten, winnen of uitbetalen" (`casNote`).
- **Bedrijven**: inkomen heet overal "per speldag" (4 echte uren).
- **Beginnersdossier** op het dashboard (dashboard.js, `gidsHtml`): vijf stappen (eerste klus met een aanrader op laag risico, geld
  of XP; energie; eerste training; wit en zwart geld; volgende rang), op basis van de echte accountstatus, zonder beloningen.
  Alleen voor de eerste rangen; verbergen kan, terughalen met de knop onderaan het dashboard (`S.guide`).

## Grote update: navigatie, woningen, auto's, kleding (november 2026)

Backup van de stand ervoor: branch `backup/2026-11-01-voor-grote-update` (terugzetten = die branch naar `main`).

- **Navigatie** (`ui.js` `navMe`, `NAV_GROUPS`): bovenaan een eigen blok **Jij** met een groot dashboardvak (rang, level,
  XP-balk) en Ranglijst + Profiel ernaast. Daaronder Straat, Geld, Macht en Overig met grotere koppen in hun kleur; de sectie
  waar je bent licht op met "hier".
- **Dashboard** (`dashboard.js`): de rechterbalk verdwijnt op het dashboard (`body.no-rail`) en alles staat erin: naam en status,
  rang met XP-balk en levelstappen, **Volgende rang** (wat die opent: klussen, woningen, trainingen, spullen, casino, huurmoorden,
  rangbeloning; `rankUnlocks`) en de twee rangen daarna, vermogen met wit/zwart/bank, energie/gezondheid/hitte/familie met
  knoppen, buffs, klaar voor je, top 5, aanbevolen klussen, jouw cijfers en het logboek. Op andere pagina's is de balk er weer.
- **Huizenmarkt** (`data.js` `HOUSES`, `pages/woningen.js`, `verblijf.js`): 12 woningen (2 per soort, Landgoed in Het Gooi
  vanaf Peetvader). Prijzen €6.500 tot €3,9 mln (penthouses €850.000 tot €1,8 mln). **Kopen**: blijft van jou, ook als je
  verhuist, en stijgt per speldag in waarde (kraakpand ±0,12%, villa ±0,8%), tot een maximum (kraakpand +12%, landgoed +55%).
  Verkopen bij **Bezit → Woningen** (−5% makelaar, geld naar de bank). Bestaande woningen tellen tegen de oude prijs.
  **Huren**: €70 tot €13.000 per speldag (penthouse €4.500–€7.000). Eerste speldag bij het huren, daarna elke 4 uur automatisch
  van de bank en anders van je wit geld (`rentTick`, met een teller per speldag: offline wordt het ingehaald, niets dubbel).
  Lukt het niet: **achterstand** met zichtbare termijn; na 7 speldagen (28 uur) **uitzetting** naar je beste eigen woning of
  onder de brug, spullen die niet passen naar de opslag. De schuld blijft staan en wordt verrekend zodra er geld is; tot dan
  kun je niets huren. Verhuizen naar een andere woning beëindigt de huur. Woningwaarde telt mee in je vermogen (ook op de server).
- **Auto's** (`data.js` `CARS`): waardes per zeldzaamheid omhoog (gewoon ×1,25 tot legendarisch ×3,4, mythisch ×4) en 6
  exclusieve auto's (918 Spyder, P1, Spectre, LaFerrari, Huayra, AMG One). Iets meer kans op zeldzame vondsten (`FIND_TIER`).
- **De heler** (`autos.js` `HELER_LV`): 5 niveaus op basis van geleverde auto's (Kennis, Vaste klant 5, Partner 15, Rechterhand
  35, Compagnon 70): meer bestellingen, hogere bedragen, deels wit geld, een dagelijkse spoedorder ×3 en als Compagnon neemt hij
  elke auto aan voor ×1,1. Elke speldag een nieuwe lijst met een lopende afteller.
- **Bank**: beleggen en deposito's alleen van de spaarrekening; alle uitbetalingen gaan naar de rekening.
- **Kleding** (`look.js`): 23 nieuwe stukken (108 in totaal) en 2 nieuwe sets: **Tactisch** (kans, ontsnappen, vluchten) en
  **Nachtvlinder** (kortere wachttijd, XP). Paren met dezelfde prijs en een ander voordeel. Nieuwe stukken worden getekend met
  een vaste vorm per soort en eigen kleuren (`look` in `OUTFITS`). **Kledingkast** (`fitWardrobe`): personage in het midden met de
  zes plekken eromheen, per plek je eigen stukken, setbanner (`fitSetHud`) en per stuk wat er verandert als je het aantrekt
  (`fitDiff`, inclusief setbonussen). In de winkels: kop met de straat, filter Alles/Te koop/In bezit en een knop naar je kast.
- **Ontspannen** is een eigen pagina (`#relax`) naast Training; `#ontspannen` en `#trainen` blijven werken.
- **Rondleiding**: stappen voor het dashboardblok, de huizenmarkt, Trainen en Ontspannen apart (15 stappen).
- **Families**: banner per familie met of je erbij kunt, stappenplan, filter (Alle/Kan je bij/Nog niet) en snelle knoppen
  naar missies, grote klus, de stad en andere families.
- **Politiebureau**: nieuwe isometrische tekening (drie verdiepingen, POLITIE-band, ingang met blauwe lamp, mast met zwaailicht,
  helikopterplatform, vleugel met garage, vlag, lantaarns en een politieauto); "Sleep om te draaien" is weg.
- **Ranglijst**: jouw plek met afstand tot de volgende en voorsprong op de plek erachter; vermogen telt woningen mee.
