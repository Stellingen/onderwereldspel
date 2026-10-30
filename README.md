# Onderwereld

Een maffia-klikspel in de browser met accounts. Begin als Rookie en werk je op tot Peetvader.

- **Website** (`/`, `public/js/landing.js`): elk onderwerp heeft een eigen pagina en adres (History API, de server geeft voor
  onbekende paden `index.html`): `/misdaden` (alle 60 klussen in een kans-tegen-buit grafiek, filter per rang en sorteren),
  `/casino` en `/casino/<spel>` (elk spel een eigen illustratie, regels en uitbetalingen; de tabellen van Kluiskraker en Visdief
  komen live uit `slot.js` en `vis.js`; oefendemo's van Mines, roulette en de munt), `/families` en `/families/<id>` (verhaal uit
  `lore.js`, plek in de voedselketen, de machtsverhoudingen van nu uit `famwar.js`, doorgroeien tot Onderbaas en Baas), `/rangen`
  en `/training`. De voorpagina heeft een 3D-stadskaart met een meldkamer en een loopbaanlijn van Rookie tot Peetvader die je
  kunt slepen. Inloggen en account aanmaken werken zoals voorheen (`?login=1`, `?register=1`).
- **Spel** (`/game.html`) alleen voor ingelogde spelers; voortgang wordt opgeslagen in MySQL
- **Ranglijst** met echte spelers en rivalen uit de stad
- **60 misdaden** over 12 rangen (vijf per rang), met energie (1 punt per 18 s) zodat je niet alles kunt speedrunnen.
  Hoe hoger je rang, hoe meer elke klus oplevert: +6% buit per rang (Peetvader +66%), bovenop je familiebonus.
  **Levels binnen je rang**: elke rang heeft 5 levels (★ tot ★★★★★) op basis van je XP in die rang. Elk level geeft +3% buit
  en +1% op je passieve inkomen. Peetvader heeft eigen levels (100k, 150k, 225k, 340k en 500k XP). Je ziet je level in de
  topbalk, op het dashboard en op je profiel.
- **Vluchtspel** (`flee.js`): gaat een klus mis, dan ren je weg door een steeg of een gebouw (2.5D): wissel van baan met
  pijltjes/A-D, vegen of tikken, spring met omhoog of spatie, ontwijk obstakels en agenten. Op straat is dat makkelijk, in een
  afgesloten gebouw bijna onmogelijk. Elke achtervolging loopt op van makkelijk naar moeilijk: eerst losse obstakels met
  ruimte ertussen, dan hekken, auto's en mensen of honden die oversteken, en na de rode streep op de route de **eindsprint**:
  rijen vlak na elkaar (slalom), overstekers en bewakers die met je meeschuiven. Ongeveer 35% meer rijen en meer obstakels per rij, in ongeveer dezelfde tijd, met
  nieuwe soorten (container, vuilniszakken, dranghek, natte-vloerbord, printer, bureaustoel, schoonmaker, hond). De tijd tussen
  twee rijen zakt van ±1,05× naar ±0,6× het tempo van het niveau, nooit onder een halve seconde. Conditie, vervoer, outfit,
  familie en woning maken het makkelijker. Lukt het: vrij en niet gezocht. Mislukt het: cel met 20% extra straf.
- **Misdaden** (`misdaden.js`): elke klus heeft een eigen icoon en een balk met kans, opbrengst (plus XP en cred) en wat er
  gebeurt als het misgaat (straf en hoe moeilijk vluchten is). Bovenaan de drie beste klussen voor jou, met opbrengst per energie.
- **Training** met tijdsloten: elke sessie is één level, tot level 50. Elk level is duurder (conditie: €60 voor level 1,
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
- **Verblijf** (`verblijf.js`, scènes en inrichten in `inrichting.js`): **indeling**: bovenaan rusten, dokter en onderduiken (op de telefoon drie compacte tegels), daaronder twee grote knoppen: **Winkel** (spullen per kaart met wat ze doen en de prijs; wat bij een betere woning hoort staat er al op slot; betalen met contant of van je bankrekening) en **Upgraden** (de woningladder met vergelijking, kopen met wit geld of van de bank). Daaronder je woning; tik erop om in te richten. Oorspronkelijk: de woningen staan bovenaan als ladder, elk met een
  isometrische scène (onder de brug, kraakpand, huurkamer, grachtenappartement, penthouse, villa) en een aantal plekken
  (1, 2, 4, 6, 9, 13). Klik op je woning om in te richten: 19 spullen, neerzetten, opbergen of verkopen (de helft terug);
  wat niet past na een verhuizing gaat naar de opslag. Bekijk een andere woning voor een vergelijking.
  Rusten vult je energie en geeft +20% gezondheid of meer (beter huis = meer), daarna 5 minuten wachten (beter huis = korter).
  Dokter: +20% gezondheid in 10 seconden, daarna 10 minuten wachten. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.
  **Inrichting** vanaf de huurkamer: planten, espressomachine, goed bed, bokszak, aquarium, camera's, kluis, thuisbioscoop, sauna
  en meditatieruimte, elk met een blijvend voordeel (sneller herstel, focus, energie, minder hitte of verlies).
- **Auto's**: 38 modellen, elk getekend in zijn eigen klasse (stadsauto, hatchback, sedan, stationwagen, SUV, super-SUV, sportwagen, GT, supercar, hypercar, terreinwagen, limousine en meer) op basis van echte afmetingen, zonder merktekens (`carSvg` in `carheist.js`). Klik op "Zoek een auto" (2 energie) en je komt willekeurig iets tegen; de kans per model staat
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
- **Bezit**: elke zaak is een banner met een eigen gevel (winkelpui, garage, toren, haven of hangar; verlichte ramen = je vestigingen), tik erop voor de vestigingen en upgrades. **Witwassen via een zaak kost tijd**: na de werkdag aan de kassa gaat het geld door de boeken; per soort zaak 10 speldagen × (som van de levels)^−1,43, dus 1 vestiging op level 1 = 10 speldagen (40 uur), 1 op max = 1 speldag, 10 op max = ±1 speluur (10 min). Eén ronde tegelijk per soort zaak; het geld staat zolang in de wasstraat. 14 soorten bedrijven, van Wasserette (€5.000, €1.250 per speldag) tot Privéjet-charter (€4 mln., €392.250 per speldag), elk vanaf een
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
- **Bajes** (`bajes.js`, werk in `jailjobs.js`): een straf duurt 30 tot 60 seconden langer, zodat je er iets kunt doen. Vier
  klussen in de bajes (wasserij: sorteren, keuken: timing, werkplaats: ritme bij het nummerplaten slaan, bibliotheek: geheugen),
  elk 16 tot 25 seconden met een wachttijd. Ze betalen een klein bedrag dat met je rang meegroeit en goed werk haalt tijd van je
  straf (hooguit 40%). Bij langere straffen komen er gebeurtenissen met een keuze: ruzie op de luchtplaats, een bewaker met een
  deal (Henk wordt een vaste contact: −10% op elke volgende straf), een tip van je celgenoot, een celinspectie of een advocaat.
  Borg betalen en ontsnappen werken zoals voorheen.
- **Wapens & uitrusting** (`public/js/pages/wapens.js`): een **winkelstraat** met vier zaken als banner met gevel: Het Arsenaal (wapens en bescherming), Bouwmarkt Hamer (gereedschap), Belwinkel De Lijn (communicatie) en Motorhuis Snel (vervoer om te vluchten); tik op een zaak om naar binnen te gaan. 24 items in 5 soorten, elk met tiers en een rang-eis. Per soort telt je
  beste item. Wapens: slaagkans en vuurkracht (Vlindermes tot Machinegeweer, +3% tot +18%). Bescherming: slaagkans en kortere
  celstraf. Gereedschap: buit en meer tijd bij auto stelen. Communicatie: minder hitte na elke klus (−10% tot −55%).
  Vervoer: makkelijker vluchten (opgevoerde scooter +6% tot helikopter op afroep +25%), de duurdere ook wat minder hitte.
  Oude saves: vroeger telde alles bij elkaar op; overbodige oude items worden terugbetaald.
- **Bank** (`public/js/pages/bank.js`, koersen in `public/js/market.js`). Per lidmaatschap: spaarrente 0,10% / 0,12% / 0,15% per uur
  (gewoon / VIP / High roller, deposito's met dezelfde verhouding), 2 / 5 / 10 depositoplekken en in totaal €10.000 / €30.000 /
  €100.000 beleggen. Lopende deposito's en beleggingen boven die grens blijven gewoon staan. Alles bij de bank ben je niet kwijt als je gepakt wordt.
  - *Spaarrekening*: 0,10% rente per uur (VIP 0,12%), vrij opneembaar, ook offline tot 12 uur. (Was 1% per 10 minuten:
    dat is ruim 300% per dag en maakte beleggen zinloos.)
  - *Deposito*: geld vast voor 1 uur (0,15%), 6 uur (1,2%), 24 uur (4,5%) of 3 dagen (15%). Kan niet zakken; na afloop gaat alles
    vanzelf naar je spaarrekening. Eerder opzeggen kost 2% en je krijgt geen rente. 3 tegelijk (VIP 4, met 25% hogere rente).
  - *Beleggen*: Staatsobligaties, Vastgoedfonds Zuidas, Haven Rotterdam NV en OnderCoin. Elk fonds keert per uur uit (rente, huur,
    dividend, staking: ±5% tot ±17% per dag) en heeft een koers die kan stijgen en dalen. De koersen zijn voor alle spelers gelijk en
    lopen door als je offline bent (vaste functie van de tijd, Brownse brug, dus geen server nodig). Kosten 0,25% tot 1% bij kopen
    en verkopen (VIP de helft). Kans op verlies na 24 uur: 0% / 13% / 30% / 37%, na 7 dagen 0% / 0% / 1% / 9%.
  - Max per deposito en per fonds: €250.000 × 2 per rang (Capo €64 mln., Peetvader €512 mln.).
- **Profiel** met codes inwisselen (één keer per account, vastgelegd in de database). Codes staan in `server.js` (`CODES`): bovenaan een **pinautomaat** (scherm met totaal, verdeling en wat je op zak hebt; knoppen voor alles storten en snel opnemen) met ernaast het menu Rekening, Deposito's en Beleggen. `lotto` (€1.500), `welkom` (€500), `casino` (€5.000), `vip` (€20.000), `spinnetje` (€25.000), `jackpot` (€1.000.000) `trainwreck` (€3.000.000; daarna kun je in Kluiskraker inzetten tot €500.000 per spin) en `highroller` (€50.000; ook te typen als "High Roller", spaties en streepjes tellen niet mee). De oude codes `m1` tot en met `m9` zijn weg en verdwijnen ook uit 'gebruikte codes'. Daarnaast is er een **rangcode** per rang (de naam van de rang, bv. `straatschoffie` €150 tot `peetvader` €500.000), alleen geldig als je die rang hebt bereikt.
- **Kluiskraker**: cluster-slot op **10×10** met 9 symbolen (5+ aangrenzende gelijke symbolen, uitbetaling per clustergrootte
  tot 20+), Loper als wild, vakjes die bij elke winst x2, x4 … tot **x4096** worden. **3 kluizen = 10 free spins, 4 = 12, 5 = 14,
  6+ = superbonus.** Extra kluizen **tumbelen erin**: zolang er winst valt vallen er nieuwe symbolen in, en liggen er al 3 kluizen,
  dan valt een 4e, 5e of 6e makkelijker in. Tijdens de bonus geven 2+ kluizen extra spins.
  **Gouden baar**: valt hij in de gewone bonus, dan blijft hij de hele bonus vast op zijn vakje liggen (ook bij tumbles en nieuwe
  spins) en telt hij als **loper**, dus hij helpt clusters maken. Heb je er 3, dan win je de max win (heel zeldzaam).
  **Superbonus**: 8 spins met veel meer lopers; daar is één Gouden baar al de max win.
  **Max win**: 5.000× je inzet per ronde, ook bij een gekochte bonus (de inzet telt, niet de prijs van de bonus); ±1 op 1.000 gekochte bonussen.
  **Bonus kopen** (100× de inzet) zet je aan met een schakelaar naast de draaiknop; je krijgt altijd 3 kluizen bovenop wat er
  vanzelf valt en kunt doortumbelen tot de superbonus; +2 free spins (superbonus +1). **8 vakjes beginnen op x2** en er is een
  **vangnet**: altijd minstens 20× je inzet terug. Verdeling (gewoon): mediaan ±52×, 25% van de keren 100× of meer, 9% 200× of meer.
  **Inzet kiezen** gaat via een pop-up (ook bij Visdief).
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
  midden in een bonus van Kluiskraker of Visdief, of open je het spel op een ander apparaat, dan zie je "Je bonus loopt nog":
  hij speelt verder vanaf de free spin waar je was (zonder dubbel uitbetalen), of je slaat hem over. Wordt het spel ergens
  anders geopend terwijl een bonus loopt, dan speelt die eerst rustig uit en komt de melding pas daarna.
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
  | Casino-cashback (Kluiskraker, Visdief, Mines, Hoogvlieger 0,5%, roulette 1%, poker 0,75%, blackjack 0,25%) | ×1 | ×1,5 |
  | Huurmoorden: rustiger vizier / meer tijd | −7,5% / +15% | −20% / +40% |
  | Hoge inzetten in de slots | – | ja (ook met code `trainwreck`) |
  Casino, doorgerekend (gewoon / VIP / High roller): Kluiskraker (10×10, max 5.000×) bonus 1 op 200 / 175 / 143, RTP 92% / 95% / 96%, bonus kopen
  ±95% / 95,5% / 96,5%; Visdief bonus 1 op 200 / 172 / 143, RTP 91,5% / 94% / 96,5%, kopen ±97%; Hoogvlieger landt 17% / 18% / 19%,
  RTP 86% / 92% / 96%. Alles blijft onder 100%, ook met cashback.
- **Huurmoorden** (`hits.js`): 9 contracten in drie niveaus (Straat, Professioneel vanaf Capo, Elite vanaf Onderbaas) en een
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
  inspecteur meekijkt; te opvallend = 30% in beslag en hitte; per speldag tot 2,5× je inkomen). Hoe beter je bezit, hoe minder
  het kost: basis 26%, tot −18% door je imperium (vestigingen en upgrades) en tot −5% door het niveau van de zaak die je
  gebruikt, minimaal 5%, en nog 2% minder als niemand iets merkt. Een beter uitgebouwde zaak heeft meer klanten en minder bonnen
  nodig (12 tot 8), dus het gaat ook sneller. **Via Ome Kees** (meteen, 30%, de normale prijs; maximum per speldag groeit met je rang) en **via het casino** (wat je wint
  is wit; elke inzet met zwart geld laat de verdenking oplopen, 3% per minuut omlaag, en geeft kans op een controle: dan nemen
  ze je zwarte geld en de helft van wat je net zwart inzette in beslag en word je aangehouden). Bezit, bank, casinowinst,
  codes, rangbeloningen en werk in de bajes leveren wit geld op. Oude saves: al je contant geld telt als wit.
- **Profielen**: standaard privé. Op Profiel → Zichtbaarheid zet je het openbaar; dan zien anderen via de ranglijst je
  vermogen, familie, woning, outfit en prestaties. Bij een privé profiel zien ze alleen naam en rang. Beheerders zien elk
  profiel, en in het beheerdashboard staat per speler of zijn profiel openbaar is en wat hij deed (zijn logboek uit het spel).
  API: `GET /api/profile/:naam` en `POST /api/profile/privacy {public}`; kolom `users.public_profile`.
- **Live bijwerken**: Bezit, Wapens, Families, Profiel, Bank, Training, Huurmoorden en het dashboard verversen elke seconde als
  er iets verandert, zodat knoppen meteen kloppen. In de slots loopt het saldo ook live mee.
- **Hoogvlieger**: een propellervliegtuigje (met rookspoor) vliegt op eigen kracht over zee, zonder vaste baan. Overal in de lucht
  hangen willekeurig items; wat hij raakt bepaalt zijn koers: een plusje (+1 tot +10) duwt hem omhoog, ×2 tot ×5 houdt hem even op
  dezelfde hoogte en een bom (÷2) ontploft en laat hem zakken. Zonder items glijdt hij naar de zee. Op zee liggen vliegdekschepen met
  water ertussen; blijft hij op het dek staan, dan win je inzet × multiplier (max 250×). De vlucht wordt bij het opstijgen in één
  keer doorgerekend en ligt dan vast. Doorgerekend (`avsim3.js`, 150.000 vluchten): gewoon landt ±17%, RTP ±86%; VIP (dekken 6,5%
  langer) ±18%, RTP ±92%; High roller (11% langer) ±19%, RTP ±96%. Code: `public/js/pages/vlucht.js`.
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
server.js            Express: API (registreren, inloggen, opslaan, ranglijst) + statische bestanden
db.js                MySQL-verbinding en tabellen
public/index.html    landingspagina
public/game.html     spel (controleert login, laadt voortgang uit de database)
public/css/          style.css (spel) en landing.css
public/js/landing.js inloggen/registreren, misdaadkaart en interactieve landing
public/js/slot.js    wiskunde van de Kluiskraker (pure functies)
public/js/flee.js    vluchtspel bij een mislukte klus
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
