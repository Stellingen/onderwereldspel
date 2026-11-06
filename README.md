# Onderwereld

Een maffia-klikspel in de browser met accounts. Begin als Rookie en werk je op tot Peetvader.

- **Website** (`/`, `public/js/landing.js`): elk onderwerp heeft een eigen pagina en adres (History API; de server geeft
  bekende paden `index.html` met de juiste titel, onbekende paden een 404 met dezelfde pagina "Doodlopende steeg"): `/misdaden` (alle 72 klussen in een kans-tegen-buit grafiek, filter per rang en sorteren),
  `/casino` en `/casino/<spel>` (elk spel een eigen illustratie, regels en uitbetalingen; de tabellen van Kluiskraker, Visdief en Suikerbaron
  komen live uit `slot.js`, `vis.js` en `zoet.js`; oefendemo's van Mines, roulette en de munt), `/families` en `/families/<id>` (verhaal uit
  `lore.js`, plek in de voedselketen, de machtsverhoudingen van nu uit `famwar.js`, doorgroeien tot Onderbaas en Baas), `/rangen`
  en `/training`. De voorpagina staat hieronder beschreven (ronde 2). Inloggen en account aanmaken werken met `?login=1`, `?register=1` en `/start`.
  Onderaan de voorpagina staan **veelgestelde vragen** (`#faq`, uitklapbaar). In de footer: 16+, casino in het spel 18+,
  alleen virtueel spelgeld, niets te winnen of uit te betalen.
- **Voorpagina (ronde 2, `/` en `/start`)**: de server maakt de HTML (`public/js/lp-views.js`, pure functies in dezelfde
  `vm` als `data.js`, `covers.js` en `jb-core.js`) en zet hem in `<main id="app" data-ssr="/">`, met een echte H1. Alles is
  leesbaar zonder JS en zonder scroll-animatie. Opbouw: hero met de klim (inline SVG: Berlagebrug → 20 rangstreepjes →
  villa, iso-woningen uit `vhScene` als kaartjes; eenmalige intro als de klim in beeld komt, ambient als losse HTML-lagen met
  pauzeknop, `.calm` bij saveData), cijferbalk, "Zo werkt het", vijf minigames (4 clips uit de echte spelcode + de gang van
  Ontsnappen live met `jb-core.js`; er speelt er één tegelijk, laden vlak voor ze in beeld komen, niet bij reduced motion of
  saveData), loopbaan (3 haltes + rail van 20 rangen als slider), Imperium (families + bezit), een smalle casinostrook (18+,
  alleen spelgeld), "Wat je wel en niet krijgt" + FAQ, slot-CTA, sticky knop op de telefoon. Alle getallen komen uit de code
  (`LPV.facts`); constanten die eerst los in spelbestanden stonden, staan nu in `GAME_CONST` (`data.js`).
  Gedrag: `public/js/lp-home.js` (±7 KB gz; `landing.js`, `data.js` en `covers.js` laden niet op `/`). Stijl: `public/css/lp.css`.
  Fonts self-hosted in `public/fonts/` (5 woff2 uit `@fontsource`, fallback met `size-adjust`); Google Fonts is weg uit `index.html`.
  **Registreren/inloggen**: `public/js/lp-auth.js` + `public/css/lp-auth.css`, een `<dialog>` die pas bij de eerste klik wordt
  geladen (ook op de subpagina's). Registreren = naam + wachtwoord + verplicht vinkje "Ik ben 16 jaar of ouder."; de server
  eist `age16:true` (anders 400) en bewaart `users.age16_at`. `/start` opent het venster meteen (noindex, canonical `/`);
  `/game` zonder token → `/start`, met verlopen token → `/?login=1&verlopen=1`.
  **Beelden en clips** (uitvoer staat in de repo): `node scripts/lp-build.js <poort> <tokenbestand> [--og]` tekent woningen,
  casinocovers, auto's (zonder merk), etalagepoppen en een zaak uit de spelcode naar `public/img/lp/` en maakt `public/og.jpg`;
  `node scripts/lp-rec.js <poort> <tokenbestand>` speelt de minigames met een bot en codeert 6 s-clips (AV1 + H.264, ≤ 200 KB,
  poster ≤ 10 KB) naar `public/media/lp/`; de gekozen takes staan in `scripts/lp-rec/takes/`. Alleen lokaal, nooit tegen live.
  `npm run lp:facts` schrijft `public/lp/facts.json` (outfits, winkelstraten, `GAME_CONST`); `npm run lp:check` faalt als dat
  of een getal op de voorpagina niet meer klopt met de code. **Server**: gzip via `compression`, bestanden met `?v=` krijgen
  `Cache-Control: immutable` (1 jaar), HTML `no-cache`, `/api` `no-store`.
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
- **72 misdaden** over 20 rangen (zes per rang), met energie (1 punt per 12 s, ook in het casino of de cel; uit de cel kom je met minstens +4% van je max per minuut, dus 5 minuten = +20%) zodat je niet alles kunt speedrunnen.
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
- **Vluchtspel "Rennen!"** (`flee.js`, opmaak in `css/rennen.css`, versie 2, november 2026): gaat een klus mis en kies je
  vluchten, dan ren je weg met de agent achter je aan (2,5D, camera achter je, 15 tot 24 seconden). Aanroep onveranderd:
  `fleeGame(level, opts)` geeft een Promise met true (ontkomen) of false (gepakt); `arrest()` en `escapeGame()` geven nu de
  opts van de arrestatie mee, `crimeFail` zet `opts.cat` (soort klus). Bij een autodiefstal blijft het de autoachtervolging
  (`carchase.js`); te voet is het altijd Rennen!.
  - **De plek past bij de klus** (`fleeCtx`): straatwerk = langs de gracht (grachtenpanden met trap-, klok- en halsgevels,
    bomen, fietsen, bruggen met lichtjes, de Westertoren in de verte), in een steeg of door de winkelstraat; inbraak = eerst
    door de gang, dan de steeg in; overvallen = tussen de schappen van de winkel door, dan de winkelstraat; oplichting en
    invloed = door het kantoor (glazen wanden, bureaus), dan langs de gracht; smokkel = over de kade tussen de containers
    (bij niveau 4-5 eerst door een loods); huurmoord = steeg of gracht; politiecontrole = winkelstraat of gracht. Zonder soort
    kiest het niveau (1 gracht, 2 winkelstraat, 3 gang → steeg, 4 kantoor → gracht, 5 kantoor met alarm → steeg). Hoe zwaarder
    het niveau, hoe langer het stuk binnen. Heb je vervoer van Motorhuis Snel, dan staat dat bij de uitgang klaar.
  - **Besturing**: ← → / A-D, vegen of links/rechts tikken = baan; ↑ / W / spatie, omhoog vegen of midden tikken = springen
    (springen kun je vlak voor de landing al indrukken); ↓ / S, omlaag vegen of de knop = bukken. Vier knoppen onder het beeld.
    Niets hoeft ingedrukt gehouden te worden.
  - **Wat je ziet**: de route bovenin (met de deur naar buiten en de eindsprint), linksonder **Agent: 8 m** (balk van rood
    naar groen, rood kader als hij binnen 3,5 m zit), rechtsonder **Adem** in % (oranje onder 35%: je hijgt, wolkjes en een
    rode gloed). Komt de agent dichterbij, dan zie je hem onderin achter je aan rennen (POLITIE op zijn rug) en wordt het
    zwaailicht feller. Meldingen: Gestruikeld!, Hij zet aan!, Hij zit vlak achter je!, Bukken!, Springen!, Eindsprint!,
    Naar buiten!. Steigers, rolluiken en slagbomen hebben een blauw "BUKKEN", hekken en linten een geel "SPRING".
  - **Vooraf** (6 s of tik/spatie/Enter): "Politie! Staan blijven!" en een kaart met wat meetelt: niveau, je levels
    Conditie, Uithouding, Ademhaling en Snelheid, je extra voorsprong (woning, familie, uitrusting, outfit, lidmaatschap) en
    een inschatting **Voor jou: te doen / pittig / zwaar / heel zwaar / bijna kansloos** (`fleeRate`, gekalibreerd op de
    bot: kans van een gemiddelde speler). Die inschatting staat ook in de arrestatiemelding ("Rennen is voor jou zwaar").
  - **Gepakt** als de agent je inhaalt (afstand 0) of als je struikelt terwijl hij binnen 2 m zit. Elke agent is net iets
    anders (±3% tempo), dus ook perfect spelen is nooit helemaal zeker. Ontkomen: vrij (+5 hitte, +1 cred). Gepakt: cel met
    20% extra straf. **Verversen tijdens het rennen = gepakt** (zoals voorheen: `S.pendingArrest.fleeing`, `resumePending`).
  - **Moeilijkheid** (`FL_LV` per niveau, `FL_K` formule-constanten, `fleeParams`):

    | Niveau | duur | tempo | tijd tussen rijen | voorsprong | agent t.o.v. jou | adem/s |
    |---|---|---|---|---|---|---|
    | 1 makkelijk | 16 s | 8,8 m/s | 1,10 → 0,78 s | 8 m | 98,5% | 2,6% |
    | 2 redelijk | 18 s | 9,4 | 1,00 → 0,70 | 10 m | 99% | 2,8% |
    | 3 lastig | 20 s | 10 | 0,93 → 0,63 | 12,5 m | 100% | 3,1% |
    | 4 moeilijk | 22 s | 10,6 | 0,88 → 0,58 | 13 m | 100,5% | 3,4% |
    | 5 bijna onmogelijk | 24 s | 11,2 | 0,83 → 0,54 | 13 m | 101% | 3,7% |

    Hogere niveaus: meer rijen met twee banen dicht, slalom, overstekers, bewakers die met je meeschuiven en 1-2 keer dat de
    agent aanzet (1,6 s 12% sneller). Struikelen: je zakt naar 25% tempo en komt met 1,7/s weer op snelheid (±4,4 m kwijt).
    Training (0-50; c, u, a, s = Conditie, Uithouding, Ademhaling, Snelheid gedeeld door 50):
    topsnelheid ×(1 + 0,006c + 0,004s) · adem gaat ×(1 − 0,5c) op · Uithouding: +2%·u adem per seconde terug en ×(1 + 0,15u)
    sneller overeind · Ademhaling: onder 35% adem zak je tot (95 + 3a)% tempo (in plaats van 95%) en struikelen kost 12%×(1 − 0,5a)
    adem · Snelheid: baan wisselen in 0,15 s×(1 − 0,3s). Extra's (som E van woning `furnFx('zone')`, familie `famPerk('flee')`,
    uitrusting `gearFx('flee')`, outfit `fitFx('flee')`): k = 1 − e^(−1,1E), voorsprong ×(1 + 0,35k), botsing ×(1 − 0,06k).
    Lidmaatschap (VIP 0,15, High roller 0,40 = t): voorsprong ×(1 + 0,4t), adem ×(1 + 0,5t) zuiniger. Op de trainingspagina
    staan de nieuwe effecten (Conditie: adem bij vluchten −1% per level, Snelheid: sneller van baan −0,6%, Ademhaling: adem
    kwijt bij struikelen −1%, Uithouding: sneller herstel +0,3%).
  - **Gemeten** (`node scripts/fleesim.js 600`, bot met reactie 0,3 s en 8% fout per rij = goed, 0,45 s en 12% = gemiddeld,
    0,6 s en 20% = slecht; fouten vaker bij rijen vlak na elkaar):

    | Niveau | nieuw, slecht | nieuw, gemiddeld | nieuw, goed | alles 25, gem. | alles 50, gem. | alles 50, goed | max + extra's + HR, goed |
    |---|---|---|---|---|---|---|---|
    | 1 | 67% | 90% | 94% | 95% | 96% | 99% | 100% |
    | 2 | 27% | 71% | 86% | 82% | 89% | 92% | 98% |
    | 3 | 6% | 36% | 70% | 59% | 70% | 86% | 97% |
    | 4 | 0% | 7% | 35% | 23% | 34% | 67% | 85% |
    | 5 | 0% | 2% | 11% | 5% | 11% | 43% | 66% |

    Ook in de browser gespeeld met dezelfde bot die echte toetsaanslagen stuurt (6 potjes per vakje, training 0 of alles 50):
    niveau 1: goed 6/6 en 6/6, slecht 3/6 en 5/6 · niveau 3: goed 5/6 en 5/6, slecht 0/6 en 0/6 · niveau 5: goed 0/6 en 4/6,
    slecht 0/6 en 0/6 (klopt binnen de ruis met de simulatie). Verder getest: de arrestatie (knop Vluchten → uitkomst, cel of vrij),
    verversen tijdens het rennen (= gepakt, +20%), oefenen per niveau via `practice.js` (account blijft gelijk) en tikken en
    vegen op een telefoon.
  - Test-hook: `document.querySelector('.rn-ov')._fl()` geeft `{C, P, X, go}` (C = de kern van `fleeCore`, los van het tekenen).
- **Misdaden** (`misdaden.js`; sinds november 2026 komt de kans uit het klus-spel en je professionaliteit, zie *Klus-spellen en professionaliteit*): klussen onder je rang gaan makkelijker: per rang erboven +1% extra kans, de hitte drukt minder op je kans en het plafond gaat van 95% naar 98% (er blijft altijd 2% risico). Lukt zo'n klus (2+ rangen eronder), dan stijgt je hitte 2 tot 3. elke klus heeft een eigen icoon en een balk met kans, opbrengst (plus XP en cred) en wat er
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
- **Bezit**: opent op **Mijn bezit**: je eigen zaken (een tegel per zaak met vestigingen, level en inkomen) en daaronder de knop **Koop meer zaken**. Die opent de winkel met tabbladen per categorie (met aantal en icoon): Winkels en diensten, Horeca en nachtleven, Auto's, Handel en transport en **Vastgoed** (Bovenwoningen, Winkelpanden, Bedrijfshallen, Vastgoedportefeuille: 20% meer huur, maar je kunt er niet door witwassen); met **Mijn bezit** ga je terug. Elke zaak is een banner met een eigen gevel (winkelpui, garage, toren, haven of hangar; verlichte ramen = je vestigingen), tik erop voor de vestigingen en upgrades. Hoe witwassen via een zaak werkt (belasting en snelheid per soort zaak) staat bij Zwart geld en witwassen. 47 soorten bedrijven (sinds november 2026, zie *Meer zaken*), van Wasserette (€5.000, €1.250 per speldag) tot Privéjet-charter (€4 mln., €392.250 per speldag), elk vanaf een
  bepaalde rang. Klik op een bedrijf voor de details: tot 10 vestigingen (VIP 12, High roller 15) per soort (elke volgende 25% duurder) en elke
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
  van het casino. **Grens** (`luckBonus` in `look.js`): geluk telt niet bij bonus kopen, en per keer gebruiken krijg je
  hoogstens de prijs van de dobbelsteen extra (gebroken €2.500 … goud €5 mln.); het paneel toont hoeveel er nog te halen is.
  Zonder die grens maakte +25% de slots tijdelijk winstgevend (±117%).
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

## Update 2: rangen, casinokaart, werk en dealen (november 2026)

Backup van de stand ervoor: branch `backup/2026-11-01-avond` (terugzetten = die branch naar `main`).

- **20 rangen** (`data.js` `RANKS`): 8 tussenrangen erbij (Sjacheraar, Inbreker, Ritselaar, Handhaver, Luitenant, Kapitein,
  Rechterhand, Schaduwbaas) en Peetvader vraagt nu 380.000 XP. `RK` zet een oude rangindex om naar de nieuwe, `rkPow(ri)` geeft
  de "sterkte" op de oude schaal voor formules (buit, kans, prijzen), zodat niets uit balans raakt. `rkRemap` schuift klussen,
  winkels, trainingen, woningen en outfits naar de nieuwe rangen; bij een gesplitste rang gaat de goedkoopste helft naar de
  tussenrang eronder. **Niemand zakt**: oude saves (`S.rankV` ≠ 2) krijgen hun XP omgerekend naar dezelfde rang op de nieuwe
  schaal (`rkMigXp`, ook voor NPC's); de server ziet die eenmalige sprong niet als valsspelen. Nieuwe rangcodes in `RANK_CODES`.
- **Huur ×2,5** (`HOUSES`): van €180 tot €32.500 per speldag.
- **Casinokaart** (`pages/caskaart.js`): 6 kaarten (Basis, Brons, Zilver, Goud, Platina, Zwart). Je kaart groeit door in te
  zetten, wit en zwart geld tellen allebei, apart per soort: slots, snel spel (Mines, Hoogvlieger, Dubbel of niks) en tafels.
  Brons vraagt 30k slots + 20k snel spel + 50k tafels (100k samen); elke volgende kaart ×5. De kaart bepaalt: max. inzet per soort
  (Basis €500 slots / €1.000 tafel; snel spel met Zwart €250k, VIP €500k, HR €1 mln), side bets, roulette per nummer (tot €150k; als HR €250k),
  speeltijd en pauze (Basis 30 min speeltijd en 15 min pauze, Zwart 4 uur en 5 min), cashback (Basis geen, Zwart ×1,25; VIP en HR krijgen hun eigen cashback erbovenop; altijd
  onder het huisvoordeel) en hoeveel aandacht zwart geld trekt (`eye`). Verdenking hangt af van het bedrag ten opzichte van de
  limiet van je kaart; gepakt worden kan een waarschuwing, ban of aangifte geven, en kost **40% van je voortgang**. VIP en High
  roller houden hun betere RTP en krijgen bovenop de kaart hogere limieten (`CC_T`). Rang telt in het casino niet mee.
  **Bestaande spelers** krijgen eenmalig de kaart die past bij wat ze al hadden ingezet (`ccBackfill`): geschat uit casinowinst
  en -verlies (winst telt hooguit even zwaar als verlies, zodat één jackpot het niet opblaast), verdeeld over de soorten in de
  verhouding die de kaart vraagt.
  In de lobby staat je kaart met voortgang per soort en wat de volgende kaart geeft; in de casinobalk loopt je speeltijd.
- **Menu**: nieuw kopje **Leven** (Verblijf, Training, Ontspannen). Macht: Families bovenaan, dan Wapens en Outfit.
- **Werk en dealen** (Straat, `pages/werk.js`): **Klusjes**: 10 gewone baantjes voor wit geld (energie, wachttijd, XP).
  **Dealen**: 6 niveaus in je netwerk, op reputatie en rang: loopjongen van Mo (verkopen voor een ander), eigen klantjes, vaste
  lijn, groothandel, direct bij de bron en drugsbaron. Elk niveau geeft korting bij inkoop, meer per verkoop, meer opslag en
  later dealers op straat (verkopen per speldag) en een eigen lab. Producten: vapes, wiet, hasj en miauw vanaf het begin,
  daarna xtc, speed, keta, coke en uiteindelijk per kilo. Risico per verkoop (pakkans) met hitte; gepakt = die partij en de helft
  van je voorraad kwijt. Alles per speldag afgerekend met een teller (`dlTick`).
- **Casino op de telefoon**: compacte saldobalk tijdens een spel (kaarttijd bij de bank), en bij Suikerbaron, Kluiskraker en
  Visdief staan inzet en **Draaien** vast onderin boven het menu; bij Blackjack, Three Card Poker en Texas Hold'em de fiches en
  knoppen. Zo zie je het hele bord en de knop tegelijk (getest op 440 × 956, iPhone 17 Pro Max, en 320 px).
- **Kluiskraker** kreeg een eigen kluisthema (staal met klinknagels, een kluisknop als logo die meedraait bij elke spin,
  kluisjes als vakken); **Visdief** een doorgetrokken haventhema (sterren, water met golven, touwrand).
- **Rangcodes** voor de nieuwe rangen (Sjacheraar, Inbreker, Ritselaar, Handhaver, Luitenant, Kapitein, Rechterhand, Schaduwbaas)
  werken nu ook op de server (`RANK_CODES` in server.js, XP volgt de 20 rangen).
- **Gelukspullen** (Outfit): brede banner met de dobbelsteen en de nieuwe **geldklem** (Koper +10%, Zilver +15%, Goud +20%,
  Platina +25%; beloningen: VIP-geldklem ×1,5 (€30 mln, VIP en HR) en Diamanten geldklem ×2 (€75 mln, alleen HR)): 2 uur meer inkomen van al je bedrijven (`klemPct` in `bizMult`). Dobbelsteen nu 15 min.
  Beide daarna een werkdag (8 uur) rust. "Geldklem klaar" staat in Klaar voor je.
- **Bezit → Woningen**: per woning een lijstje met gekocht voor, waarde nu (+/−) en wat je bij verkoop krijgt (winst/verlies).
- **Families**: als lid eerst je eigen familie (met knoppen voor verhaal, overstappen en verlaten), dan de missies en de grote klus,
  dan de stad en de bendeoorlog, en onderaan een duidelijk blok om over te stappen (wie laat je toe) of de familie te verlaten,
  met de andere families en een filter. Zonder familie staan de families vóór de stad.
- **Inzetlimieten per casinokaart** (`CC`, `CC_T`, `CC_CAP` in caskaart.js). Op de Zwarte kaart: slots €500.000 (VIP €750.000,
  High roller €1 mln); snel spel tot €250.000 (VIP €500.000, High roller €1 mln), kaartspellen tot €150.000 en roulette tot €250.000 per nummer (€500.000 buiten);
  side bets €50.000 (VIP €75.000, HR €100.000). VIP en HR halen de plafonds op een lagere kaart. **High roller-tafel** bij
  Blackjack, Three Card Poker en Texas Hold'em: alleen voor HR, hoofdinzet tot €500.000 (ook naar kaart). Nieuwe fiches van 25K en 100K.
- **Bonus loopt altijd uit**: een fout in het geluid (een toon buiten de toonladder bij 5+ winlijnen in Visdief) brak de hele bonus
  af. Alle geluiden zitten nu in een vangnet (`safe` in sfx.js) en elke free spin in Visdief, Kluiskraker en Suikerbaron heeft zijn
  eigen vangnet: gaat er iets mis in de animatie, dan speelt de bonus gewoon verder.
- **Bonusbanners per slot**: Visdief in water en met een reddingsboei (+10 spins bij een nieuwe ronde, "Ronde N binnen"),
  Kluiskraker in staal met de kluisknop (+N spins), met uitdijende kringen.
- **Roulette op één scherm** (computer, vanaf ±900 px inhoud): links het wiel, de uitslag en de laatste worpen met je sessie,
  rechts fiches, tafel en knoppen. Na de worp blijft je inzet op de tafel liggen: gewonnen vakken groen met wat ze terugbetalen,
  verloren fiches grijs, en een balk "Geland op 17 · Rood · +€X". Bij de volgende fiche is de tafel weer leeg.
- **Sessie per spel** (`casSesAdd`/`casSesHtml` in state.js) bij Blackjack, Three Card Poker, Texas Hold'em en Roulette: rondes,
  ingezet, terug, netto en je beste ronde, zolang je speelsessie in het casino loopt (de tijd van je casinokaart).
- **Dobbelstenen**: 4% / 8% / 12% / 15% / 25% op je slotwinst, 15 minuten, daarna 8 uur (2 speldagen) rust.

## Gouden Draak (nieuwe slot, november 2026)
`js/draak.js` (engine `DRAAK`, pure functies) en `js/pages/draak.js` (spel), `css/draak.css`. Thema: een draak boven een
restaurant op de Zeedijk, rood lakwerk en goud. 5 rollen × 3 rijen, 20 lijnen. Symbolen: gelukskoekje, eetstokjes, theepot,
jade, waaier, lantaarn, gelukskat, draak; drakenparel = wild (rol 2–4); gong = scatter (rol 1, 3, 5); gouden munt.
- **Free spins (3 gongs)**: 10 spins met de Reuzendraak: rol 2–4 zijn één groot symbool (telt als drie volle rollen). Gong op
  rol 1 + reuzengong + gong op rol 5 = 3 spins extra (±1 op 80 bonussen).
- **Muntenbonus (6+ munten)**: op het hele bord (5 × 3 = 15 vakjes), de munten blijven op hun plek, 3 spins; elke nieuwe munt
  plakt en zet je terug op 3. De lege vakjes rollen zichtbaar van boven naar beneden door munten en jackpots. Munten 1× tot 50× je inzet, of Mini 10×,
  Minor 25×, Major 100× (VIP 30% en High roller 60% vaker). Alle 15 vol = **Mega** = max win 5.000× (±1 op 1.700 bonussen).
- **Indeling**: links naast het bord een jackpotladder (Mega bovenaan en het breedst, dan Major, Minor, Mini; ook op telefoon
  als smalle kolom), rechts saldo, deze spin, winst, inzetblok (groot bedrag, −/+, alle bedragen, max
  win) en de knoppen. Nieuwe draak-tekening (kop, slangenlijf met schubben en rugvinnen, parel) in `covers.js` (`drHead`,
  `drBody`, `drPearl`), gebruikt voor het symbool, de lobby en de website.
- **Bonus kopen**: twee tegels in het paneel (Free spins: 3 gongs, Muntenbonus: 6 munten) met een koopknop die je twee keer
  klikt (bevestigen). Free spins 54×, munten 42× (voor iedereen dezelfde kansen).
- Doorgerekend (8 × 450.000 rondes per lidmaatschap): RTP ±92% (VIP ±93,5%, High roller ±95%); free spins ±1 op 240, munten
  ±1 op 260; kopen ±94% (free spins 54×, munten 42×). Jackpotmunten zijn zeldzamer (Mini 7, Minor 2, Major 0,3 op ±1.100
  muntgewicht) en de 50×-munt ook; een winst van 100× of meer valt ±1 op 2.500 spins (was 1 op 1.900). Telt als slot voor de casinokaart, cashback 0,5%, seeds, geluk, pauze
  bij wegklikken, "bonus loopt nog" na verversen. Ook op de website (`/casino/gouden-draak`, `covers.js`, `landing.js`).
- **Slots, knoppen** (`style.css`, generiek): het inzetblok (`.sl-bet`: kop "Inzet per spin" + "Alle bedragen", groot bedrag met
  −/+, onderregel met max win) staat nu ook in Visdief. Snelheid (`.spd`, icoon altijd zichtbaar) en Bonus kopen (`.kk-buyt`,
  schakelaar met AAN/UIT) staan naast elkaar op dezelfde hoogte (56 px, telefoon 44 px). Visdief heeft op brede schermen net
  als Kluiskraker en Suikerbaron het bord links en een paneel rechts.

## Energie tot 500 (november 2026)
Maximale energie (`EN_MAX` in `state.js`) = basis 100 + Conditie (+3 per level, 150 op 50) + woning (kraakpand 20 … villa 100)
+ inrichting (energiespullen verdubbeld, samen 98) + **rang** (nieuw, `rankEn`: +2 per rang, als Peetvader +3,5 per level
erbij, samen 52). Alles op max = **500** (was ±249), zodat je bovenin eerst flink wat klussen achter elkaar kunt doen. Opladen
blijft 1 per 12 s; rusten in je woning vult nog steeds helemaal. Het energievenster in de statusbalk laat zien waar je max
vandaan komt (`enParts`). De serverwaarschuwing gaat nu pas af boven 700 energie.

## Rondes vast, ervaring, ontsnappen, vastgoed (november 2026)
- **Casino: een ronde ligt vast zodra je klikt.** Roulette en Hoogvlieger: de uitslag staat bij het klikken vast en het saldo
  verbergt de winst tot de uitslag in beeld is; de sessieregel ("Deze sessie") telt de ronde nu ook pas bij de uitslag
  (`casinoRound(...,later)` zet hem in `S.casPend`, `casSesFlush` verwerkt hem; bij openen worden openstaande rondes verwerkt).
  Blackjack, Three Card Poker en Hold'em: na het delen is de inzet weg en ligt de hand vast; wie ververst, gaat verder waar hij
  was (`tbPersist` bij elke `save()`, `tbRestore` bij openen; een hand die halverwege het delen was, wordt afgedeeld).
- **Menu**: Jij, Leven (verblijf, training, ontspannen), Geld (bank, bezit, casino, witwassen), Straat, Macht, Overig onderaan.
- **Ervaring per soort misdaad** (`CR_CATS`/`CR_CAT`/`CRX_T` in `data.js`, `crxN`/`crxLv`/`crxBonus` in `state.js`): zes soorten
  (straatwerk, inbraak en kraken, overvallen, oplichting, smokkel en handel, witteboord en invloed). Elke klus telt mee (gelukt 1,
  mislukt een half; bestaande spelers krijgen hun vakmanschap als start). Level 0 = −12% kans, elk level +2,4%, level 10 = +12%;
  het plafond gaat per 2 levels 1% omhoog (tot 99%). Zakkenrollen: beginner 73%, level 5 85%, meester 97%. Zichtbaar als
  "Ervaring per soort" op Misdaden en in de kansopbouw van elke klus.
- **Ontsnappen** (`jbParams` in `jailbreak.js`): je rang telt mee. Een rookie zit in een politiecel (bij gewone kans "Te doen"),
  een peetvader in de zwaarst bewaakte vleugel ("Zwaar", met een lange straf "Bijna onmogelijk").
- **Zaken kopen**: een zaak waarvan je alle 10 vestigingen hebt, staat niet meer tussen de zaken die te koop zijn.
- **Vastgoedmarkt** (`woningen.js`, `bezit.js`): elke soort woning heeft een prijsindex die per speldag beweegt (vaste reeks voor
  iedereen vanaf 1 november 2026; langzame trend omhoog, schommelingen groter bij dure panden, binnen 0,65×–1,15× de trend).
  Woningen kopen en verkopen gaat tegen de marktprijs; woningen van vóór de markt houden minstens hun oude waarde. In Bezit
  koop je panden als **belegging** (tot 5 per soort, `S.vg`): ze worden verhuurd (60% van de huurprijs per speldag op je bank,
  `vgTick`) en je verkoopt ze tegen de marktprijs (−5% makelaar). Op de vastgoedmarkt zie je per pand de prijs, de verandering
  over 6 en 30 speldagen, een lijntje van de laatste 30 speldagen, de huur en het rendement.

- **Autosysteem uitgebreid (november 2026)** (`carheist.js`, `pages/autos.js`, `pages/carjack.js`, `data.js` `CARS`, `css/cars.css`):
  - **Steelervaring** (`S.carXp`, 10 levels van Groentje tot Legende, `CXP_LV` 0/4/10/20/35/55/85/125/180/250 punten): elke gestolen
    auto telt, van de straat én bij het stoplicht (gewoon/ongewoon 1, zeldzaam/episch 2, legendarisch 3, mythisch 4 punten). Los van
    de training Rijvaardigheid (die blijft meer tijd en een betere prijs geven). Bestaande spelers beginnen met de punten van hun al
    gestolen auto's (`S.carDex`, anders `S.stats.cars`). Kracht als autodief (`carPow`) = 80% ervaring + 20% rang.
  - **Duurdere vondsten met ervaring**: de kans per zeldzaamheid schuift van `FIND0` (groentje: episch of beter ±5%) naar `FIND1`
    (legende: ±19%), licht progressief (p^1,3). De lobby toont een blok Steelervaring met de kansen voor jou nu; de collectie toont
    per model jouw kans en per zeldzaamheid het aanbevolen level.
  - **90 modellen** (33 nieuw): klasse `k:1` voor Ritselaar t/m Huurmoordenaar (o.a. M5, RS7, GT-R, Corvette Z06, 911 GT3 RS,
    AMG GT Black Series, Vantage, Maybach S 680, Ghost, Bentayga, DBX707; €22.000 tot €165.000) en `k:2` voor Kapitein t/m
    Peetvader (296 GTB, Revuelto, 812, Senna, Cullinan Black Badge, G 650 Landaulet en mythisch Nevera, 300 SL, Miura, F40,
    Daytona SP3, Utopia, Valkyrie, Speedtail, Divo, Mistral; €220.000 tot €4,5 mln.). Je ziet ze vaker naarmate je ervarener bent;
    onder de rang van de klasse veel minder vaak (×0,25 / ×0,1). Gewone straatauto's zie je als ervaren dief iets minder vaak.
  - **Moeilijkheid naar ervaring**: elke zeldzaamheid heeft een aanbevolen level (`CXP_REQ` 1/2/4/6/8/9). Eronder heb je tot de
    helft minder tijd per pijl en meer rode pijlen, erboven meer tijd (tot +60%), minder rode pijlen en een extra fout. Een
    Bugatti Mistral als groentje: 0,16 s per pijl, 4 rood, geen fout; als legende 0,46 s, 3 rood, 1 fout (plus Rijvaardigheid en
    gereedschap).
  - **Carjacken**: duurdere auto's dan op straat (tot legendarisch en mythisch, dure klassen ×1,2). **Zonder wapen** kun je het
    proberen, maar niemand stapt uit: de bestuurder rijdt weg. **Met wapen** telt de vuurkracht (Vlindermes 1 tot Machinegeweer 12):
    groter groen stuk, minder kans dat de bestuurder weigert (`jackRefuse`) of terugvecht. Gelukt? Dan belt soms een omstander
    **112** (6% tot 45%, meer bij dure auto's en hitte, minder met ervaring): je moet ontsnappen in **Plankgas!** (niveau =
    zeldzaamheid, 2 tot 5). Gewonnen = de auto is van jou; verloren = gepakt (`jailFor`, cel) en de auto is weg. Verversen tijdens
    de achtervolging telt als gepakt.
  - **Het Autokerkhof: sloop-ervaring** (`S.sloopN`, Prutser 0, Sleutelaar 5, Monteur 15, Demonteur 35, Vakman 70,
    Meestersloper 120): onderdelen zijn samen 80% van de waarde; per level minder schade (30% → 6%) en minder kosten (6% → 2%).
    Netto ±50% als beginner, ±60% als Monteur, ±73% als Meestersloper (was vast 60%; wie het autokerkhof al had begint als
    Demonteur, ±64%). Elke sloop toont een bon met per onderdeel de schade.
  - **De heler: band** (`S.heler.b`): 7 niveaus (nieuw: Vertrouweling 120 en Bloedbroeder 200, tot 7 bestellingen, ×2,0 tot ×2,7,
    50% wit, elke auto ×1,2). De band groeit per levering: +1, episch of beter +2, spoedorder +1 extra. Bestaande spelers: band =
    aantal leveringen. Dure klassen komen pas op zijn lijst als je die rang hebt.
  - **Inhuren** (vanaf Gangster, `S.helerJobs`): laat een kennis een bestelde auto stelen en afleveren. Jij krijgt 70% van wat de
    heler betaalt. Wachttijd 6 min + 4 min per zeldzaamheid (× lidmaatschap), 5% + 2% per zeldzaamheid kans dat het misgaat (−1%
    per niveau bij de heler, minimaal 3%); mislukt = niks, de bestelling blijft open. Eén tegelijk, vanaf Compagnon twee; niet voor
    spoedorders. Telt als een halve band.

## Slot, paniek, kalmte en speelbare trainingen (november 2026)
- **Een slot op de klus** (`lockgame.js`, `lockParams`/`lockChance` in `state.js`, `CR_LOCK` in `data.js`): bij 22 inbraak-achtige
  klussen (fietsendiefstal, autokraak, villa, kantoor, garagebox, kunst, kluizen …) zit er 25–55% van de keren een slot op. Dan
  kraak je het zelf: een naald zwaait over een balk, druk (spatie, klik of tik) als hij in het groene stuk staat en een pin zit.
  Mis = paniek erbij; twee missers op rij en een pin springt terug. De paniek loopt ook vanzelf op; is hij vol, dan moet je
  eerst **rustig ademen**: een cirkel zwelt en krimpt, tik als hij het grootst is, 3 (zware sloten 4) keer goed op rij. Drie
  keer mis = betrapt. Tijd op = iemand komt eraan. Lukt het slot, dan gaat de klus door met +3% kans (+0,3% per level
  Slotenkraken) en +8% buit; mislukt het, dan is de klus mislukt (gewone arrestatie). Verversen of weggaan tijdens een slot
  telt als betrapt (`S.pendingLock`, afgehandeld in `main.js`). Moeilijkheid: rang van de klus (3–6 pinnen, snellere naald,
  kleiner groen stuk), je levels Slotenkraken en Ademhaling en je kalmte. Op Misdaden staat per klus "Slot: x% kans · soort ·
  pinnen"; oefenen kan zonder gevolgen (knoppen Slotenkraken en Ademhaling naast Rennen).
- **Trainingen die je zelf speelt**: nieuwe training **Slotenkraken** (werkplaats van een oud-inbreker, vanaf Straatschoffie;
  per level groter groen stuk, tragere naald, meer kans bij een slot) en **Ademhaling** (yogaschool; per level ruimer
  ademvenster, naast de bestaande slaagkans en vluchtruimte). Je speelt de oefening: lukt het, dan betaal je en ga je een
  level omhoog; lukt het niet, dan betaal je niets en kun je na een derde van de wachttijd opnieuw. Vanaf level 10, 20, 30 en
  40 wordt de oefening zwaarder. Tegels met een spel hebben het label "Spel".
- **Kalmte** (`S.kalm`, `KALM_T`/`KALM_LV` in `data.js`, `kalmLv`/`kalmEnK`/`kalmPanic` in `state.js`): elke ontspanning geeft
  punten (kort 1, echt 3, luxe 8), 11 levels van Gespannen tot Meester van de rust. Per level +6% energie uit ontspannen (tot
  +60%), paniek loopt 5,5% per level langzamer op (tot 55%) en het ademvenster wordt ruimer. Paneel op Ontspannen met ring,
  level, voortgang en effecten.

## Grote ronde november 2026: klus-spellen, rennen, inrichting, zaken, huurmoorden, lidmaatschap

- **Voorpagina: grinden loont** (`lp-views.js` `grind`, opmaak in `lp.css`): sectie "Van een op de drie. Naar bijna altijd." met de
  kans en extra buit per niveau van professionaliteit (zelfde som als `crimegames.js`), waar professionaliteit uit bestaat
  (40/25/20/15) en wat grinden nog meer oplevert. Op /misdaden staat per klus de kans als beginner → meester en het
  diagram is rang tegen buit; op /rangen staat "Klussen open" in plaats van de oude kansbonus.

### Klus-spellen en professionaliteit (november 2026)

- **Elke klus heeft een spel** (`public/js/crimegames.js`, `public/css/crimegames.css`). Elf soorten, elk met een eigen
  tekening (SVG/CSS), bediening met spatie, klik of tik (keuzespellen ook met 1–4, hacken met het toetsenbord, route met ← →),
  4–20 seconden spelen plus een korte uitleg vooraf (tik of spatie om meteen te beginnen):
  | Spel | Hoe | Klussen |
  |---|---|---|
  | Grijpen | grijp zodra hij wegkijkt (reactie) | zakkenrollen, pakketjes, horlogeroof, stadionkassa |
  | Sluipen | pakken duurt even: begin net als de lichtkegel wegdraait | drogist, statiegeld, taggen, kasteel, museum, Londen, kroonjuwelen, rivaal, ladingdiefstal |
  | Slot | het bestaande slot (`lockgame.js`) met pinnen, paniek en ademhaling | fiets, e-bikes, autokraak, villa, koplampen/airbags, garagebox, apotheek |
  | Kluis | draaischijf: druk als het gevoel-lampje het felst gloeit | bank, diamant, casino, Centrale Bank, Genève, goudreserve |
  | Overval | er gebeurt steeds iets: kies op tijd de juiste reactie (4 knoppen) | avondwinkel, ramkraak, juwelier, geldtransport, goud, privéjet |
  | Praten | lees de stemming, kies de aanpak die past (één keer mis mag). Oplichting gebruikt alleen algemene tonen (zakelijk, vriendelijk, snel), geen belscripts | bedelen, snackbar, chanteren, havenbaas, aanbesteding, keeper, rechter, lobbyist, kartelvrede, fraudebeller, "Hoi mam", bankpas verhuren |
  | Onthouden | gegevens onthouden en daarna de vragen goed beantwoorden (papierspoor) | nepwebshop, bouwfraude, scheepswerf, Kaaiman, Wereldbank, valse facturen, ondergrondse bank |
  | Hacken | code overtypen voor de trace-balk leeg is | tickets, kantoor Zuidas, datalek, cryptobeurs, containernummer, stroom, online casino |
  | Route | wissel op tijd naar de vrije baan langs controles | envelop, smokkelroute, wapenlading, superjacht, Rotterdam, olietanker |
  | Dealen | stop de wijzer in het groene stuk van de prijs | heling, veiling, pokerkelder, voorkennis, vastgoed in Dubai |
  | Ritme | druk op de maat aan het eind van elke slag | koperkabel, katalysator, drukgang (valse briefjes) |
- **Professionaliteit P (0–100%) per klus** = 0,40 × vakmanschap (√(keer gelukt/150)) + 0,25 × ervaring in de soort
  (level 0–10 met tussenstand) + 0,20 × de training die bij het spel hoort (bv. Vingervlugheid bij grijpen, Slotenkraken en
  Ademhaling bij slot en kluis, Hacken bij hacken, Rijvaardigheid bij route) + 0,15 × rang t.o.v. de klus (3 rangen erboven,
  of Peetvader level 5, = vol). Niveaus: Beginner, Gevorderd (30%), Professional (55%), Meester (80%).
- **Kans** = spel × dobbelsteen. Het spel is zo afgesteld dat een gemiddelde speler het haalt in 50% (P=0), ±83% (P=½) en
  99% (P=1) van de keren; de ruimte per poging (venster, reactie- of antwoordtijd) wordt daaruit teruggerekend met een model
  van een gemiddelde speler (timingfout 70 ms, reactie 0,42 ± 0,09 s). Daarna de dobbelsteen: 58 + 38 × P + (basiskans − 50)
  × 0,2 + uitrusting, outfit, familie, Vingervlugheid, Ademhaling, Schieten (zware klussen) en focus − hitte, × lidmaatschap,
  plafond zoals vroeger (95% tot 99%). Op de kaart staat de verwachte kans ("spel 61% × daarna 87%"); de titel en
  schermlezertekst geven de hele som. Nieuweling: ±26–34%, halverwege ±72–80%, alles maximaal: 98%.
- **Buit**: × (1 + 0,6 × P^1,5), dus een meester +60% (vervangt de +5% per vakmanschapsniveau). Geen fout in het spel =
  schone klus: +8% buit (één fout +4%) en perfecte straatcredit. Rangbonus en de rest van `lootMult` blijven zoals ze waren.
- **Snel uitvoeren** voor meesters (P ≥ 80%): zonder spel, met kans dobbelsteen × (spelkans − 6%), zonder schone-klusbonus
  (maximaal 92% tegen 98% met spel).
- **Slot**: de losse slotkans (`CR_LOCK`) is opgenomen in de spellen: klussen met het spel Slot krijgen altijd het slot (met
  P als moeilijkheid, hooguit 2 fouten), andere klussen nooit nog een extra slot erbovenop.
- **Verversen tijdens een spel = betrapt** (`S.pendingGame`, afgehandeld in `main.js`; oude `S.pendingLock` blijft werken).
- **Oefenen** per spel zonder gevolgen: knop "Klus-spellen" op Misdaden (kies spel en niveau) of tik op het spel-label op een
  klus. Niveau 1 = Meester tot 5 = Nieuweling.
- **Bagatellen** (`sev:'A'` in `CRIMES`: bedelen en statiegeld): mislukt = weggestuurd (3× de wachttijd) of een APV-boete
  (2× de max-buit, minstens €50); geen cel en geen vlucht (`crimeFailMinor` in `actions.js`, haak voor het latere
  gevolg per ernstklasse).
- **Klussen aangepast (politieadvies)**: `fruitautomaat` → "Hoi mam, nieuw nummer" (oplichting), `parkeer` → Koplampen en
  airbags (slot), `deurbel` → Je bankpas verhuren (oplichting), `witwas` → Valse facturen schrijven, `satelliet` → Een eigen
  ondergrondse bank (witteboord), `olympisch` → Vastgoed in Dubai, `renbaan` → Illegaal online casino, `telefoon` → Beller
  voor een fraudebende (meer buit), `vrachtwagen` → Ladingdiefstal op een truckparking, `afpersing` → Een vastgoedbaron
  chanteren (cel 170 s), `snackbar` cel 210 s, `horloge` → Overvallen (cel 270 s), `winkel` → Dief (€650–1.750, cel 190 s),
  `stadion` → Inbraak en kraken, `drukkerij` zonder slot, `minister` → Een lobbyist op de loonlijst, `scooter` → E-bikes en
  fatbikes. De ids bleven gelijk (vakmanschap en saves blijven kloppen). Familieklus "Haal een kroongetuige weg" → "Bevrijd een
  van jullie uit een gevangenentransport". Miauw is 3-MMC; bij Lucchetti seponeert "een officier van justitie op de loonlijst".
- Getest met een speelbot (Playwright) die elk spel goed en slecht speelt (goed: altijd gehaald, slecht: nooit), en een
  simulatie van 800 rondes per spel/niveau met een gemiddelde speler (gemiddeld 49% / 82% / 99% bij P = 0 / ½ / 1).

### Meer zaken en vestigingen

- **Meer zaken** (`data.js` blok 'Meer zaken', `pages/bezit-extra.js`): 47 soorten in plaats van 17. 30 nieuwe zaken, van straatniveau
  tot de top, plus een nieuwe categorie **Toerisme** (Fietsverhuur, Souvenirwinkel, Coffeeshop, Rondvaartboot, Hostel, Kunstgalerie).
  Nieuw per categorie: Winkels en diensten (Avondwinkel, Nagelstudio, Sportschool, Wisselkantoor, Juwelier), Horeca (Pizzeria,
  Bruin café, Grachtenrestaurant, Beachclub, Grand Casino), Auto's (Autowasstraat, Taxibedrijf, Luxe autoverhuur,
  Sportwagenimporteur), Handel (Marktkraam, Koeriersdienst, Groothandel, Transportbedrijf, Diamanthandel, Rederij), Vastgoed
  (Garageboxen, Studentenkamers, Parkeergarage, Kantoortoren Zuidas). Van Fietsverhuur (€4.000, Straatschoffie) tot Grand Casino
  (€9 mln., Peetvader); rangen die niks openden (Ritselaar, Handhaver, Kapitein, Schaduwbaas) openen nu ook een zaak. Inkomen volgt
  dezelfde formule (`BIZ_DAY_RATE`, vastgoed +20%), elk met vier eigen upgradenamen, een eigen icoon en een gevel. Nieuwe gevels:
  grachtenpanden, rondvaartboot met brug, marktkramen en een strandpaviljoen (`BZ_ART`, naast winkelpui/garage/toren/haven/hangar).
  Elke zaak (behalve vastgoed) heeft een eigen witwasprofiel met Nederlandse belasting (bv. taxi, rondvaart, sportschool 9% btw;
  wisselkantoor en transport vennootschapsbelasting; Grand Casino kansspelbelasting) en bonnetjes voor het politieverhoor.
  BIZ staat op prijs; de klanttempo-'tier' in het kassaspel komt nu uit de prijs van de zaak in plaats van de plek in de lijst.
- **Vestigingen per lidmaatschap**: maximaal 10 per zaak, **VIP 12**, **High roller 15** (`BIZ_MAX_TIER`, `bizMax()` in data.js).
  Bezit toont "n / 12 vestigingen" met de uitleg (gewoon 10, VIP 12, HR 15), de vestigingsplekken groeien mee, en de kooplijst
  verbergt een zaak pas als je het maximum van jouw lidmaatschap hebt. Elke volgende vestiging blijft 25% duurder, dus vestiging
  11-15 verdienen zich pas in 30-73 speldagen terug: voordeel, geen geldmachine. Wie VIP verliest, houdt zijn vestigingen maar
  kan niet bijkopen. Witwassen: "level x/60" (of /75); de snelheidsbonus blijft gemeten tegen 10 vestigingen. Extra plaatsnamen
  voor vestiging 11-15: Amstelveen, Haarlem, Almere, Hoofddorp, Purmerend.

### Inrichting: meer plekken, 50 spullen, plafonds (november 2026)

- **Plekken per woning** (`data.js` `HOUSES[].slots`, `inrichting.js` `houseSlots`/`furnSlots`): elke woning heeft nu een
  eigen aantal, oplopend met de prijs: Onder de brug 2, Kraakpand 3, Lekke woonboot 4, Zolderkamer 5, Studio 6,
  Grachtenappartement 7, Herenhuisetage 8, Penthouse 10, Penthouse IJ-oever 11, Toppenthouse 12, Villa 14, Landgoed 15
  (was per soort 1, 2, 4, 6, 9, 13; niemand heeft er minder dan eerst). `HOMES[].slots` is nu het aantal van de goedkoopste
  woning van die soort.
- **Lidmaatschap** (`TIER_SLOTS=[0,2,5]`): VIP heeft in elke woning altijd **2 plekken extra**, High roller altijd **5**
  (los van rang of level; via `tier()`). Landgoed als High roller = 20 plekken. De extra plekken hebben in de plekkenbalk een
  gouden rand en een tag (+2 VIP / +5 HR). Raak je je lidmaatschap kwijt, dan gaan de goedkoopste spullen die niet meer passen
  naar de opslag (niets verdwijnt). Bij het laden zonder lidmaatschap van de server wordt niets weggezet.
- **50 spullen** (was 37). Nieuw, elk met een eigen isometrische tekening (`VH_GEN`): matras van de stoep, campingstoel,
  transistorradio, campinggasstel, hangmat, laptop met VPN, roeitrainer, kunstwerk, wijnklimaatkast, biljarttafel,
  beveiligingsruimte, behandelkamer en vluchttunnel. Duurdere stukken doen twee of drie dingen tegelijk (bijv. behandelkamer:
  dokter +8% en −20% wachttijd, plus sneller herstel; beveiligingsruimte: minder verlies, hitte zakt sneller, minder kans
  herkend). Alleen bestaande effecten; geen nieuwe max. energie.
- **Plafonds per effect** (`FURN_CAP`, toegepast in `furnFx`; `furnFxRaw` = zonder plafond): herstel gezondheid +200%,
  energie laden +75%, hitte zakken +150%, focus +20%, max. energie +98, per rustbeurt +30%, wachttijd rusten −45%, vluchten
  +30%, verlies bij mislukken −75% (was te stapelen tot boven 100%), dokter +15% en −40%, onderduiken +100%, herkend −80%.
  In de winkel staat "max" bij een effect waar je al op zit; bij Je spullen ook.
- **Energie blijft 500**: alle energiespullen samen geven nog steeds +98 (plafond 98). Alles op max: basis 100 + Conditie
  150 + Landgoed 100 + inrichting 98 + rang 52 = **500** (getest).
- **Tafereel**: vrije plekken (`VH_SPOT`) per soort zo uitgerekend dat ze niet overlappen met elkaar, met de vaste meubels of
  met de vaste plek van een ander spul, ook als High roller alles vol staat (villa 24, penthouse 21, gracht 18, kraakpand 14,
  huurkamer 13, brug 6). Ze vullen zich verspreid over de kamer. In de kleine huurkamer staan de spullen op 85% (`VH_SPOT_K`).
- **Winkel overzichtelijk**: bovenaan **In huis** als compacte kaarten (naam, effecten, Opbergen op één regel), dan Te koop
  (met hoeveel plekken vrij, of "alles vol · berg eerst iets op"), Opslag, en **Nog op slot** ingeklapt (tik om te openen,
  per soort woning met het aantal plekken). Filters per soort blijven.
- Kleine reparaties: marktprijs in de bezichtiging liep op de telefoon over het vakje ernaast; tafereel-animaties staan stil
  bij prefers-reduced-motion.

### Huurmoorden

- **Huurmoorden: soepeler en drukker** (`public/js/pages/hits.js`, `public/css/hits.css`):
  - **Oorzaak van het stroeve kraanspel** (gemeten met Playwright): de spellaag had `backdrop-filter: blur`, die elk frame opnieuw
    over de hele pagina werd berekend: op desktop ~15 fps (67 ms per frame, pieken tot 300 ms), en omdat de natuurkunde per
    frame liep, ging het spel ook in slow motion. Nu: dekkende laag zonder blur, de pagina eronder tekent niet mee, canvas max.
    ~2,6 MP. Desktop van 7–11 naar 32–49 fps onder dezelfde belasting (headless, zonder GPU); telefoon 60 fps.
  - **Kraan**: natuurkunde in vaste stapjes van 1/120 s; de kat volgt muis/vinger kritisch gedempt (300 px in ~0,7 s, was
    1,6 s); ← → sturen de kat direct en hij stopt bij loslaten (schoof eerst nog 3,8 s / ~380 px door); slingeren max ~30–40°
    (was tot 86°). Een pijltje boven de giek laat meteen zien waar de kat heen gaat, een **gele ring** op de stoep waar de
    lading nu zou landen (zo breed als hij raakt), met stippelboog; tijdens de val groeit zijn schaduw. Los blijft tikbaar:
    tik je terwijl er geen lading hangt, dan schudt de knop en staat er waarom. Elke invoer (toets, muis, touch) is binnen één
    frame zichtbaar; dubbele triggers via focus/spatie zijn uitgesloten.
  - **Publiek bij geweer en pistool** schaalt met het doelwit: geweer 2 / 3 / 6 / 8 / 10 / 13 omstanders (moeilijkheid 1–6),
    pistool 1 / 2 / 4 / 5 / 6 / 8. Drie stroken diepte: achter het doelwit, naast hem, en vóór hem langs (0–5 mensen); vanaf
    moeilijkheid 3 blijven voorbijgangers soms vóór hem staan en lopen mensen met hem mee, lijfwachten stappen soms vóór hem.
    Wie vooraan staat vangt het schot (omstander geraakt = mislukt, zoals altijd). Zwaardere doelwitten krijgen iets meer tijd
    (+0,8 s per voorbijganger vooraan). De romp van de peetvader is ~40% van de tijd bedekt, van de verklikker ~1%.
  - **Nieuwe figuren**: jas met schouders, broek, schoenen, armen die meezwaaien, huidskleuren, haar, pet/muts, sjaal, tas;
    het doelwit blijft de man in de rode jas met hoed, lijfwachten in donker pak met zonnebril.
  - Sluip (mes) en Adem (geweer) kun je ingedrukt houden óf kort aantikken (aan/uit). Mes op een smalle telefoon: de camera
    houdt het doelwit in beeld, anders een pijl met zijn **!** aan de rand.
  - Doelwitten "De wethouder" en "De kroongetuige" zijn vervangen door **De vastgoedbaron** (Frits "De Huisbaas" Mulder) en
    **De overloper** (Vincent "De Vos" Hoekstra); zelfde id's, moeilijkheid, rang en beloning.

### Lidmaatschap: koopmenu VIP en High roller (november 2026, nog zonder betaling)
Een koopmenu voor VIP en High roller in het spel en op de website. **Er is nog geen betaling**: de koopknoppen tonen alleen
"Binnenkort beschikbaar · Betalen komt eraan". Er wordt niets gekocht, betaald of geactiveerd en er is geen betaalprovider;
het lidmaatschap blijft zoals de beheerder het geeft (Beheer → speler → Lidmaatschap).
- **Eén bron**: `public/js/lid-data.js` (`LID`): prijzen (VOORLOPIG: VIP €4,99 en High roller €9,99 per maand, incl. btw),
  de drie kaarten (kernvoordelen) en de volledige vergelijking in 6 categorieën (Misdaad, Geld, Casino, Woning, Zaken, Overig;
  37 voordelen), plus `LID.tableHtml()` voor de tabel. Gebruikt door het spel én door de server (vm, zoals lp-views.js).
- **Alles uit de code**: in het spel controleert `lidCheck()` (pages/lid.js) elke waarde tegen de echte constanten (TIER_K,
  TIER_LOOT, TIER_WAIT, TIER_CB, CZ_TIER, CZ_BAN, SRCH_MAX/CD, SEIZE_KEEP, BANK_T, DEP_TERMS, DEP_SLOTS_T, INV_CAP_T, CC_T,
  KK/VD/ZB/DR_TIER, FAM_INT_CD, geldklemmen en gouden dobbelsteen in OUTFITS, BIZ_MAX). Verschil = waarschuwing in de console.
  Hoogvlieger-RTP komt uit deze README. Nieuw deze ronde (label "nieuw"): woningen +2 / +5 plekken, zaken 12 / 15 vestigingen.
- **Spel** (`#lid`, `js/pages/lid.js`, `css/lid.css`): drie kaarten Gratis / VIP (goud) / High roller (paars) met prijs,
  kernvoordelen en koopknop; je huidige lidmaatschap is gemarkeerd ("Jouw lidmaatschap", knoppen "Dit heb je nu" /
  "Inbegrepen bij …"). Daaronder een uitklapbare volledige vergelijking (op smalle schermen per rij een kaartje met
  GRATIS / VIP / HR). Bereikbaar via het menu (groep Jij, onder Ranglijst/Profiel; op de telefoon in Meer), zoeken ("vip"),
  een blok op Profiel, een tik op je eigen VIP/HR-tag (menu, statusbalk, profiel) en de slotknop op VIP/HR-items in Outfit.
- **Website** (`/lidmaatschap`, server-side gerenderd met `LPV.lidPage`, stijl van de voorpagina, in de sitemap; `css/lp-lid.css`):
  dezelfde kaarten en tabel, vragen, en een venster "Binnenkort beschikbaar". Ingelogd ziet je je eigen lidmaatschap
  (`lp:me`-event uit lp-home.js). Op de voorpagina een rustig blok "Gratis. Of net iets meer." met link. FAQ en "Wel/Niet"
  aangepast: het spel blijft gratis, nu nog niets te koop, VIP/HR komen later en vrijwillig.

### Gevolg per soort en de arrestatie (arrest.js)

Een mislukte klus loopt niet meer altijd op de cel uit. Het gevolg hangt af van de soort:

| Soort | Als het misgaat |
|---|---|
| Straatwerk, bagatellen (bedelen, statiegeld) | Boete of weggestuurd, geen cel |
| Straatwerk (rest), Inbraak en kraken | Betrapt: vluchten, je eruit praten of het arrestatieverloop |
| Overvallen | Straf ×1,75 (binnen het plafond van 10 minuten). Ontkom je, dan is er 50% kans op een signalement |
| Oplichting | Geen arrestatie maar een aangifte. Na 1 speldag (4 uur) doet de politierechter uitspraak: een boete of cel. Ga je intussen niet opnieuw de fout in, dan scheelt dat 40%. Nieuwe aangiftes worden bij dezelfde zaak gevoegd |
| Smokkel en handel | De partij is weg (boete van de helft van de gemiddelde buit) en je krijgt een locatieverbod: de klussen op die plek (haven, grens, wijk of jachthaven) zijn 1 speldag dicht |
| Witteboord en invloed | Geen cel, wel het FIOD-dossier (0–100): +30 als het mislukt (een meester krijgt +15), +2 als het lukt. Het zakt 0,5 per minuut. Is het vol, dan volgt een inval: beslag op de helft van je zwarte en 10% van je witte contanten (samen hooguit 3× de buit van de klus), en daarna het arrestatieverloop |

**Het arrestatieverloop.** Geef je je over, of mislukt je vlucht of je praatje, dan doorloop je vier stappen:

1. **Politiecel.** Je kiest een advocaat:
   - een gratis piketadvocaat: je wacht even, en die tijd telt als voorarrest;
   - een betaalde strafpleiter: 15–25% kans op een vormfout, en dan seponeert de officier;
   - geen advocaat: je gaat sneller door, maar het verhoor wordt zwaarder.
2. **Verhoor.** Je kiest:
   - zwijgen;
   - een verklaring afleggen: als je verhaal klopt, zakt het bewijs, en anders stijgt het;
   - bekennen: 20% minder straf.

   De bewijsmeter begint per soort hoger of lager, en een hoge professionaliteit drukt hem.
3. **De officier van justitie** beslist. De kansen staan in beeld:
   - **sepot**: alleen mogelijk als het bewijs onder de 50 zit;
   - **strafbeschikking**: vooral bij lichte zaken;
   - **voorgeleiding**: de cel, zoals het nu ook gaat.
4. **Strafbeschikking.** Je kiest hoe je die afdoet:
   - een boete betalen;
   - een taakstraf: 15 seconden graffiti weghalen;
   - de vervangende hechtenis uitzitten.

**Hoe lang je vastzit.** Je zit nooit langer vast dan je nu zou zitten. Met **"Laat de advocaat het regelen"** handel je alles in één klik af, met de gemiddelde uitkomst. Elke keuze wordt meteen opgeslagen. Ververs je midden in het verloop, dan krijg je de volle straf. Ververs je tijdens de taakstraf, dan krijg je de vervangende hechtenis.

**Waar je het ziet.** De lopende zaak, het FIOD-dossier en een locatieverbod staan:
- op de misdaadpagina, onder "Als het misgaat";
- op het politiebureau, onder "Justitie";
- op het dashboard.

Op elke klus staat wat er gebeurt als hij mislukt.
