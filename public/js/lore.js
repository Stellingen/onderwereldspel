// Achtergrondverhalen van de families en een korte regel per rang. Alles is verzonnen: geen echte personen of organisaties.
// Gebruikt door de website (landing.js) en het spel (familiepagina). Vorm:
//   FAM_LORE[id] = {story:[alinea's], wijk, sinds, baas, motto}
//   RANK_LORE[rangnaam] = één regel over wat die rang betekent
//   FAMRANK_LORE[familierang] = één regel per rang binnen een familie
const FAM_LORE={
 garde:{wijk:'Amsterdam-West, van de Kinkerbuurt tot Slotervaart',sinds:'2019',baas:'Rocco "Lont" Verbeek',motto:'Wie wacht, wordt ingehaald.',
  story:[
   'Het begon op een bankje aan het Mercatorplein: vijf jongens, één scooter en een telefoon die nooit uit ging. Niemand nam ze serieus, en dat was hun eerste voordeel.',
   'De oude families vergaderen, wachten en onderhandelen. De Nieuwe Garde doet het vandaag, en morgen nog een keer. Pakketjes, scooters, avondwinkels: de klussen die de grote namen te klein vinden, zijn hun brood.',
   'Rocco Verbeek heet Lont omdat hij nooit lang nadenkt. Hij regelt alles vanuit een snackbar aan de Jan Evertsenstraat. Wie hem één keer laat zitten, hoeft niet meer terug te komen.',
   'De Garde is de eerste familie die je binnenlaat. Wie snel is, klimt hier snel, en wie lang genoeg blijft, zit ooit zelf in die snackbar.']},
 kurogumi:{wijk:'Het Rembrandtplein en de Wallen, na middernacht',sinds:'1998',baas:'Kenji "De Stille" Arata',motto:'Wie praat, heeft verloren.',
  story:[
   'Kurogumi begon met één deur: de portiersdienst van een club aan het Rembrandtplein. Wie de deur heeft, heeft de club. Vijf jaar later stonden hun mannen bij de helft van de nachtclubs van de stad.',
   'Tatoeages tot aan de pols, nooit verder. Onder een wit overhemd zie je niks. Ze praten weinig, schrijven niets op en betalen altijd contant.',
   'Kenji Arata zit elke avond aan hetzelfde tafeltje achterin en drinkt groene thee. Wie zonder uitnodiging aanschuift, staat buiten voordat de thee koud is.',
   'Bij Kurogumi leer je geduld. Een club die voor je draait, betaalt je elke nacht opnieuw, ook als jij ligt te slapen.']},
 colombra:{wijk:'De Pijp en de Albert Cuypmarkt',sinds:'1974',baas:'Don Aurelio Colombra',motto:'Een gunst vergeet je nooit.',
  story:[
   'In 1974 opende Aurelio Colombra een ijssalon aan de Ferdinand Bolstraat. De ijssalon bestaat nog steeds. Het ijs is het minst interessante dat er over de toonbank gaat.',
   'De Colombra\'s werken met gunsten. Een advocaat die een avond doorwerkt, een agent die even de andere kant op kijkt. Alles wordt onthouden, en alles wordt terugbetaald. Met rente.',
   'De oude don is inmiddels achter in de tachtig. Zijn kleinzoon doet het werk, maar op zondag wordt er nog altijd aan de lange tafel gegeten, en daar wordt besloten wie erbij hoort.',
   'Word je gepakt terwijl je voor de Colombra\'s werkt, dan sta je er niet alleen voor. De familie betaalt een deel van je borg. Een gunst, natuurlijk.']},
 volkov:{wijk:'Het Westelijk Havengebied',sinds:'1993',baas:'Pjotr "De Wolf" Volkov',motto:'Wie valt, staat op.',
  story:[
   'Ze kwamen begin jaren negentig met een busje en één adres in Westpoort. Dertig jaar later is de helft van de loodsen aan het water van hen, en de andere helft betaalt huur.',
   'De Bratva draait op discipline. Om zes uur trainen, vaste routes, geen drank onder werktijd. Wie een fout maakt, krijgt één kans. Een tweede fout bestaat niet.',
   'Pjotr Volkov heeft twee keer vastgezeten en is twee keer ontsnapt. Hij leert zijn mensen wegkomen als alles op slot zit. De rest van de stad noemt dat geluk. De Bratva noemt het oefenen.',
   'Je begint als aspirant in de loods. Wie hard genoeg werkt, staat ooit naast de Wolf. En wie hem overleeft, zit op een dag op zijn stoel.']},
 halcones:{wijk:'De Waalhaven en de Maasvlakte, Rotterdam',sinds:'2006',baas:'Esteban "El Halcón" Varela',motto:'Elke container komt aan.',
  story:[
   'Los Halcones kijken mee vanaf de kraan. Twintig jaar geleden kochten ze een expeditiebedrijf in de Waalhaven. Nu weten ze van elke container waar hij vandaan komt en waar hij echt naartoe gaat.',
   'Hun routes lopen van Rotterdam via Antwerpen tot diep in Zuid-Amerika. Wat erin zit, vraagt niemand. Wat erin past, is alles: auto\'s, motoren, geld in vacuüm.',
   'Esteban Varela stuurt het kartel vanaf een jacht dat nooit twee nachten op dezelfde plek ligt. Zijn mensen herken je aan het horloge: allemaal hetzelfde model, gekregen na hun eerste lading.',
   'Bij Los Halcones brengt een gestolen auto meer op. Via hun routes staat een wagen binnen een week aan de andere kant van de oceaan, met nieuwe papieren.']},
 lucchetti:{wijk:'De Zuidas en de P.C. Hooftstraat',sinds:'1961',baas:'Avvocato Sergio Lucchetti',motto:'Het pak maakt de man. De rechter de rest.',
  story:[
   'De Lucchetti\'s begonnen als kleermakers in de Utrechtsestraat. Wie er een pak liet maken, kreeg er een gesprek bij, en als het moest een advocaat.',
   'Tegenwoordig zitten ze op de Zuidas: een advocatenkantoor, een maatkleermakerij en twee rechters die bij elke uitspraak precies weten wie hun pak heeft betaald.',
   'Sergio Lucchetti heeft nooit een dag vastgezeten. Hij komt niet in de buurt van een klus en raakt nooit een wapen aan. Hij zet alleen handtekeningen, en die handtekeningen zetten mensen vrij.',
   'Wie bij de Lucchetti\'s hoort, ziet zijn zaak soms verdwijnen voordat er een zitting is. Een dossier dat zoekraakt. Een getuige die het zich ineens niet meer herinnert.']},
 gambrino:{wijk:'Amsterdam-Zuid en heel Wassenaar',sinds:'1952',baas:'Don Carmine Gambrino',motto:'Eén naam. Voor altijd.',
  story:[
   'De grootste van de Vijf Families. Toen de anderen nog in kelders vergaderden, had Gambrino al een hotel, een havenbedrijf en een wethouder.',
   'De familie is zo groot dat niemand precies weet hoeveel mensen ervoor werken. Iedereen kent wel iemand die iemand kent, en dat is precies de bedoeling.',
   'Don Carmine is de derde generatie. Hij geeft geen interviews, staat op geen enkele foto en woont achter een hek in Wassenaar waar zelfs de post niet doorheen komt.',
   'Binnenkomen is moeilijk. Weggaan bestaat niet. Maar wie voor Gambrino werkt, maakt sneller naam dan waar ook in de stad.']},
 cupola:{wijk:'Overal en nergens',sinds:'Niemand weet het precies',baas:'Don Salvatore Ferro, voorzitter van de raad',motto:'De tafel beslist.',
  story:[
   'La Cupola is geen familie zoals de rest. Het is de tafel waar de peetvaders van de stad samenkomen: één keer per maand, steeds op een andere plek, nooit met een telefoon op zak.',
   'Aan die tafel worden oorlogen beëindigd en wijken verdeeld. Wie zonder toestemming van de raad een andere familie aanvalt, heeft binnen een week geen vrienden meer.',
   'De raad wordt voorgezeten door Don Salvatore Ferro, een man die in veertig jaar nooit zijn stem heeft verheven. Dat hoeft ook niet.',
   'Een stoel aan tafel krijg je niet, die verdien je. De raad zorgt voor de eigen mensen: meer XP, meer inkomen en minder hitte.']},
 schaduw:{wijk:'Onbekend',sinds:'Onbekend',baas:'Niemand kent zijn naam. Ze noemen hem De Notaris.',motto:'Wij bestaan niet.',
  story:[
   'Het Schaduwcontract staat in geen enkel dossier. Er is geen clubhuis, geen foto van een leider en geen ledenlijst. Er is alleen een telefoonnummer dat elke week verandert.',
   'Het werk komt binnen in een envelop. Een naam, een adres, een bedrag. Wie het contract aanneemt, maakt het af en vergeet het daarna.',
   'De man die de enveloppen verdeelt, noemen ze De Notaris. Volgens de verhalen heeft hij nog nooit zelf een wapen vastgehad, maar weet hij van iedereen in de stad precies wat die waard is.',
   'Binnenkomen kan alleen met bewijs: drie geslaagde huurmoorden. Daarna gaan contracten makkelijker en betalen ze beter.']},
 nachtwacht:{wijk:'Het hoofdbureau, en elk bureau daarbuiten',sinds:'2011',baas:'Oud-commissaris Wim Raaf',motto:'Wij waren er al.',
  story:[
   'De Nachtwacht begon als een groepsapp van rechercheurs die vonden dat ze te weinig verdienden. Een tip hier, een kenteken daar. Het liep uit de hand.',
   'Nu zitten er oud-commando\'s in, rechercheurs en iemand op de meldkamer. Ze weten vandaag al waar de politie morgen binnenvalt, en wie daar geld voor over heeft.',
   'Oud-commissaris Wim Raaf leidt het geheel vanuit een tuinhuis in Abcoude. Hij draagt nog altijd het horloge dat hij bij zijn afscheid kreeg, als herinnering aan de kant waar hij vroeger stond.',
   'Wie bij de Nachtwacht hoort, krijgt veel minder hitte en een lagere borg. De mensen die jou moeten oppakken, werken voor jou.']},
 tafel:{wijk:'De grachtengordel en Den Haag',sinds:'1987',baas:'Maurits van der Kraan',motto:'Ons geld glimt.',
  story:[
   'Aan de Ronde Tafel zitten mensen die je nooit in een steeg tegenkomt: bankiers, havenbaronnen en een minister die al drie kabinetten heeft overleefd.',
   'Ze plegen geen overvallen. Ze kopen panden, bedrijven en vergunningen, en betalen met geld dat zo vaak is gewassen dat het glimt.',
   'Maurits van der Kraan houdt kantoor in een grachtenpand aan de Herengracht. Zijn vergaderingen beginnen met champagne en eindigen met een handtekening waar half Nederland nooit iets van hoort.',
   'Wie aan deze tafel mag aanschuiven, ziet zijn zaken veel meer opleveren. Het geld vindt vanzelf de weg terug.']},
 erven:{wijk:'Van Amsterdam tot Palermo, Marseille en Zürich',sinds:'1891',baas:'Donna Livia Morano, De Weduwe',motto:'Twaalf stoelen. Nooit dertien.',
  story:[
   'De oudste familie van Europa. De Morano\'s smokkelden al toen de rest van de stad nog met paard en wagen reed, en ze zijn er nog als iedereen die jij kent allang vergeten is.',
   'Aan hun tafel staan twaalf stoelen. Er komt er pas een vrij als iemand overlijdt, en zelfs dan wordt er jaren gepraat voordat er iemand mag gaan zitten.',
   'Sinds de dood van haar man leidt Donna Livia Morano de familie. In de stad heet ze gewoon De Weduwe. Niemand heeft haar ooit zien lachen, en niemand heeft haar ooit iets zien vergeten.',
   'Wie hier binnenkomt, staat aan de top: meer XP, meer inkomen, kortere wachttijden. En een stoel die je nooit meer kwijtraakt, zolang je leeft.']}
};
const RANK_LORE={
 Rookie:'Je hebt niks: een paar tientjes, een open rugzak en een stad vol kansen.',
 Straatschoffie:'De buurt kent je gezicht. De politie nog niet.',
 Loopjongen:'Je loopt voor mensen die zelf niet meer lopen. De eerste familie ziet je staan.',
 Dief:'Je pakt wat niet van jou is, en je wordt er elke dag beter in.',
 Boef:'Je naam valt in de verkeerde cafés. Tijd voor auto\'s en grotere klussen.',
 Gangster:'Zware klussen, een wapen op zak en een familie die je bij naam kent.',
 Soldaat:'Je doet het werk waar anderen voor terugdeinzen. De familie rekent op je.',
 Huurmoordenaar:'Een envelop met een naam en een bedrag. Je werkt alleen, en je werkt schoon.',
 Capo:'Je hebt je eigen mensen. Zij doen het werk, jij houdt de touwtjes vast.',
 Onderbaas:'De rechterhand van de top. Wat jij zegt, gebeurt.',
 Consigliere:'De peetvaders vragen jou om raad. Jij wint oorlogen zonder één schot.',
 Peetvader:'De stad is van jou. Iedereen kent je naam, niemand zegt hem hardop.'
};
const FAMRANK_LORE={
 Aspirant:'Je bent binnen, maar niemand vertrouwt je nog.',
 Lid:'Je hoort erbij en mag mee aan tafel. Achteraan.',
 Vertrouweling:'Je hoort dingen die de buitenwereld nooit hoort.',
 Luitenant:'Je hebt je eigen mensen binnen de familie.',
 Rechterhand:'Je staat naast de baas. Wat hij hoort, hoor jij ook.',
 Erelid:'Je naam staat in het familieboek. Voor altijd.',
 Onderbaas:'Je hebt slagen gewonnen voor de familie. Alleen de baas staat nog boven je.',
 Baas:'Je leidt de familie. Iedereen aan tafel werkt nu voor jou.',
 Familiehoofd:'Je leidt de familie. Iedereen aan tafel werkt nu voor jou.',
 Hoofd:'Je leidt de familie. Iedereen aan tafel werkt nu voor jou.'
};
