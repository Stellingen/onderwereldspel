# Prototype: de stad in een realistischer stijl (alleen voorbeeld)

Dit is geen onderdeel van het spel en wordt niet uitgerold. Het tekent dezelfde kaart als de Pixelstad (`public/js/stad/stad-map.js`)
zonder pixels: volle resolutie, zachte schaduwen, lucht, water met spiegeling, getekende gevels, ronde auto's en mensen.

Starten:

    cd proto/realistisch
    npm i three playwright
    node serve.js                      # http://localhost:4011/?shot=plein
    node shoot.js straat 1920 1080 straat.png

Beelden (`r-shots.js`): `plein` (speelbeeld van boven), `straat` (camera achter je karakter), `regen` (avond met regen),
`haven` (brug bij ondergaande zon), `gesprek` (praten met een personage, met portret van dichtbij).

Bestanden: `real.js` (licht, lucht, water, nabewerking), `r-ground.js` (grond en wegmarkering), `r-build.js` (gevels en daken),
`r-props.js` (bomen, lantaarns, auto's), `r-people.js` (mensen), `r-ui.js` (schermlaag), `r-shots.js` (standpunten en licht).

Beperkingen: de mensen en auto's zijn eenvoudige vormen uit code, geen echte 3D-modellen; er is geen spel in verwerkt (alleen
stilstaande beelden); het is niet getest op snelheid op een telefoon.
