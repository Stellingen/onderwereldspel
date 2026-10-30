# Onderwereld

Een maffia-klikspel in de browser met accounts. Begin als Rookie en werk je op tot Peetvader.

- **Landingspagina** (`/`) met uitleg, een speelbare demo en inloggen of account aanmaken
- **Spel** (`/game.html`) alleen voor ingelogde spelers; voortgang wordt opgeslagen in MySQL
- **Ranglijst** met echte spelers en rivalen uit de stad
- **51 misdaden** over 12 rangen (vier of meer per rang), met energie (1 punt per 18 s) zodat je niet alles kunt speedrunnen.
  Hoe hoger je rang, hoe meer elke klus oplevert: +6% buit per rang (Peetvader +66%), bovenop je familiebonus.
  **Levels binnen je rang**: elke rang heeft 5 levels (★ tot ★★★★★) op basis van je XP in die rang. Elk level geeft +3% buit
  en +1% op je passieve inkomen. Peetvader heeft eigen levels (100k, 150k, 225k, 340k en 500k XP). Je ziet je level in de
  topbalk, op het dashboard en op je profiel.
- **Vluchtspel**: gaat een klus mis, dan kun je vluchten (tik op het juiste moment). Op straat is dat makkelijk,
  in een afgesloten gebouw bijna onmogelijk. Lukt het: vrij en niet gezocht. Mislukt het: cel met 20% extra straf.
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
  Perfect Pairs en 21+3 (€10 tot €500 per rang: Straatschoffie €500, Boef €2.500, Peetvader €6.000), hoofdinzet tot €50.000. **Three Card Poker** met Ante/Play, Pair Plus en 6-Card Bonus (zelfde maximum per rang). Code: `public/js/pages/tafels.js`.
- **Verblijf**: een getekend tafereel per woning (brug, kraakpand, huurkamer, grachtenpand, penthouse, villa).
  Rusten vult je energie en geeft +20% gezondheid of meer (beter huis = meer), daarna 5 minuten wachten (beter huis = korter).
  Dokter: +20% gezondheid in 10 seconden, daarna 10 minuten wachten. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.
  **Inrichting** vanaf de huurkamer: planten, espressomachine, goed bed, bokszak, aquarium, camera's, kluis, thuisbioscoop, sauna
  en meditatieruimte, elk met een blijvend voordeel (sneller herstel, focus, energie, minder hitte of verlies).
- **Auto's**: 38 modellen. Klik op "Zoek een auto" (2 energie) en je komt willekeurig iets tegen; de kans per model staat
  ernaast (een Fiat Panda ruim 6%, een Lamborghini Huracán 0,4%, een Bugatti Chiron 0,15%). Elke vondst heeft een eigen bouwjaar,
  kilometerstand, staat en dus prijs binnen de prijsklasse van het model. Stelen met 'Contact maken': zeldzamer = meer sloten achter elkaar,
  minder tijd per reeks en rode pijlen die je andersom moet indrukken. Rijvaardigheid geeft meer tijd en een betere prijs.
- **Onderduiken** (Verblijf): loopt door als je weggaat. Op Verblijf zakt je hitte 20% per minuut en word je bijna nooit herkend;
  elders loop je vermomd rond: 5% per minuut en een agent kan je herkennen (dan word je opgepakt). Bij 0% ben je niet meer gezocht.
- **Borg** groeit met je rang: als Dief kost 2 minuten zo'n €900, als Peetvader 10 minuten zo'n €150.000. Charisma geeft korting.
- **Telefoon**: onderbalk met Start, Misdaden, Auto's, Casino en **Meer**. Meer opent een menu met alle pagina's per groep
  (Straat, Geld, Macht, Overig), met per pagina wat er speelt (energie, cel-tijd, inkomen per speldag, codes om te claimen).
  Staat je pagina niet in de balk, dan toont de vijfde knop die pagina. De statusbalk blijft bovenaan staan, de nieuwsband en
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
- **Bezit**: 14 soorten bedrijven, van Wasserette (€5.000, €1.250 per speldag) tot Privéjet-charter (€4 mln., €392.250 per speldag), elk vanaf een
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
    +25% groen gat bij vluchten en +10% ontsnappen, Los Halcones +25% autowaarde, Lucchetti 20% kans dat je zaak wordt
    geseponeerd, Gambrino +20% XP, La Cupola +10% XP, +10% inkomen en −20% hitte.
  - *Eer*: elke geslaagde klus (je straatcredit telt als eer), elke gestolen auto, auto's afleveren in de garage (30% van de
    waarde plus eer) en missies.
  - *Dagelijkse missies*: 5 per dag (nieuw om middernacht). Haal er minimaal 3, anders verlies je 10% van je eer. Alle 5 geeft
    extra eer en straatcredit. Grotere families geven zwaardere doelen (tot 10 auto's stelen, 8 auto's afleveren, €1,4 mln.
    verdienen) en een grote klus die vuurkracht en uitrusting vraagt: van een avondwinkel overvallen (mes) tot de bank
    (AK-47, kogelvrij vest, signaalverstoorder) en De Nederlandsche Bank (machinegeweer, militaire uitrusting, thermische lans).
    Missiegeld groeit met je familielevel (Erelid ×2).
- **Wapens & uitrusting** (`public/js/pages/wapens.js`): 19 items in 4 soorten, elk met tiers en een rang-eis. Per soort telt je
  beste item. Wapens: slaagkans en vuurkracht (Vlindermes tot Machinegeweer, +3% tot +18%). Bescherming: slaagkans en kortere
  celstraf. Gereedschap: buit en meer tijd bij auto stelen. Communicatie: minder hitte na elke klus (−10% tot −55%).
  Oude saves: vroeger telde alles bij elkaar op; overbodige oude items worden terugbetaald.
- **Bank** (`public/js/pages/bank.js`, koersen in `public/js/market.js`). Alles bij de bank ben je niet kwijt als je gepakt wordt.
  - *Spaarrekening*: 0,10% rente per uur (VIP 0,12%), vrij opneembaar, ook offline tot 12 uur. (Was 1% per 10 minuten:
    dat is ruim 300% per dag en maakte beleggen zinloos.)
  - *Deposito*: geld vast voor 1 uur (0,15%), 6 uur (1,2%), 24 uur (4,5%) of 3 dagen (15%). Kan niet zakken; na afloop gaat alles
    vanzelf naar je spaarrekening. Eerder opzeggen kost 2% en je krijgt geen rente. 3 tegelijk (VIP 4, met 25% hogere rente).
  - *Beleggen*: Staatsobligaties, Vastgoedfonds Zuidas, Haven Rotterdam NV en OnderCoin. Elk fonds keert per uur uit (rente, huur,
    dividend, staking: ±5% tot ±17% per dag) en heeft een koers die kan stijgen en dalen. De koersen zijn voor alle spelers gelijk en
    lopen door als je offline bent (vaste functie van de tijd, Brownse brug, dus geen server nodig). Kosten 0,25% tot 1% bij kopen
    en verkopen (VIP de helft). Kans op verlies na 24 uur: 0% / 13% / 30% / 37%, na 7 dagen 0% / 0% / 1% / 9%.
  - Max per deposito en per fonds: €250.000 × 2 per rang (Capo €64 mln., Peetvader €512 mln.).
- **Profiel** met codes inwisselen (één keer per account, vastgelegd in de database). Codes staan in `server.js` (`CODES`): `lotto` (€1.500), `welkom` (€500), `casino` (€5.000), `vip` (€20.000), `spinnetje` (€25.000), `jackpot` (€1.000.000) `trainwreck` (€3.000.000; daarna kun je in Kluiskraker inzetten tot €500.000 per spin) en `m1` tot en met `m9` (elk €5.000.000; opnieuw uitgegeven, intern `m1v4` enz., dus ook wie een eerdere versie had gebruikt kan ze weer inwisselen), plus een **rangcode** per rang (de naam van de rang, bv. `straatschoffie` €150 tot `peetvader` €500.000), alleen geldig als je die rang hebt bereikt.
- **Kluiskraker**: cluster-slot op **10×10** met 9 symbolen (5+ aangrenzende gelijke symbolen, uitbetaling per clustergrootte
  tot 20+), Loper als wild, vakjes die bij elke winst x2, x4 … tot **x4096** worden. **3 kluizen = 10 free spins, 4 = 12, 5 = 14,
  6+ = superbonus.** Extra kluizen **tumbelen erin**: zolang er winst valt vallen er nieuwe symbolen in, en liggen er al 3 kluizen,
  dan valt een 4e, 5e of 6e makkelijker in. Tijdens de bonus geven 2+ kluizen extra spins.
  **Gouden baar**: valt hij in de gewone bonus, dan blijft hij de hele bonus vast op zijn vakje liggen (ook bij tumbles en nieuwe
  spins) en telt hij als **loper**, dus hij helpt clusters maken. Heb je er 3, dan win je de max win (±1 op 170 bonussen van 10 spins).
  **Superbonus**: 8 spins met veel meer lopers; daar is één Gouden baar al de max win (±1 op 13).
  **Max win**: 500× je inzet per ronde, ook bij een gekochte bonus (de inzet telt, niet de prijs van de bonus).
  **Bonus kopen** (100× de inzet) zet je aan met een schakelaar naast de draaiknop; je krijgt altijd 3 kluizen bovenop wat er
  vanzelf valt en kunt doortumbelen tot de superbonus; +2 free spins (superbonus +1). **Inzet kiezen** gaat via een pop-up (ook bij Visdief).
  Het bord is net zo hoog dat het met de knoppen ernaast zonder scrollen op een laptopscherm past.
  Spatiebalk = draaien. **Seed**: elke spin komt uit jouw seed + spinnummer. Doorgerekend (`sim9.js`, 1,5 mln. spins per
  lidmaatschap, `simbuy4.js` voor gekochte bonussen): gewoon bonus ±1 op 200 (4+ ±1 op 880, superbonus ±1 op 20.000), RTP ±92%;
  VIP ±1 op 175, RTP ±95%; High roller ±1 op 143, RTP ±96%. Bonus kopen ±95% / 95,5% / 96,5%. Basisspel 143% van de tabel
  (VIP ×0,99, High roller ×0,89), de bonus 92%.
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
  Casino, doorgerekend (gewoon / VIP / High roller): Kluiskraker (10×10, max 500×) bonus 1 op 200 / 175 / 143, RTP 92% / 95% / 96%, bonus kopen
  ±95% / 95,5% / 96,5%; Visdief bonus 1 op 200 / 172 / 143, RTP 91,5% / 94% / 96,5%, kopen ±97%; Hoogvlieger landt 17% / 18% / 19%,
  RTP 86% / 92% / 96%. Alles blijft onder 100%, ook met cashback.
- **Huurmoorden** (vanaf Huurmoordenaar, met een scherpschuttersgeweer of beter): 6 contracten (moeilijkheid 1–6, Huurmoordenaar
  tot Peetvader). Je richt door een vizier dat meebeweegt met je adem: muis (telefoon: slepen), spatie/Adem ingedrukt = rustig
  vizier, klik/Vuur = schieten. Hoofd = perfect (+25% geld, cred ×1,5), romp = gelukt. Mis = doelwit rent weg; laatste kogel mis
  of een omstander geraakt = arrestatie (met vluchtspel). Rustiger vizier door training Schieten, beter wapen, lidmaatschap en
  Het Schaduwcontract. Verversen tijdens een contract telt als mislukt. Code: `public/js/pages/hits.js`.
- **Familiegesprek**: aansluiten gaat via een gesprek van 3 vragen over de familie (eigen voordeel, grote klus, rang, cred,
  omschrijving, buitbonus), alles staat op de familiekaart. Training **Charisma** helpt: elke 15 levels een hint (er valt een fout
  antwoord weg) en vanaf level 25 mag je één keer fout zitten. Afgewezen = 15 minuten wachten (VIP/High roller korter).
- **Tags**: echte spelers krijgen in de ranglijst en de zijbalk een groene tag "Speler", plus VIP of High roller.
- **Kluiskraker op brede schermen**: links een kolom om je inzet te kiezen (fiches per groep, bonus kopen, snel), rechts saldo,
  deze spin, laatste winst, een grote draaiknop, een overzicht van deze sessie en je seed; beide kolommen sluiten aan op het bord
  en zijn even hoog.
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
Elke aanpassing staat in het logboek. Het spel van de speler stopt meteen met opslaan, toont "Je account is bijgewerkt"
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
| GET | `/api/health` | status van server en database |
| GET | `/api/admin/stats`, `/api/admin/players?q=&f=&sort=`, `/api/admin/player/:id`, `/api/admin/log` | beheer (alleen beheerders) |
| POST | `/api/admin/player/:id/action` | `{type: money/xp/cred/fix/tier/ban/admin/reset/kick, …}` |
