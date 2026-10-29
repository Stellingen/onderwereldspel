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
- **Profiel** met codes inwisselen (één keer per account, vastgelegd in de database). Codes staan in `server.js` (`CODES`): `lotto` (€1.500), `welkom` (€500), `casino` (€5.000), `vip` (€20.000), `spinnetje` (€25.000), `jackpot` (€1.000.000) `trainwreck` (€3.000.000; daarna kun je in Kluiskraker inzetten tot €500.000 per spin) en `m1` tot en met `m9` (elk €5.000.000; opnieuw uitgegeven, intern `m1v2` enz., dus ook wie de oude €3 mln.-versie had kan ze weer gebruiken), plus een **rangcode** per rang (de naam van de rang, bv. `straatschoffie` €150 tot `peetvader` €500.000), alleen geldig als je die rang hebt bereikt.
- **Kluiskraker**: cluster-slot op 7×7 (5+ aangrenzende gelijke symbolen), Loper als wild, vakjes die bij elke
  winst x2, x4 … tot x1024 worden. **3 kluizen = 10 free spins, 4 = 12, 5 = 14.** Bij 3 tot 5 kluizen **kraakt de kluisdeur**:
  elk ander vakje kan een kluis worden; komt er een bij, dan kraakt hij opnieuw. Tijdens de bonus geven 2+ kluizen extra spins.
  **6+ kluizen = superbonus**: 8 spins met veel meer lopers (veel grotere winsten), 25% meer kans op extra kluizen en veel vaker de **Gouden baar**
  (direct de max win; ±1 op 15 superbonussen). In de gewone bonus kan de Gouden baar ook landen, maar heel zeldzaam (±1 op 2.000).
  Niet te koop. **Max win 5.000× de inzet**, inzet €10 tot €50.000 (klik op je inzet om meteen een bedrag te kiezen).
  Kluizen vallen vaker links dan rechts; liggen er 2, dan vallen de volgende kolommen trager en lichten ze goud op (spanning).
  Bonus kopen kost 100× de inzet (10 free spins). Spatiebalk = draaien. Gesimuleerd (3,2 mln. spins, zie `slot.js`):
  RTP ±95,5% (bonus ±1 op 470, superbonus ±1 op 9.000, gemiddeld ±550×), bonus kopen ±96%, VIP ±98,5%.
- **Roulette** (Europees, één nul, 2,7% huisvoordeel): groot wiel met rollende bal bovenaan, echte inzettafel eronder.
  Nummer, split, rij, hoek, zes, drie met nul, eerste vier, kolom, dozijn en de kansen, plus groepen op het wiel
  (Buren van nul, Overkant, Weesjes, Nulspel). Ongedaan maken, fiches weghalen (ook met rechtsklik), alles wissen,
  verdubbelen en herhalen; een fiche zetten werkt alleen dat vak bij (de pagina ververst niet). Op de telefoon staat de tafel rechtop. Code: `public/js/pages/roulette.js`.
- **VIP** (code `vip`): VIP-tag bij je naam (ook in de ranglijst). Misdaden: +15% buit, 10% groter groen gat bij vluchten en
  45% in plaats van 35% kans om uit de bajes te ontsnappen. Casino: cashback op elke inzet, direct te claimen
  (Kluiskraker 0% omdat VIP daar al vaker in de bonussen komt, Mines en Hoogvlieger 0,5%, roulette 1%, Three Card Poker 0,75%, blackjack 0,25%, Dubbel of niks 0% omdat daar geen huisvoordeel is),
  en in Kluiskraker ±5% vaker de bonus en een kluisdeur die vaker kraakt: de superbonus is ±40% makkelijker. In de bonus zelf is alles gelijk.
- **Mines**: 5×5 vakjes, kies de moeilijkheid (Makkelijk 3, Normaal 5, Moeilijk 10, Expert 15 of Gekkenhuis 20 bommen).
  Elk veilig vakje verhoogt de multiplier (97% van de echte kans, RTP 97%, max 10.000×). Cash out wanneer je wilt; de bommen
  liggen vast zodra je start en het spel blijft staan als je ververst. Code: `public/js/pages/mines.js`.
- **Hoogvlieger**: een vliegtuigje vliegt over zee en pakt multipliers (+1, +2, +5, +10, ×2 tot ×5) of bommen (÷2, en hij zakt).
  Aan het eind moet hij landen op een vliegdekschip; tussen de dekken zit water en na het aanraken rolt hij nog door. Blijft hij
  op het dek staan, dan win je inzet × multiplier (max 250×). Doorgerekend: RTP ±97%, ±29% van de vluchten landt.
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
