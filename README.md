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
  (Straat, Geld, Macht, Overig), met per pagina wat er speelt (energie, cel-tijd, inkomen per minuut, codes om te claimen).
  Staat je pagina niet in de balk, dan toont de vijfde knop die pagina. De statusbalk blijft bovenaan staan, de nieuwsband en
  het kruimelpad vallen weg, en de casinospellen staan als 2 rijen knoppen. Hertekenen houdt je scrollpositie vast; in de slots
  worden alleen de onderdelen bijgewerkt die veranderen. Op de computer is niets veranderd.
- **App-icoon**: hoed voor een straatlantaarn (`public/icons/`), met `manifest.webmanifest`, apple-touch-icon en favicon.
  Op de telefoon: delen → "Zet op beginscherm" (iPhone) of menu → "App installeren" (Android); hij opent dan zonder browserbalk.
- **Opslaan**: de nieuwste versie wint (browser of server). Valt de server even weg, bijvoorbeeld tijdens een update, dan probeert
  het spel het opnieuw en gaat er geen voortgang verloren.
- **Arrestaties zijn verversbestendig**: openstaande keuze komt terug, afgebroken vlucht of autodiefstal telt als mislukt.
- **Bezit**: 14 soorten bedrijven, van Wasserette (€5.000, €40/min) tot Privéjet-charter (€4 mln., €55.000/min), elk vanaf een
  bepaalde rang. Klik op een bedrijf voor de details: tot 10 vestigingen per soort (elke volgende 25% duurder) en elke
  vestiging los upgraden van level 1 naar 5 (×1 / ×1,5 / ×2,2 / ×3,1 / ×4,3 inkomen) met eigen upgradenamen.
  **Bonus op al je inkomen**: +25% basis, +1% per vestiging en +0,5% per upgrade (samen tot +200%), +5% per rang.
  Zo levert elk bedrijf meer op naarmate je imperium groeit en je hoger in rang komt (Bezit toont de verdeling).
  "Upgrade alles wat kan" upgradet steeds de laagste vestiging eerst. Oude saves worden omgezet (aantal → vestigingen op level 1).
- **8 families** (`public/js/pages/families.js`), van De Nieuwe Garde (vanaf Loopjongen) tot La Cupola (vanaf Onderbaas, 650 cred).
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
- **Kluiskraker**: cluster-slot op 7×7 (5+ aangrenzende gelijke symbolen), Loper als wild, vakjes die bij elke
  winst x2, x4 … tot **x4096** worden. **3 kluizen = 10 free spins, 4 = 12, 5 = 14, 6+ = superbonus.** Extra kluizen
  **tumbelen erin**: zolang er winst valt vallen er nieuwe symbolen in, en liggen er al 3 kluizen, dan valt een 4e, 5e of 6e
  makkelijker in. Geen winst = geen tumble = geen extra kluis. Tijdens de bonus geven 2+ kluizen extra spins.
  **Gouden baren** blijven in de gewone bonus de hele bonus op hun vakje staan (net als de vakjes, met een gouden rand): heb je er 3,
  dan win je de max win (±1 op 650 bonussen van 10 spins, ±1 op 345 bij 12, ±1 op 180 bij 14). **Superbonus**: 8 spins met veel meer
  lopers; daar is één Gouden baar al de max win (±1 op 20). **Max win**: 5.000× je inzet per ronde, ook bij een gekochte bonus
  (de inzet telt, niet de prijs van de bonus): via de vakjes of met de Gouden baren.
  **Bonus kopen** (60× de inzet) zet je aan met een schakelaar naast de draaiknop; de grote knop koopt dan elke keer een bonus.
  Het is een gewone spin met altijd 3 kluizen: valt er winst, dan tumbelt hij door en kunnen er kluizen bij vallen
  (normaal 4: ±13%, 5: ±4,3%, 6: ±1,3%; VIP 4+: ±21%, 6: ±1,8%). **Inzet kiezen** gaat via een pop-up (ook bij Visdief).
  Spatiebalk = draaien. **Seed**: elke spin komt uit jouw seed + spinnummer. Gesimuleerd (`sim8.js`, 1 mln. spins, 200.000
  gekochte bonussen): normaal bonus ±1 op 200 (4+ ±1 op 930, 5+ ±1 op 3.300, superbonus ±1 op 14.500), RTP ±92,5%; VIP bonus
  ±1 op 135 (4+ ±1 op 570, superbonus ±1 op 7.000), RTP ±96% + 0,5% cashback; bonus kopen ±93% (VIP ±97,5%).
  Basisspel betaalt 95,8% van de tabel (VIP 18% minder), de bonus 38,5%.
- **Roulette** (Europees, één nul, 2,7% huisvoordeel): groot wiel met rollende bal bovenaan, echte inzettafel eronder.
  Nummer, split, rij, hoek, zes, drie met nul, eerste vier, kolom, dozijn en de kansen, plus groepen op het wiel
  (Buren van nul, Overkant, Weesjes, Nulspel). Ongedaan maken, fiches weghalen (ook met rechtsklik), alles wissen,
  verdubbelen en herhalen; een fiche zetten werkt alleen dat vak bij (de pagina ververst niet). Op de telefoon staat de tafel rechtop.
  Maximum per vak: €50.000; vanaf Soldaat €75.000 op getallen en €100.000 op de rest, vanaf Onderbaas €150.000 en €200.000.
  Code: `public/js/pages/roulette.js`.
- **VIP** (code `vip`): VIP-tag bij je naam (ook in de ranglijst). **Alle wachttijden 60%** (klussen, auto stelen, training,
  ontspanning, rusten en de dokter; celstraffen niet). Misdaden: +15% buit, 10% groter groen gat bij vluchten en
  45% in plaats van 35% kans om uit de bajes te ontsnappen. Casino: cashback op elke inzet, direct te claimen
  (Kluiskraker, Mines en Hoogvlieger 0,5%, roulette 1%, Three Card Poker 0,75%, blackjack 0,25%, Dubbel of niks 0% omdat daar geen huisvoordeel is).
  Kluiskraker: bonus ±1 op 145 in plaats van 200 en superbonus ±1 op 2.500 in plaats van 4.400 (basisspel-clusters lager
  om onder 100% te blijven). Visdief: bonus ±1 op 140 in plaats van 200. Hoogvlieger: langere dekken, vaker landen.
- **Mines**: 5×5 vakjes, kies 1 tot 24 bommen of een stand (Makkelijk 3, Normaal 5, Moeilijk 10, Expert 15, Extreem 20,
  Gekkenhuis 24: eerste vakje al 24,5×). Elk veilig vakje verhoogt de multiplier (98% van de echte kans, RTP 98%, max 10.000×). Cash out wanneer je wilt; de bommen
  liggen vast zodra je start en het spel blijft staan als je ververst. Code: `public/js/pages/mines.js`.
- **Hoogvlieger**: een vliegtuigje vliegt op eigen kracht over zee, zonder vaste baan. Overal in de lucht hangen willekeurig
  items; wat hij raakt bepaalt zijn koers: een plusje (+1 tot +10) duwt hem omhoog, ×2 tot ×5 houdt hem even op dezelfde hoogte en
  een bom (÷2) ontploft en laat hem zakken. Zonder items glijdt hij naar de zee. Op zee liggen vliegdekschepen met water ertussen;
  na het aanraken rolt hij nog door. Blijft hij op het dek staan, dan win je inzet × multiplier (max 250×). De vlucht wordt bij het
  opstijgen in één keer doorgerekend (natuurkunde + willekeurige items) en ligt dan vast. Meestal 12 tot 55 seconden (mediaan ±24 s),
  soms anderhalve minuut of langer; "Sneller vliegen" speelt hem 3× zo snel af. Doorgerekend (`avsim2.js`, 80.000 vluchten):
  normaal landt ±17%, RTP ±87%; VIP heeft 12% langere dekken, landt ±19%, RTP ±98%. Code: `public/js/pages/vlucht.js`.
- **Dubbel of niks**: een munt die echt in 3D wordt opgegooid, precies 50% kans (crypto-random), geen huisvoordeel.
  Win je, dan kies je: je pot pakken of nog een keer gooien voor het dubbele, tot 10 keer (×1024). De pot blijft bewaard bij verversen.
  Code: `public/js/pages/munt.js`.
- Kleur per sectie (Straat oranje, Geld groen, Macht paars, Overig blauw) en een zijbalk op brede schermen

## Railway instellen

De app-service **Gangster Spel** draait `node server.js` (staat in `railway.json`). Zet bij die service onder **Variables**:

| Variabele | Waarde |
|---|---|
| `MYSQL_URL` | `${{ MySQL.MYSQL_URL }}` (kies de MySQL-service via de referentie-knop) |
| `JWT_SECRET` | een lange willekeurige tekst, bijvoorbeeld 40+ tekens |

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
