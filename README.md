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
  Perfect Pairs en 21+3 (€10–€50). **Three Card Poker** met Ante/Play, Pair Plus en 6-Card Bonus (€10–€50). Code: `public/js/pages/tafels.js`.
- **Verblijf**: een getekend tafereel per woning (brug, kraakpand, huurkamer, grachtenpand, penthouse, villa).
  Rusten vult je energie en geeft +20% gezondheid of meer (beter huis = meer), daarna 5 minuten wachten (beter huis = korter).
  Dokter: +20% gezondheid in 10 seconden, daarna 10 minuten wachten. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.
  **Inrichting** vanaf de huurkamer: planten, espressomachine, goed bed, bokszak, aquarium, camera's, kluis, thuisbioscoop, sauna
  en meditatieruimte, elk met een blijvend voordeel (sneller herstel, focus, energie, minder hitte of verlies).
- **Auto's**: 38 modellen. Klik op "Zoek een auto" (2 energie) en je komt willekeurig iets tegen; de kans per model staat
  ernaast (een Fiat Panda ruim 6%, een Lamborghini Huracán 0,4%, een Bugatti Chiron 0,15%). Elke vondst heeft een eigen bouwjaar,
  kilometerstand, staat en dus prijs binnen de prijsklasse van het model. Stelen met 'Contact maken': zeldzamer = meer sloten achter elkaar,
  minder tijd per reeks en rode pijlen die je andersom moet indrukken. Rijvaardigheid geeft meer tijd en een betere prijs.
- **Onderduiken** (Verblijf): hitte zakt in 5 minuten naar 0, gedeeltelijk als je eerder weggaat.
- **Borg** groeit met je rang: als Dief kost 2 minuten zo'n €900, als Peetvader 10 minuten zo'n €150.000. Charisma geeft korting.
- **Opslaan**: de nieuwste versie wint (browser of server). Valt de server even weg, bijvoorbeeld tijdens een update, dan probeert
  het spel het opnieuw en gaat er geen voortgang verloren.
- **Arrestaties zijn verversbestendig**: openstaande keuze komt terug, afgebroken vlucht of autodiefstal telt als mislukt.
- **8 families**, van De Nieuwe Garde tot La Cupola
- **Profiel** met codes inwisselen (één keer per account, vastgelegd in de database). Codes staan in `server.js` (`CODES`): `lotto` (€1.500), `welkom` (€500), `casino` (€5.000) en `vip` (€20.000), plus een **rangcode** per rang (de naam van de rang, bv. `straatschoffie` €150 tot `peetvader` €500.000), alleen geldig als je die rang hebt bereikt.
- **Kluiskraker**: cluster-slot op 7×7 (5+ aangrenzende gelijke symbolen), Loper als wild, vakjes die bij elke
  nieuwe winst verdubbelen (x2 tot x128), 4+ kluizen = free spins waarin de vakjes blijven staan, extra spins vanaf
  2 kluizen in de bonus (2:+2 … 5+:+8), vakjes tot x1024, bonus kopen voor 100× inzet. Gesimuleerd: RTP ±96–97% basis,
  95,1% bij bonus kopen, max. winst 10.000×. Geluid via Web Audio (`public/js/sfx.js`). Engine in `public/js/slot.js` (ook in Node te draaien).
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
