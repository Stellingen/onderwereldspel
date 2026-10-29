# Onderwereld

Een maffia-klikspel in de browser met accounts. Begin als Rookie en werk je op tot Peetvader.

- **Landingspagina** (`/`) met uitleg, een speelbare demo en inloggen of account aanmaken
- **Spel** (`/game.html`) alleen voor ingelogde spelers; voortgang wordt opgeslagen in MySQL
- **Ranglijst** met echte spelers en rivalen uit de stad
- **51 misdaden** over 12 rangen (vier of meer per rang), met energie (1 punt per 18 s) zodat je niet alles kunt speedrunnen.
  Hoe hoger je rang, hoe meer elke klus oplevert: +6% buit per rang (Peetvader +66%), bovenop je familiebonus.
- **Vluchtspel**: gaat een klus mis, dan kun je vluchten (tik op het juiste moment). Op straat is dat makkelijk,
  in een afgesloten gebouw bijna onmogelijk. Lukt het: vrij en niet gezocht. Mislukt het: cel met 20% extra straf.
- **Training** met tijdsloten: elke sessie is één level, tot level 50. Elk level is duurder (conditie: €60 voor level 1,
  ongeveer €690.000 voor level 50). Oude saves worden omgerekend: elke gedane sessie telt als één level.
- **Blackjack** aan een volle tafel (6 kaartspellen, dealer staat op 17, splitsen/verdubbelen, 3:2) met side bets
  Perfect Pairs en 21+3 (€10 tot €50 per rang: Rookie €50, Peetvader €600), hoofdinzet tot €50.000. **Three Card Poker** met Ante/Play, Pair Plus en 6-Card Bonus (zelfde maximum per rang). Code: `public/js/pages/tafels.js`.
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
- **Telefoon**: hertekenen houdt je scrollpositie vast; in de slot worden alleen de onderdelen bijgewerkt die veranderen.
- **Opslaan**: de nieuwste versie wint (browser of server). Valt de server even weg, bijvoorbeeld tijdens een update, dan probeert
  het spel het opnieuw en gaat er geen voortgang verloren.
- **Arrestaties zijn verversbestendig**: openstaande keuze komt terug, afgebroken vlucht of autodiefstal telt als mislukt.
- **Bezit**: 14 soorten bedrijven, van Wasserette (€5.000, €40/min) tot Privéjet-charter (€4 mln., €55.000/min), elk vanaf een
  bepaalde rang. Klik op een bedrijf voor de details: tot 10 vestigingen per soort (elke volgende 25% duurder) en elke
  vestiging los upgraden van level 1 naar 5 (×1 / ×1,5 / ×2,2 / ×3,1 / ×4,3 inkomen) met eigen upgradenamen.
  "Upgrade alles wat kan" upgradet steeds de laagste vestiging eerst. Oude saves worden omgezet (aantal → vestigingen op level 1).
- **8 families**, van De Nieuwe Garde tot La Cupola
- **Profiel** met codes inwisselen (één keer per account, vastgelegd in de database). Codes staan in `server.js` (`CODES`): `lotto` (€1.500), `welkom` (€500), `casino` (€5.000), `vip` (€20.000), `spinnetje` (€25.000), `jackpot` (€1.000.000) `trainwreck` (€3.000.000; daarna kun je in Kluiskraker inzetten tot €500.000 per spin) en `m1` tot en met `m9` (elk €5.000.000; opnieuw uitgegeven, intern `m1v3` enz., dus ook wie een eerdere versie had gebruikt kan ze weer inwisselen), plus een **rangcode** per rang (de naam van de rang, bv. `straatschoffie` €150 tot `peetvader` €500.000), alleen geldig als je die rang hebt bereikt.
- **Kluiskraker**: cluster-slot op 7×7 (5+ aangrenzende gelijke symbolen), Loper als wild, vakjes die bij elke
  winst x2, x4 … tot x1024 worden. **3 kluizen = 10 free spins, 4 = 12, 5 = 14.** Bij 3 tot 5 kluizen **kraakt de kluisdeur**:
  elk ander vakje kan een kluis worden; komt er een bij, dan kraakt hij opnieuw. Tijdens de bonus geven 2+ kluizen extra spins.
  **6+ kluizen = superbonus**: 8 spins met veel meer lopers (veel grotere winsten), 25% meer kans op extra kluizen en veel vaker de **Gouden baar**
  (direct de max win; ±1 op 20 superbonussen). In de gewone bonus kan de Gouden baar ook landen: hoe meer kluizen bij de start,
  hoe groter de kans (3 kluizen ±1 op 800, 4 ±1 op 280, 5 ±1 op 100). **Max win 5.000× de inzet**, inzet €10 tot €50.000.
  Kluizen vallen vaker links dan rechts; liggen er 2, dan vallen de volgende kolommen trager en lichten ze goud op (spanning).
  **Bonus kopen** kost 60× de inzet: altijd 3 kluizen, daarna kan de deur doorkraken naar 4, 5 of de superbonus (±2%).
  Spatiebalk = draaien. **Seed**: elke spin komt uit jouw seed + spinnummer; "Nieuwe seed" geeft een nieuwe reeks uitkomsten
  (de kans per spin blijft gelijk). Je ziet per seed hoeveel spins en bonussen je had. Gesimuleerd met 1,6 mln. spins:
  normaal RTP ±92% (bonus ±1 op 390, superbonus ±1 op 7.400), VIP ±97,5% + 0,5% cashback (bonus ±1 op 280, superbonus ±1 op 4.200),
  bonus kopen ±96%. In de bonus betalen clusters 40% van de tabel, in het basisspel ±109% (VIP ±104%); de vakjes blijven in de bonus staan.
- **Visdief** (tweede slot, eigen naam en tekeningen, in de stijl van een vis-collect-slot): 5 rollen × 3 rijen, 10 lijnen.
  3 boeien = 10 free spins, 4 = 15, 5 = 20 (±1 op 145 spins, VIP ±1 op 130). In de bonus hebben vissen een geldwaarde (2× tot 500×)
  en pakt de **Visdief** (wild) alles wat er ligt; twee Visdieven pakken alles twee keer. Elke 4 Visdieven: +10 spins en
  multiplier ×2, ×3, ×10. Bonus halen is makkelijk, groot winnen niet: ±14% van de bonussen geeft minder dan 5×, ±9% meer dan 100×,
  ×10 halen ±0,4%, de max win (5.000×) is heel zeldzaam. VIP: vaker de bonus en iets vaker een Visdief. Bonus kopen 46× (10 spins).
  Seed per slot, spatiebalk = draaien. Doorgerekend (`visim.js`-model in `public/js/vis.js`): normaal RTP ±92%, VIP ±97% + 0,5% cashback.
- **Roulette** (Europees, één nul, 2,7% huisvoordeel): groot wiel met rollende bal bovenaan, echte inzettafel eronder.
  Nummer, split, rij, hoek, zes, drie met nul, eerste vier, kolom, dozijn en de kansen, plus groepen op het wiel
  (Buren van nul, Overkant, Weesjes, Nulspel). Ongedaan maken, fiches weghalen (ook met rechtsklik), alles wissen,
  verdubbelen en herhalen; een fiche zetten werkt alleen dat vak bij (de pagina ververst niet). Op de telefoon staat de tafel rechtop. Code: `public/js/pages/roulette.js`.
- **VIP** (code `vip`): VIP-tag bij je naam (ook in de ranglijst). Misdaden: +15% buit, 10% groter groen gat bij vluchten en
  45% in plaats van 35% kans om uit de bajes te ontsnappen. Casino: cashback op elke inzet, direct te claimen
  (Kluiskraker, Mines en Hoogvlieger 0,5%, roulette 1%, Three Card Poker 0,75%, blackjack 0,25%, Dubbel of niks 0% omdat daar geen huisvoordeel is).
  Kluiskraker: bonus ±1 op 280 in plaats van 400 en superbonus ±1 op 4.200 in plaats van 7.400 (basisspel-clusters ±4% lager
  om onder 100% te blijven; de bonus zelf is gelijk). Hoogvlieger: ±13% meer kans om te landen.
- **Mines**: 5×5 vakjes, kies 1 tot 24 bommen of een stand (Makkelijk 3, Normaal 5, Moeilijk 10, Expert 15, Extreem 20,
  Gekkenhuis 24: eerste vakje al 24,5×). Elk veilig vakje verhoogt de multiplier (98% van de echte kans, RTP 98%, max 10.000×). Cash out wanneer je wilt; de bommen
  liggen vast zodra je start en het spel blijft staan als je ververst. Code: `public/js/pages/mines.js`.
- **Hoogvlieger**: een vliegtuigje vliegt over zee en pakt multipliers (+1, +2, +5, +10, ×2 tot ×5): dan stuitert hij omhoog.
  Een bom halveert de multiplier en duwt hem omlaag. Aan het eind moet hij landen op een vliegdekschip; er liggen weinig schepen
  en na het aanraken rolt hij nog door. Blijft hij op het dek staan, dan win je inzet × multiplier (max 250×).
  Doorgerekend (echte `avPlan`): normaal RTP ±87% en ±22% landt; VIP heeft 9% langere dekken, landt ±13% vaker (±25%) en haalt ±98%.
  De vlucht ligt vast zodra je opstijgt. Code: `public/js/pages/vlucht.js`.
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
