# Onderwereld

Een futuristisch maffia-klikspel in de browser. Begin als Rookie en werk je op tot Peetvader.

## Spelen

Open `index.html` in je browser. Je voortgang wordt automatisch opgeslagen in je browser (localStorage).

## Onderdelen

- **Misdaden** – zes klussen met slaagkans, wachttijd en straatcredit
- **Auto's** – stelen, verzamelen in je garage en verkopen
- **Casino** – blackjack, gokkast, dubbel of niks en roulette met een draaiend wiel
- **Skills** – vingervlugheid, autodiefstal, charisma en snelheid (tot level 10)
- **Bezit** – bedrijven met passief inkomen, ook als je offline bent
- **Wapens** – permanente bonus op je slaagkans
- **Bank** – veilig geld met rente
- **Families** – sluit je aan met genoeg rang en straatcredit
- **Bajes** – straf van 30 sec tot 10 min, borg betalen of ontsnappen (dan sta je op de gezochtlijst)
- **Ranglijst** – vergelijk jezelf met je rivalen

## Structuur

```
index.html          pagina-opbouw en laadvolgorde van de scripts
css/style.css       alle styling
js/data.js          spelgegevens (rangen, misdaden, auto's, bedrijven, wapens, families)
js/state.js         spelerstatus, opslaan, spelregels, arrestaties, skills
js/ui.js            navigatie en statusbalk
js/pages/*.js       één bestand per tabblad
js/actions.js       alle klikacties en politiecontroles
js/main.js          renderen, nieuwsticker en de spel-loop
```

De scripts zijn gewone (geen module) scripts en delen dus dezelfde globale scope; de volgorde in `index.html` is belangrijk.
