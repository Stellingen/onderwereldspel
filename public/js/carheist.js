// Auto's tekenen (zijaanzicht per carrosserie) en de minigame "Contact maken".
// Moeilijker model = langere reeks, minder tijd per pijl, geen missers; vanaf 'moeilijk' moet je de reeks onthouden.
// Carrosserieën in echte maten (meter): x vanaf de achterbumper, y omhoog vanaf de grond. Bij het laden omgerekend naar de
// tekening (200 breed, grond op y=68), elke auto zo groot mogelijk binnen 188×60. Voorkant rechts.
// Algemene vormen per klasse, bewust geen nagetekende merkontwerpen, grilles of logo's. Varianten (base) wisselen velgen en details.
// L/H: lengte/hoogte, wb: wielbasis, fo: overhang voor, wd: wieldiameter, cl: onderrand carrosserie, bl: gordellijn (lichtstreep).
// p: carrosserie met {F}/{B} voor de wielkasten, win: ramen, dlo: zwarte raampartij (zwevend dak), k/kc/c/bc: zwart / zwart binnen
// de lak / chroom / lakkleur, ln/cr: naden en lichtlijnen, hd: handgrepen (hs f = verzonken, c = chroom), mr: spiegel,
// hl/tl: koplamp/achterlicht, ex: uitlaat [x,y,aantal], rs: velg (5 y m t s x o c), rf: velgmaat, rc: velgkleur (s d g c),
// cal: remklauw, two: contrasterend dak vanaf hoogte, low: donker onderstuk, sp: reservewiel, clad: zwarte wielkastranden,
// flare: brede wielkasten, ww: witte wangen, tr: 'c' = chromen raamlijst. ak/akc/ac vullen k/kc/c van de basis aan.
const CAR_G=68;
const CAR_BODIES={
 city:{L:3.6,H:1.5,wb:2.4,fo:.67,wd:.58,cl:.18,bl:.98,
  p:'M .1 .18 L 0 .32 L 0 .62 Q 0 .82 .05 .86 L .18 1.32 Q .22 1.45 .36 1.47 L 2.0 1.5 Q 2.2 1.5 2.33 1.42 L 2.95 .99 Q 3.3 .93 3.5 .84 Q 3.6 .78 3.6 .62 L 3.6 .3 Q 3.59 .2 3.5 .18 {F} {B} Z',
  win:['M 2.86 1.0 L 2.33 1.38 Q 2.28 1.42 2.2 1.42 L 1.62 1.42 L 1.62 1.02 Z','M 1.53 1.42 L .78 1.42 L .74 1.05 L 1.53 1.03 Z','M .68 1.42 L .4 1.42 Q .3 1.42 .27 1.34 L .2 1.1 Q .19 1.06 .24 1.06 L .66 1.05 Z'],
  k:['M 1.53 1.42 L 1.62 1.42 L 1.62 1.02 L 1.53 1.03 Z'],
  ln:['M 2.6 1.0 Q 2.55 .6 2.57 .18','M 1.575 1.02 L 1.575 .18','M .74 1.05 L .74 .64 Q .88 .52 .9 .18','M 3.3 .42 Q 1.8 .4 .3 .42'],
  cr:['M 3.45 .88 Q 1.8 .93 .08 .86'],hd:[[2.2,.92],[1.2,.93]],mr:[2.84,1.05],
  hl:'M 3.32 .9 Q 3.5 .86 3.58 .76 L 3.5 .72 Q 3.38 .78 3.28 .86 Z',tl:'M .04 .86 L .155 1.25 L .2 1.24 L .11 .84 Z',
  ex:[.38,.22,1],rs:'5',rf:.6,rc:'s'},
 city2:{base:'city',rs:'s',rf:.64,clad:1,ak:['M .5 1.52 L 2.0 1.53 L 2.0 1.56 L .5 1.55 Z'],akc:['M -1 .34 L 6 .34 L 6 -1 L -1 -1 Z']},
 city3:{base:'city',two:1.42,rs:'m',rf:.62},

 hatch:{L:4.06,H:1.44,wb:2.56,fo:.8,wd:.62,cl:.18,bl:.99,
  p:'M .1 .18 L 0 .34 L 0 .62 Q 0 .8 .06 .84 L .24 1.3 Q .3 1.4 .48 1.41 L 2.25 1.44 Q 2.42 1.44 2.52 1.38 L 3.1 .98 Q 3.55 .93 3.9 .8 Q 4.06 .74 4.06 .6 L 4.06 .32 Q 4.05 .2 3.94 .18 {F} {B} Z',
  win:['M 3.0 .99 L 2.5 1.33 Q 2.45 1.37 2.38 1.37 L 1.72 1.37 L 1.72 1.01 Z','M 1.63 1.37 L .9 1.36 Q .74 1.35 .66 1.27 L .52 1.12 L .52 1.05 L 1.63 1.02 Z'],
  k:['M 1.63 1.37 L 1.72 1.37 L 1.72 1.01 L 1.63 1.02 Z','M .93 1.36 L .97 1.36 L .97 1.04 L .93 1.04 Z'],
  ln:['M 2.86 .99 Q 2.8 .6 2.84 .18','M 1.675 1.02 L 1.675 .18','M .95 1.04 L .95 .7 Q 1.06 .56 1.08 .18','M 3.6 .42 Q 2 .4 .4 .44'],
  cr:['M 3.9 .84 Q 2 .91 .06 .83'],hd:[[2.45,.92],[1.35,.93]],mr:[2.95,1.05],
  hl:'M 3.6 .9 Q 3.85 .86 4.0 .76 L 3.92 .7 Q 3.75 .78 3.56 .84 Z',tl:'M .02 .82 Q .04 .89 .1 .9 L .5 .93 L .48 .86 L .04 .76 Z',
  ex:[.36,.22,1],rs:'5',rf:.6,rc:'s'},
 hatch2:{base:'hatch',rs:'y',rc:'d'},
 hatch3:{base:'hatch',two:1.37,rs:'m'},
 hatch4:{base:'hatch',rs:'t',rc:'d',rf:.64},
 hatch5:{base:'hatch',rs:'m',tr:'c'},

 hot:{L:4.29,H:1.45,wb:2.63,fo:.87,wd:.64,cl:.16,bl:.99,
  p:'M .1 .16 L 0 .3 L 0 .62 Q 0 .8 .07 .84 L .26 1.3 Q .32 1.4 .52 1.42 L 2.35 1.45 Q 2.55 1.45 2.66 1.38 L 3.22 .98 Q 3.7 .92 4.08 .8 Q 4.29 .74 4.29 .58 L 4.29 .3 Q 4.28 .17 4.16 .16 {F} {B} Z',
  win:['M 3.12 .99 L 2.62 1.33 Q 2.57 1.38 2.48 1.38 L 1.8 1.38 L 1.8 1.01 Z','M 1.71 1.38 L .96 1.37 Q .8 1.36 .72 1.28 L .58 1.12 L .58 1.05 L 1.71 1.02 Z'],
  k:['M 1.71 1.38 L 1.8 1.38 L 1.8 1.01 L 1.71 1.02 Z','M .98 1.37 L 1.02 1.37 L 1.02 1.04 L .98 1.04 Z','M .25 1.32 Q .3 1.43 .52 1.44 L .95 1.45 L .95 1.48 L .48 1.47 Q .26 1.46 .19 1.35 Z','M 3.95 .16 L 4.27 .16 L 4.27 .2 L 3.95 .2 Z','M 1.18 .16 L 3.03 .16 L 3.03 .2 L 1.18 .2 Z'],
  kc:['M 4.0 .3 L 4.4 .3 L 4.4 .44 L 4.04 .46 Z'],
  ln:['M 2.98 .99 Q 2.92 .6 2.96 .16','M 1.755 1.02 L 1.755 .16','M 1.0 1.04 L 1.0 .72 Q 1.14 .57 1.16 .16','M 3.9 .4 Q 2 .38 .4 .42'],
  cr:['M 4.1 .84 Q 2 .91 .06 .82'],hd:[[2.6,.92],[1.4,.93]],mr:[3.07,1.05],
  hl:'M 3.76 .9 Q 4.05 .86 4.22 .74 L 4.12 .68 Q 3.94 .77 3.72 .84 Z',tl:'M .02 .8 Q .04 .88 .12 .89 L .56 .92 L .54 .85 L .05 .74 Z',
  ex:[.34,.2,2],rs:'y',rf:.66,rc:'s',cal:'#c81e2c'},
 hot2:{base:'hot',rs:'m',rc:'d',cal:'#2f6fe0'},
 hot3:{base:'hot',rs:'t',rc:'g',cal:'#c06a2b'},
 hot4:{base:'hot',two:1.38,rs:'x',rc:'s',cal:null,hl:'M 3.82 .88 Q 4.06 .88 4.18 .8 Q 4.18 .72 4.04 .72 Q 3.88 .74 3.82 .8 Q 3.8 .86 3.82 .88 Z'},

 sedan:{L:4.79,H:1.43,wb:2.86,fo:.86,wd:.68,cl:.17,bl:.99,
  p:'M .12 .17 L 0 .32 L 0 .62 Q 0 .84 .1 .9 L .2 .96 Q .3 1.0 .5 1.0 L .82 1.01 Q 1.0 1.02 1.12 1.08 L 1.52 1.36 Q 1.62 1.43 1.86 1.43 L 2.42 1.43 Q 2.62 1.43 2.74 1.36 L 3.32 .98 Q 3.9 .9 4.5 .76 Q 4.79 .7 4.79 .55 L 4.79 .32 Q 4.78 .18 4.66 .17 {F} {B} Z',
  win:['M 3.2 .99 L 2.72 1.32 Q 2.66 1.36 2.56 1.36 L 2.06 1.36 L 2.06 1.01 Z','M 1.97 1.36 L 1.62 1.36 Q 1.52 1.35 1.46 1.28 L 1.22 1.06 L 1.97 1.02 Z'],
  k:['M 1.97 1.36 L 2.06 1.36 L 2.06 1.01 L 1.97 1.02 Z'],
  ln:['M 3.36 .98 Q 3.33 .6 3.36 .17','M 2.015 1.02 L 2.015 .17','M 1.24 1.06 L 1.24 .78 Q 1.5 .62 1.52 .17','M 4.3 .4 Q 2.4 .37 .5 .42'],
  cr:['M 4.55 .82 Q 2.4 .9 .05 .86'],hd:[[2.85,.92],[1.75,.94]],mr:[3.2,1.06],
  hl:'M 4.2 .86 Q 4.6 .8 4.74 .68 L 4.62 .64 Q 4.42 .72 4.16 .8 Z',tl:'M .02 .82 Q .06 .9 .18 .92 L .62 .95 L .6 .86 L .04 .76 Z',
  ex:[.34,.21,2],rs:'y',rf:.64,rc:'s'},
 sedan2:{base:'sedan',rc:'d',cal:'#c81e2c',ex:[.36,.21,4],ak:['M .3 1.0 L .72 1.02 L .72 1.05 L .32 1.03 Z','M 4.4 .17 L 4.77 .17 L 4.77 .2 L 4.4 .2 Z']},
 sedan3:{base:'sedan',rs:'m',cal:'#c81e2c',ex:[.36,.21,4],tr:'c',flare:1},

 estate:{L:4.9,H:1.47,wb:2.85,fo:.92,wd:.68,cl:.17,bl:.99,
  p:'M .12 .17 L 0 .32 L 0 .64 Q 0 .84 .08 .88 L .2 1.3 Q .26 1.44 .44 1.45 L 2.5 1.47 Q 2.7 1.47 2.82 1.4 L 3.42 .99 Q 4.0 .92 4.6 .78 Q 4.9 .72 4.9 .56 L 4.9 .32 Q 4.89 .18 4.77 .17 {F} {B} Z',
  win:['M 3.3 1.0 L 2.8 1.35 Q 2.74 1.39 2.64 1.39 L 2.12 1.39 L 2.12 1.02 Z','M 2.03 1.39 L 1.32 1.39 L 1.3 1.03 L 2.03 1.02 Z','M 1.22 1.39 L .5 1.39 Q .38 1.39 .34 1.3 L .24 1.1 Q .22 1.05 .3 1.05 L 1.22 1.03 Z'],
  k:['M 2.03 1.39 L 2.12 1.39 L 2.12 1.02 L 2.03 1.02 Z','M .6 1.48 L 2.4 1.5 L 2.4 1.53 L .6 1.51 Z'],
  ln:['M 3.44 .99 Q 3.4 .6 3.43 .17','M 2.075 1.02 L 2.075 .17','M 1.3 1.03 L 1.3 .78 Q 1.52 .62 1.56 .17','M 4.4 .4 Q 2.4 .37 .5 .42'],
  cr:['M 4.65 .82 Q 2.4 .9 .05 .86'],hd:[[2.9,.93],[1.8,.94]],mr:[3.3,1.07],
  hl:'M 4.3 .86 Q 4.7 .8 4.85 .68 L 4.72 .64 Q 4.5 .72 4.26 .8 Z',tl:'M .03 .86 L .1 1.1 L .15 1.1 L .13 .9 L .5 .93 L .48 .86 L .05 .78 Z',
  ex:[.34,.21,2],rs:'5',rf:.62,rc:'s'},
 estate2:{base:'estate',rs:'x',tr:'c'},
 estate3:{base:'estate',rs:'y',rc:'d',cal:'#c81e2c',ex:[.36,.21,4],flare:1,ak:['M 4.5 .17 L 4.88 .17 L 4.88 .2 L 4.5 .2 Z']},

 liftback:{L:4.97,H:1.44,wb:2.96,fo:.97,wd:.7,cl:.16,bl:.97,
  p:'M .12 .16 L 0 .3 L 0 .64 Q 0 .86 .12 .9 L .3 .95 Q .42 .98 .6 .99 Q 1.0 1.04 1.4 1.22 Q 1.8 1.42 2.3 1.44 L 2.6 1.44 Q 2.84 1.43 3.0 1.32 L 3.5 .96 Q 4.1 .86 4.7 .72 Q 4.97 .66 4.97 .52 L 4.97 .3 Q 4.96 .17 4.84 .16 {F} {B} Z',
  win:['M 3.38 .97 L 2.96 1.3 Q 2.88 1.36 2.76 1.37 L 2.26 1.37 L 2.26 .99 Z','M 2.17 1.37 L 1.95 1.37 Q 1.7 1.34 1.48 1.2 L 1.2 1.02 L 1.2 1.0 L 2.17 .99 Z'],
  k:['M 2.17 1.37 L 2.26 1.37 L 2.26 .99 L 2.17 .99 Z','M 1.47 1.2 L 1.51 1.22 L 1.51 1.0 L 1.47 1.0 Z'],
  ln:['M 3.52 .96 Q 3.5 .6 3.54 .16','M 2.215 .99 L 2.215 .16','M 1.49 1.0 L 1.49 .78 Q 1.48 .6 1.5 .16','M 4.5 .38 Q 2.5 .35 .5 .4'],
  cr:['M 4.75 .78 Q 2.5 .88 .05 .88'],hd:[[2.95,.9],[1.85,.92]],hs:'f',mr:[3.4,1.03],
  hl:'M 4.4 .8 Q 4.8 .74 4.93 .62 L 4.8 .6 Q 4.6 .68 4.36 .75 Z',tl:'M .02 .84 Q .06 .9 .16 .92 L .6 .97 L .6 .92 L .04 .8 Z',
  rs:'t',rf:.66,rc:'s'},
 liftback2:{base:'liftback',rs:'y',rc:'d',cal:'#d9c42a',ak:['M 4.55 .16 L 4.95 .16 L 4.95 .19 L 4.55 .19 Z']},

 coupe:{L:4.27,H:1.31,wb:2.58,fo:.83,wd:.63,cl:.14,bl:.92,
  p:'M .1 .14 L 0 .28 L 0 .6 Q 0 .8 .1 .84 L .22 .88 Q .32 .9 .5 .9 Q .78 .94 .98 1.06 Q 1.3 1.27 1.75 1.31 L 2.1 1.31 Q 2.3 1.3 2.44 1.2 L 2.92 .9 Q 3.6 .84 4.08 .74 Q 4.27 .68 4.27 .54 L 4.27 .28 Q 4.26 .15 4.15 .14 {F} {B} Z',
  win:['M 2.82 .91 L 2.42 1.19 Q 2.34 1.25 2.22 1.25 L 1.6 1.25 L 1.52 .94 Z','M 1.48 1.25 Q 1.26 1.22 1.1 1.1 L 1.0 1.0 Q .98 .96 1.04 .96 L 1.44 .94 Z'],
  ln:['M 2.96 .9 Q 2.92 .55 2.96 .14','M 1.5 .94 Q 1.46 .6 1.5 .14','M 3.8 .36 Q 2.2 .33 .4 .38'],
  cr:['M 4.05 .78 Q 2.2 .85 .05 .8'],hd:[[1.95,.84]],mr:[2.82,.96],
  hl:'M 3.74 .8 Q 4.05 .76 4.22 .64 L 4.1 .6 Q 3.92 .69 3.7 .75 Z',tl:'M .02 .78 Q .06 .86 .16 .87 L .5 .9 L .48 .84 L .04 .72 Z',
  ex:[.3,.19,2],rs:'5',rf:.66,rc:'d',cal:'#c81e2c'},

 sport:{L:4.52,H:1.3,wb:2.45,fo:.98,wd:.7,cl:.13,bl:.91,
  p:'M .12 .13 L 0 .28 L 0 .58 Q 0 .74 .08 .8 L .24 .88 Q .36 .92 .5 .94 Q 1.0 1.08 1.5 1.22 Q 1.9 1.3 2.3 1.3 Q 2.55 1.29 2.7 1.18 L 3.1 .9 Q 3.8 .86 4.2 .8 Q 4.5 .74 4.52 .5 L 4.52 .26 Q 4.51 .14 4.4 .13 {F} {B} Z',
  win:['M 3.0 .91 L 2.68 1.16 Q 2.58 1.23 2.44 1.24 L 1.92 1.24 L 1.86 .93 Z','M 1.82 1.24 Q 1.5 1.2 1.25 1.06 L 1.16 1.0 Q 1.14 .96 1.2 .96 L 1.78 .93 Z'],
  kc:['M 1.55 .72 Q 1.68 .75 1.8 .76 L 1.78 .62 Q 1.66 .6 1.56 .6 Z'],
  ln:['M 3.06 .9 Q 3.02 .55 3.06 .13','M 1.84 .93 Q 1.8 .6 1.84 .13','M 4.0 .36 Q 2.2 .33 .4 .38'],
  cr:['M 4.3 .79 Q 3.4 .7 2.6 .68 Q 1.6 .68 .5 .86'],hd:[[2.3,.84]],hs:'f',mr:[3.0,.96],
  hl:'M 4.12 .83 Q 4.36 .82 4.47 .72 Q 4.44 .64 4.3 .66 Q 4.14 .7 4.08 .78 Q 4.08 .82 4.12 .83 Z',tl:'M .02 .76 Q .1 .86 .3 .89 L .5 .92 L .5 .88 L .04 .7 Z',
  ex:[.32,.18,2],rs:'5',rf:.68,rc:'s',cal:'#c81e2c'},

 gt:{L:4.8,H:1.33,wb:2.82,fo:.98,wd:.71,cl:.14,bl:.93,
  p:'M .12 .14 L 0 .3 L 0 .6 Q 0 .78 .1 .84 L .26 .9 Q .4 .94 .6 .95 Q 1.0 1.0 1.3 1.14 Q 1.7 1.3 2.1 1.33 L 2.4 1.33 Q 2.6 1.32 2.74 1.22 L 3.12 .92 Q 3.9 .86 4.5 .76 Q 4.8 .7 4.8 .54 L 4.8 .3 Q 4.79 .15 4.67 .14 {F} {B} Z',
  win:['M 3.02 .93 L 2.72 1.18 Q 2.62 1.26 2.48 1.27 L 1.95 1.27 L 1.88 .95 Z','M 1.84 1.27 Q 1.5 1.24 1.28 1.1 L 1.18 1.02 Q 1.16 .98 1.22 .98 L 1.8 .95 Z'],tr:'c',
  k:['M 3.14 .6 L 3.38 .62 L 3.37 .56 L 3.14 .54 Z'],
  ln:['M 3.1 .92 Q 3.06 .55 3.1 .14','M 1.86 .95 Q 1.82 .6 1.86 .14','M 4.3 .38 Q 2.4 .34 .5 .4'],
  cr:['M 4.55 .8 Q 2.4 .74 .05 .84'],hd:[[2.35,.86]],hs:'f',mr:[3.02,.98],
  hl:'M 4.25 .83 Q 4.62 .78 4.76 .66 L 4.64 .62 Q 4.44 .71 4.2 .78 Z',tl:'M .02 .8 Q .08 .88 .22 .9 L .58 .95 L .56 .9 L .04 .74 Z',
  ex:[.36,.19,4],rs:'m',rf:.68,rc:'s'},
 gt2:{base:'gt',rs:'x',rc:'c',k:[],c:['M 3.14 .6 L 3.38 .62 L 3.37 .56 L 3.14 .54 Z']},
 gt3:{base:'gt',rs:'y',rc:'d',cal:'#c81e2c',tr:null,ak:['M 4.4 .14 L 4.78 .14 L 4.78 .17 L 4.4 .17 Z']},

 suv:{L:4.92,H:1.76,wb:2.97,fo:.95,wd:.78,cl:.26,bl:1.19,
  p:'M .14 .26 L 0 .4 L 0 .84 Q 0 1.06 .08 1.1 L .2 1.6 Q .26 1.72 .44 1.73 L 2.6 1.76 Q 2.8 1.76 2.92 1.68 L 3.5 1.18 Q 4.2 1.14 4.75 1.04 Q 4.92 1.0 4.92 .84 L 4.92 .42 Q 4.91 .27 4.78 .26 {F} {B} Z',
  dlo:'M 3.42 1.17 L 2.92 1.64 Q 2.86 1.7 2.74 1.7 L .5 1.7 Q .36 1.7 .32 1.6 L .2 1.28 Q .19 1.22 .28 1.22 Z',
  win:['M 3.38 1.19 L 2.9 1.62 Q 2.84 1.68 2.74 1.68 L 2.16 1.68 L 2.16 1.2 Z','M 2.07 1.68 L 1.36 1.68 L 1.32 1.22 L 2.07 1.21 Z','M 1.27 1.68 L .5 1.68 Q .38 1.68 .34 1.58 L .24 1.3 Q .22 1.24 .3 1.24 L 1.25 1.22 Z'],
  k:['M .7 1.77 L 2.5 1.79 L 2.5 1.82 L .7 1.8 Z','M 1.46 .26 L 3.5 .26 L 3.5 .3 L 1.46 .3 Z'],
  ln:['M 3.52 1.18 Q 3.48 .7 3.52 .26','M 2.115 1.21 L 2.115 .26','M 1.32 1.22 L 1.32 .98 Q 1.48 .78 1.5 .26','M 4.5 .56 Q 2.5 .53 .5 .58'],
  cr:['M 4.75 1.06 Q 2.5 1.13 .05 1.08'],hd:[[2.95,1.12],[1.8,1.13]],mr:[3.4,1.26],
  hl:'M 4.5 1.08 Q 4.8 1.02 4.9 .92 L 4.8 .88 Q 4.62 .96 4.46 1.02 Z',tl:'M .02 1.06 Q .06 1.14 .2 1.15 L .5 1.17 L .48 1.1 L .04 .98 Z',
  ex:[.4,.29,4],rs:'y',rf:.64,rc:'s'},
 suv2:{base:'suv',dlo:null,rs:'5',rc:'d',cal:'#2f6fe0',
  k:['M 2.07 1.68 L 2.16 1.68 L 2.16 1.2 L 2.07 1.21 Z','M .14 1.5 Q .22 1.72 .44 1.73 L .9 1.74 L .9 1.78 L .42 1.77 Q .18 1.75 .1 1.52 Z','M 1.46 .26 L 3.5 .26 L 3.5 .3 L 1.46 .3 Z']},

 cross:{L:4.73,H:1.62,wb:2.81,fo:.92,wd:.74,cl:.22,bl:1.09,
  p:'M .14 .22 L 0 .36 L 0 .8 Q 0 1.0 .1 1.04 L .3 1.08 Q .44 1.12 .6 1.16 Q .95 1.4 1.4 1.58 Q 1.7 1.62 2.2 1.62 L 2.5 1.62 Q 2.72 1.61 2.84 1.52 L 3.38 1.08 Q 4.0 1.03 4.55 .94 Q 4.73 .9 4.73 .76 L 4.73 .38 Q 4.72 .23 4.6 .22 {F} {B} Z',
  win:['M 3.26 1.09 L 2.82 1.5 Q 2.75 1.55 2.65 1.55 L 2.1 1.55 L 2.1 1.1 Z','M 2.01 1.55 L 1.55 1.55 Q 1.3 1.52 1.08 1.36 L .86 1.17 L .86 1.14 L 2.01 1.11 Z'],
  k:['M 2.01 1.55 L 2.1 1.55 L 2.1 1.1 L 2.01 1.11 Z','M 1.26 1.44 L 1.3 1.46 L 1.3 1.13 L 1.26 1.13 Z','M 1.44 .22 L 3.36 .22 L 3.36 .26 L 1.44 .26 Z'],
  ln:['M 3.36 1.08 Q 3.32 .65 3.36 .22','M 2.055 1.11 L 2.055 .22','M 1.28 1.13 L 1.28 .9 Q 1.44 .72 1.46 .22','M 4.3 .5 Q 2.4 .47 .5 .52'],
  cr:['M 4.55 .97 Q 2.4 1.04 .06 .98'],hd:[[2.85,1.02],[1.75,1.03]],mr:[3.28,1.15],
  hl:'M 4.3 .98 Q 4.62 .93 4.7 .84 L 4.6 .8 Q 4.44 .88 4.26 .93 Z',tl:'M .02 .98 Q .08 1.05 .25 1.07 L .62 1.12 L .6 1.06 L .04 .92 Z',
  ex:[.38,.25,4],rs:'5',rf:.68,rc:'d',cal:'#c81e2c'},

 supersuv:{L:5.11,H:1.64,wb:3.0,fo:1.0,wd:.82,cl:.25,bl:1.1,
  p:'M .14 .25 L 0 .4 L 0 .86 L .06 1.02 L .32 1.08 L .9 1.36 L 1.3 1.56 Q 1.42 1.62 1.6 1.63 L 2.7 1.64 L 3.0 1.56 L 3.62 1.08 L 4.4 1.02 L 4.85 .94 L 5.06 .82 L 5.11 .66 L 5.1 .42 L 5.0 .28 L 4.94 .25 {F} {B} Z',
  dlo:'M 3.6 1.08 L 2.98 1.58 L 2.84 1.6 L 1.6 1.6 L 1.4 1.56 L 1.0 1.34 L .9 1.22 L .96 1.16 Z',
  win:['M 3.48 1.1 L 2.94 1.54 L 2.84 1.56 L 2.22 1.56 L 2.22 1.11 Z','M 2.12 1.56 L 1.62 1.56 L 1.42 1.52 L 1.06 1.32 L .98 1.2 L 1.04 1.17 L 2.12 1.12 Z'],
  kc:['M 3.55 .25 L 3.59 .7 L 3.75 .9 L 4.47 .9 L 4.63 .7 L 4.67 .25 Z','M .55 .25 L .59 .7 L .75 .9 L 1.47 .9 L 1.63 .7 L 1.67 .25 Z','M 1.6 .25 L 3.6 .25 L 3.6 .34 L 1.6 .36 Z'],
  k:['M 4.85 .34 L 5.1 .4 L 5.1 .6 L 4.88 .56 Z'],
  ln:['M 3.48 1.1 L 3.44 .7 L 3.46 .36','M 2.17 1.12 L 2.17 .36','M 1.75 1.13 L 1.75 .36','M 4.6 .6 L 3.8 .58','M 3.4 .56 L 1.8 .58'],
  cr:['M 4.9 .9 L 4.0 1.0 L 2.6 1.04 L 1.4 1.06 L .1 .98'],hd:[[2.95,1.0],[1.85,1.02]],hs:'f',mr:[3.5,1.16],
  hl:'M 4.5 1.0 L 4.95 .9 L 5.05 .82 L 4.6 .9 Z',tl:'M .02 .94 L .08 1.02 L .4 1.08 L .4 1.04 L .04 .9 Z',
  ex:[.36,.29,4],rs:'t',rf:.72,rc:'d',cal:'#e8b31c'},

 offroad:{L:4.87,H:1.97,wb:2.89,fo:.86,wd:.82,cl:.3,bl:1.28,
  p:'M .1 .3 L 0 .42 L 0 1.84 Q 0 1.95 .1 1.96 L 3.12 1.97 Q 3.22 1.97 3.26 1.9 L 3.44 1.3 L 4.62 1.22 Q 4.76 1.21 4.8 1.12 L 4.86 .9 L 4.87 .42 Q 4.86 .31 4.78 .3 {F} {B} Z',
  win:['M 3.36 1.3 L 3.22 1.82 Q 3.2 1.86 3.15 1.86 L 2.66 1.86 L 2.66 1.3 Z','M 2.56 1.86 L 1.84 1.86 L 1.84 1.3 L 2.56 1.3 Z','M 1.74 1.86 L .2 1.86 Q .12 1.86 .12 1.78 L .12 1.33 Q .12 1.3 .16 1.3 L 1.74 1.3 Z'],
  sp:'M 0 1.4 L -.2 1.4 Q -.24 1.4 -.24 1.36 L -.24 .76 Q -.24 .72 -.2 .72 L 0 .72 Z',
  kc:['M 3.42 .3 L 3.46 .9 L 3.56 .98 L 4.46 .98 L 4.56 .9 L 4.6 .3 Z','M .53 .3 L .57 .9 L .67 .98 L 1.57 .98 L 1.67 .9 L 1.71 .3 Z','M .06 1.0 L 4.8 1.0 L 4.8 1.07 L .06 1.07 Z'],
  k:['M .3 2.0 L 3.0 2.0 L 3.0 2.04 L .3 2.04 Z','M 1.72 .27 L 3.4 .27 L 3.4 .32 L 1.72 .32 Z','M 4.8 .4 L 4.9 .4 L 4.9 .76 L 4.8 .76 Z'],
  ln:['M 3.36 1.29 L 3.36 .32','M 2.61 1.3 L 2.61 .32','M 1.79 1.29 L 1.79 .32'],
  cr:['M .02 1.27 L 3.42 1.27','M 3.5 1.25 L 4.78 1.19'],hd:[[3.1,1.17],[2.3,1.17]],mr:[3.38,1.36],
  hl:'M 4.72 1.18 Q 4.86 1.16 4.87 1.06 L 4.86 .98 L 4.74 1.0 Z',tl:'M .01 1.0 L .07 1.0 L .07 1.3 L .01 1.3 Z',
  ex:[.42,.33,1],rs:'o',rf:.6,rc:'d'},

 luxsuv:{L:5.34,H:1.84,wb:3.3,fo:1.04,wd:.84,cl:.26,bl:1.27,
  p:'M .12 .26 L 0 .4 L 0 1.08 Q 0 1.18 .06 1.22 L .12 1.7 Q .16 1.82 .32 1.83 L 3.3 1.84 Q 3.48 1.84 3.58 1.76 L 4.04 1.27 L 5.0 1.22 Q 5.24 1.2 5.3 1.1 L 5.34 .94 L 5.34 .42 Q 5.33 .27 5.2 .26 {F} {B} Z',
  win:['M 3.92 1.27 L 3.56 1.7 Q 3.52 1.75 3.44 1.75 L 2.86 1.75 L 2.86 1.28 Z','M 2.76 1.75 L 1.66 1.75 L 1.66 1.28 L 2.76 1.28 Z','M 1.56 1.75 L .4 1.75 Q .3 1.75 .27 1.66 L .2 1.32 Q .19 1.28 .25 1.28 L 1.56 1.28 Z'],tr:'c',
  c:['M .2 1.245 L 4.0 1.255 L 4.0 1.28 L .2 1.27 Z','M 1.5 .3 L 3.75 .3 L 3.75 .34 L 1.5 .34 Z','M 5.3 .5 L 5.35 .5 L 5.35 1.06 L 5.3 1.06 Z'],
  ln:['M 3.82 1.26 Q 3.78 .7 3.82 .26','M 2.81 1.28 L 2.81 .26','M 1.62 1.27 L 1.62 .26','M 5.0 .58 Q 2.7 .55 .5 .6'],
  cr:['M 5.25 1.14 Q 2.7 1.2 .04 1.18'],hd:[[3.4,1.16],[2.2,1.16]],hs:'c',mr:[3.92,1.33],
  hl:'M 5.0 1.18 Q 5.28 1.14 5.33 1.02 L 5.22 1.0 Q 5.1 1.08 4.96 1.12 Z',tl:'M .01 1.0 Q .02 1.14 .08 1.2 L .14 1.2 L .1 .88 L .01 .86 Z',
  ex:[.36,.3,2],rs:'m',rf:.66,rc:'c'},

 luxury:{L:5.29,H:1.5,wb:3.21,fo:.95,wd:.72,cl:.17,bl:1.05,
  p:'M .12 .17 L 0 .32 L 0 .66 Q 0 .88 .1 .93 L .24 1.0 Q .36 1.04 .56 1.05 L .9 1.06 Q 1.1 1.07 1.24 1.14 L 1.7 1.42 Q 1.82 1.5 2.08 1.5 L 2.92 1.5 Q 3.12 1.5 3.26 1.42 L 3.82 1.04 Q 4.4 .98 4.98 .86 Q 5.29 .8 5.29 .62 L 5.29 .34 Q 5.28 .19 5.15 .17 {F} {B} Z',
  win:['M 3.7 1.05 L 3.24 1.38 Q 3.17 1.42 3.06 1.42 L 2.42 1.42 L 2.42 1.07 Z','M 2.33 1.42 L 1.84 1.42 Q 1.74 1.41 1.66 1.34 L 1.34 1.1 L 2.33 1.08 Z'],tr:'c',
  k:['M 2.33 1.42 L 2.42 1.42 L 2.42 1.07 L 2.33 1.08 Z'],c:['M 1.6 .2 L 3.86 .2 L 3.86 .24 L 1.6 .24 Z'],
  ln:['M 3.86 1.04 Q 3.82 .6 3.86 .17','M 2.375 1.08 L 2.375 .17','M 1.36 1.1 L 1.36 .84 Q 1.56 .66 1.6 .17','M 4.8 .42 Q 2.6 .39 .5 .44'],
  cr:['M 5.05 .9 Q 2.6 .98 .05 .94'],hd:[[3.2,1.0],[2.0,1.01]],hs:'c',mr:[3.72,1.12],
  hl:'M 4.65 .92 Q 5.1 .86 5.24 .74 L 5.12 .7 Q 4.9 .79 4.6 .86 Z',tl:'M .02 .88 Q .08 .96 .22 .98 L .66 1.02 L .64 .95 L .04 .8 Z',
  ex:[.36,.21,2],rs:'x',rf:.64,rc:'c'},

 super:{L:4.52,H:1.17,wb:2.62,fo:1.0,wd:.7,cl:.12,bl:.82,
  p:'M .1 .12 L 0 .26 L 0 .62 Q 0 .78 .08 .84 L .3 .92 L .6 .94 Q 1.2 .98 1.6 1.08 Q 1.9 1.16 2.2 1.17 L 2.5 1.17 Q 2.66 1.16 2.78 1.08 L 3.46 .8 Q 4.0 .72 4.36 .62 Q 4.52 .56 4.52 .44 L 4.52 .24 Q 4.51 .13 4.4 .12 {F} {B} Z',
  win:['M 3.34 .81 L 2.76 1.06 Q 2.66 1.11 2.52 1.11 L 2.2 1.11 Q 1.9 1.1 1.66 1.0 Q 1.86 .9 2.2 .83 Z'],
  k:['M 2.2 .82 L 2.15 .55 Q 1.9 .58 1.6 .69 Q 1.86 .78 2.2 .82 Z','M 0 .26 L .5 .26 L .44 .12 L .1 .12 Z','M 4.1 .12 L 4.49 .12 L 4.49 .15 L 4.1 .15 Z'],
  ln:['M 3.1 .8 Q 3.04 .45 3.06 .12','M 2.24 .82 Q 2.16 .5 2.2 .12','M 1.72 .7 L 2.12 .74','M 1.8 .64 L 2.12 .66'],
  cr:['M 4.35 .58 Q 3.2 .52 2.2 .6 Q 1.8 .64 1.5 .78'],mr:[3.3,.86],
  hl:'M 4.0 .7 L 4.4 .62 Q 4.5 .58 4.5 .52 L 4.18 .6 Z',tl:'M .02 .78 Q .06 .86 .2 .9 L .58 .94 L .58 .9 L .04 .72 Z',
  ex:[.3,.17,2],rs:'5',rf:.7,rc:'s',cal:'#c81e2c'},
 super2:{base:'super',
  p:'M .1 .12 L 0 .26 L 0 .62 L .06 .8 L .3 .9 L .62 .93 L 1.5 1.04 L 1.9 1.13 L 2.2 1.17 L 2.52 1.17 L 2.76 1.09 L 3.46 .8 L 4.0 .72 L 4.4 .62 L 4.52 .5 L 4.52 .24 L 4.42 .12 {F} {B} Z',
  win:['M 3.34 .81 L 2.76 1.06 L 2.52 1.11 L 2.2 1.11 L 1.66 1.0 L 2.2 .83 Z'],
  k:['M 2.2 .82 L 2.14 .55 L 1.56 .7 Z','M 0 .26 L .5 .26 L .44 .12 L .1 .12 Z','M 4.1 .12 L 4.49 .12 L 4.49 .15 L 4.1 .15 Z'],
  hl:'M 3.98 .7 L 4.46 .6 L 4.5 .54 L 4.2 .6 Z',tl:'M .02 .76 L .08 .82 L .58 .94 L .58 .9 L .04 .7 Z',rs:'y',rc:'d',cal:'#e8b31c'},
 super3:{base:'super',rs:'5',rc:'d',cal:'#e8b31c',ak:['M .04 .82 L .5 .96 L .56 1.0 L .6 1.0 L .6 .93 L .06 .78 Z']},
 super4:{base:'super',rs:'m',rc:'d',cal:'#f08a24',
  win:['M 3.36 .81 L 2.78 1.07 Q 2.66 1.12 2.5 1.12 L 2.1 1.12 Q 1.76 1.1 1.5 .96 Q 1.8 .88 2.1 .84 Z'],
  k:['M 2.3 .86 Q 2.25 .62 2.3 .44 Q 1.9 .52 1.5 .66 Q 1.9 .8 2.3 .86 Z','M 0 .26 L .5 .26 L .44 .12 L .1 .12 Z','M 4.1 .12 L 4.49 .12 L 4.49 .15 L 4.1 .15 Z']},
 super5:{base:'super',two:1.04,rs:'y',rc:'s',cal:'#c81e2c',ak:['M .82 .9 L 1.3 .94 L 1.3 .96 L .82 .92 Z','M .82 .86 L 1.3 .9 L 1.3 .92 L .82 .88 Z']},

 hyper:{L:4.54,H:1.21,wb:2.71,fo:1.0,wd:.74,cl:.12,bl:.84,
  p:'M .1 .12 L 0 .28 L 0 .66 Q 0 .82 .1 .88 L .36 .96 L .7 .98 Q 1.3 1.02 1.7 1.12 Q 2.0 1.2 2.3 1.21 L 2.52 1.21 Q 2.68 1.2 2.8 1.12 L 3.5 .82 Q 4.0 .74 4.36 .64 Q 4.54 .58 4.54 .46 L 4.54 .24 Q 4.53 .13 4.42 .12 {F} {B} Z',
  win:['M 3.38 .83 L 2.78 1.1 Q 2.68 1.15 2.54 1.15 L 2.24 1.15 Q 1.92 1.14 1.66 1.03 Q 1.86 .92 2.24 .85 Z'],
  low:'M -1 .62 Q 1.2 .66 2.3 .48 Q 3.4 .34 5.6 .5 L 5.6 -1 L -1 -1 Z',
  k:['M 2.24 .86 L 2.16 .57 Q 1.9 .6 1.58 .72 Q 1.86 .82 2.24 .86 Z','M 0 .28 L .56 .28 L .5 .12 L .1 .12 Z','M 4.1 .12 L 4.51 .12 L 4.51 .15 L 4.1 .15 Z'],
  ln:['M 3.1 .82 Q 3.04 .45 3.06 .12','M 2.26 .84 Q 2.18 .5 2.22 .12'],
  cr:['M 4.4 .6 Q 3.2 .54 2.3 .62'],mr:[3.34,.88],
  hl:'M 4.02 .72 L 4.44 .63 Q 4.52 .6 4.52 .54 L 4.2 .6 Z',tl:'M .02 .82 Q .06 .9 .24 .94 L .7 .98 L .7 .94 L .04 .76 Z',
  ex:[.28,.2,2],rs:'t',rf:.72,rc:'d',cal:'#3b82f6'},
 hyper2:{base:'hyper',rs:'y',cal:'#c81e2c',
  ak:['M .4 .96 L .46 1.28 L .5 1.28 L .46 .96 Z','M .72 .98 L .78 1.28 L .82 1.28 L .78 .98 Z','M -.02 1.28 Q .4 1.34 .98 1.34 L .98 1.4 Q .5 1.42 -.02 1.36 Z','M 4.3 .44 L 4.55 .4 L 4.55 .43 L 4.32 .47 Z']},

 muscle:{L:4.8,H:1.38,wb:2.97,fo:.95,wd:.7,cl:.14,bl:.97,
  p:'M .12 .14 L 0 .3 L 0 .78 Q 0 .9 .1 .92 L .5 .94 Q .9 .98 1.2 1.12 Q 1.6 1.34 2.1 1.38 L 2.5 1.38 Q 2.7 1.37 2.82 1.28 L 3.26 .96 L 4.62 .93 Q 4.74 .93 4.78 .86 L 4.8 .74 L 4.8 .3 Q 4.79 .15 4.68 .14 {F} {B} Z',
  win:['M 3.16 .96 L 2.8 1.24 Q 2.72 1.31 2.6 1.31 L 2.0 1.31 L 1.94 .98 Z','M 1.9 1.31 Q 1.56 1.28 1.32 1.14 L 1.2 1.04 Q 1.18 1.0 1.24 1.0 L 1.86 .98 Z'],
  bc:['M 3.7 .93 L 4.2 .93 L 4.2 .99 Q 4.2 1.0 4.18 1.0 L 3.86 .99 Z'],k:['M 4.17 .94 L 4.2 .94 L 4.2 .99 L 4.17 .99 Z','M 4.76 .4 L 4.81 .4 L 4.81 .84 L 4.76 .84 Z'],
  ln:['M 3.3 .96 Q 3.26 .55 3.3 .14','M 1.92 .98 Q 1.88 .55 1.92 .14','M 4.4 .38 Q 2.4 .35 .5 .4'],
  cr:['M 4.7 .86 L 3.2 .86 Q 2 .84 .05 .86'],hd:[[2.4,.9]],mr:[3.16,1.02],
  hl:'M 4.7 .86 L 4.79 .82 L 4.79 .7 L 4.72 .72 Z',tl:'M .01 .72 L .12 .74 L .12 .88 L .01 .9 Z',
  ex:[.38,.19,2],rs:'5',rf:.64,rc:'s'},

 pickup:{L:5.9,H:1.95,wb:3.68,fo:.95,wd:.82,cl:.33,bl:1.38,
  p:'M .1 .33 L 0 .46 L 0 1.28 Q 0 1.32 .04 1.32 L 1.96 1.32 L 2.02 1.32 L 2.08 1.82 Q 2.1 1.94 2.24 1.94 L 3.86 1.95 Q 4.0 1.95 4.08 1.86 L 4.5 1.38 L 5.6 1.32 Q 5.84 1.3 5.88 1.18 L 5.9 1.0 L 5.9 .46 Q 5.89 .34 5.78 .33 {F} {B} Z',
  win:['M 4.38 1.38 L 4.06 1.82 Q 4.02 1.86 3.96 1.86 L 3.42 1.86 L 3.42 1.39 Z','M 3.32 1.86 L 2.26 1.86 Q 2.2 1.86 2.19 1.8 L 2.14 1.4 L 3.32 1.39 Z'],
  k:['M .04 1.32 L 1.96 1.32 L 1.96 1.36 L .04 1.36 Z','M 1.85 .32 L 4.4 .32 L 4.4 .37 L 1.85 .37 Z'],clad:1,
  ln:['M 2.02 1.31 L 2.02 .34','M .06 1.3 L .06 .46','M 4.42 1.37 Q 4.38 .8 4.42 .33','M 3.37 1.39 L 3.37 .33','M 2.12 1.38 L 2.12 .34','M 5.6 .62 Q 3 .6 .2 .6'],
  cr:['M 5.8 1.2 L 2.2 1.24','M 1.98 1.2 L .04 1.2'],hd:[[4.1,1.28],[3.0,1.28]],mr:[4.4,1.46],
  hl:'M 5.6 1.28 Q 5.86 1.26 5.89 1.12 L 5.78 1.1 Q 5.68 1.2 5.56 1.22 Z',tl:'M .01 .86 L .08 .86 L .08 1.26 L .01 1.26 Z',
  ex:[.5,.36,1],rs:'y',rf:.6,rc:'s'},

 van:{L:5.3,H:2.3,wb:3.4,fo:.9,wd:.7,cl:.22,bl:1.3,
  p:'M .1 .22 L 0 .36 L 0 2.2 Q 0 2.3 .1 2.3 L 4.3 2.3 Q 4.44 2.3 4.5 2.2 L 4.98 1.32 L 5.2 1.22 Q 5.3 1.18 5.3 1.06 L 5.3 .36 Q 5.29 .23 5.18 .22 {F} {B} Z',
  win:['M 4.86 1.33 L 4.46 2.1 Q 4.44 2.14 4.38 2.14 L 3.96 2.14 L 3.96 1.32 Z','M 3.7 2.12 L 2.84 2.12 L 2.84 1.42 L 3.7 1.42 Z'],
  k:['M 1.6 2.1 L 3.8 2.1 L 3.8 2.13 L 1.6 2.13 Z'],
  ln:['M 3.86 2.14 L 3.86 .22','M 3.76 2.12 L 3.76 .22','M 2.6 2.12 L 2.6 .22','M 4.9 1.3 Q 4.84 1.0 4.8 .8','M 5.0 .5 L .4 .5'],
  cr:['M 5.25 1.2 L .04 1.22'],hd:[[3.6,1.2],[4.6,1.2]],mr:[4.9,1.4],
  hl:'M 5.12 1.2 Q 5.28 1.16 5.3 1.04 L 5.2 1.02 Q 5.12 1.1 5.06 1.14 Z',tl:'M .01 .8 L .08 .8 L .08 1.4 L .01 1.4 Z',
  rs:'s',rf:.58,rc:'s'},

 limo:{L:6.5,H:1.5,wb:4.4,fo:1.0,wd:.72,cl:.17,bl:1.05,
  p:'M .12 .17 L 0 .32 L 0 .66 Q 0 .88 .1 .93 L .24 1.0 Q .36 1.04 .56 1.05 L .9 1.06 Q 1.1 1.07 1.24 1.14 L 1.7 1.42 Q 1.82 1.5 2.08 1.5 L 4.12 1.5 Q 4.32 1.5 4.46 1.42 L 5.02 1.04 Q 5.6 .98 6.2 .86 Q 6.5 .8 6.5 .62 L 6.5 .34 Q 6.49 .19 6.36 .17 {F} {B} Z',
  win:['M 4.9 1.05 L 4.44 1.38 Q 4.37 1.42 4.26 1.42 L 3.62 1.42 L 3.62 1.07 Z','M 3.52 1.42 L 2.42 1.42 L 2.42 1.07 L 3.52 1.07 Z','M 2.33 1.42 L 1.84 1.42 Q 1.74 1.41 1.66 1.34 L 1.34 1.1 L 2.33 1.08 Z'],tr:'c',
  c:['M 1.6 .2 L 5.0 .2 L 5.0 .24 L 1.6 .24 Z'],
  ln:['M 5.06 1.04 Q 5.02 .6 5.06 .17','M 3.57 1.07 L 3.57 .17','M 2.375 1.08 L 2.375 .17','M 1.36 1.1 L 1.36 .84 Q 1.56 .66 1.6 .17','M 6.0 .42 Q 3.2 .39 .5 .44'],
  cr:['M 6.25 .9 Q 3.2 .98 .05 .94'],hd:[[4.4,1.0],[3.2,1.0],[2.0,1.01]],hs:'c',mr:[4.92,1.12],
  hl:'M 5.86 .92 Q 6.3 .86 6.45 .74 L 6.33 .7 Q 6.1 .79 5.82 .86 Z',tl:'M .02 .88 Q .08 .96 .22 .98 L .66 1.02 L .64 .95 L .04 .8 Z',
  ex:[.36,.21,1],rs:'x',rf:.64,rc:'c'},

 classic:{L:4.7,H:1.4,wb:2.8,fo:.95,wd:.68,cl:.2,bl:.97,
  p:'M .14 .2 L 0 .34 L 0 .7 Q .02 .86 .14 .9 L .7 .92 Q .92 .93 1.02 .98 L 1.4 1.34 Q 1.46 1.4 1.62 1.4 L 2.62 1.4 Q 2.78 1.39 2.86 1.32 L 3.2 .96 Q 3.9 .92 4.5 .86 Q 4.7 .82 4.7 .66 L 4.7 .34 Q 4.69 .21 4.56 .2 {F} {B} Z',
  win:['M 3.12 .97 L 2.84 1.3 Q 2.78 1.35 2.7 1.35 L 2.36 1.35 L 2.36 .98 Z','M 2.3 1.35 L 1.66 1.35 Q 1.56 1.35 1.5 1.28 L 1.18 .98 L 2.3 .98 Z'],tr:'c',
  c:['M .1 .7 L 4.6 .72 L 4.6 .74 L .1 .72 Z','M -.06 .36 L .2 .36 L .2 .5 L -.06 .5 Q -.08 .5 -.08 .48 L -.08 .38 Q -.08 .36 -.06 .36 Z','M 4.5 .36 L 4.76 .36 Q 4.78 .36 4.78 .38 L 4.78 .48 Q 4.78 .5 4.76 .5 L 4.5 .5 Z'],
  ln:['M 3.24 .96 Q 3.2 .55 3.24 .2','M 2.33 .98 L 2.33 .2','M 1.2 .98 L 1.2 .7 Q 1.38 .6 1.4 .2'],
  cr:['M 4.6 .82 Q 2.4 .86 .1 .84'],hd:[[2.95,.9],[1.95,.9]],hs:'c',mr:[3.12,1.0],
  hl:'M 4.58 .84 Q 4.68 .82 4.7 .72 L 4.66 .66 L 4.58 .7 Z',tl:'M .01 .66 Q .02 .84 .1 .88 L .2 .88 L .18 .7 L .02 .62 Z',
  ex:[.32,.22,1],rs:'c',rf:.66,rc:'c',ww:1}
};
let _carUid=0;
const carN=v=>+(+v).toFixed(2);
// maten (m) → tekening: varianten aanvullen, schalen, centreren, grond op CAR_G
(()=>{const raw=Object.assign({},CAR_BODIES);
 for(const k in raw){let v=raw[k];if(v.base){const b=raw[v.base];v=Object.assign({},b,v);[['ak','k'],['akc','kc'],['ac','c']].forEach(([a,t])=>{if(raw[k][a])v[t]=(v[t]||[]).concat(raw[k][a])})}
  const s=v.sc||Math.min(188/v.L,60/v.H),x0=(200-v.L*s)/2,X=x=>carN(x0+x*s),Y=y=>carN(CAR_G-y*s);
  const T=d=>d&&d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g,(m,a,b)=>X(+a)+','+Y(+b)),A=a=>a&&a.map(T),P=p=>p&&[X(p[0]),Y(p[1])].concat(p.slice(2));
  const r=carN(v.wd/2*s);
  CAR_BODIES[k]=Object.assign({},v,{s,r,ra:carN(r+(v.gap||.055)*s),ay:Y(v.cl),w:[X(v.L-v.fo-v.wb),X(v.L-v.fo)],sh:carN(Y(v.bl)+1.2),
   two:v.two?Y(v.two):0,p:T(v.p),dlo:T(v.dlo),win:A(v.win),k:A(v.k),kc:A(v.kc),c:A(v.c),bc:A(v.bc),ln:A(v.ln),cr:A(v.cr),
   hl:T(v.hl),tl:T(v.tl),low:T(v.low),sp:T(v.sp),hd:(v.hd||[]).map(P),mr:v.mr&&P(v.mr),ex:v.ex&&P(v.ex)})}})();
const carRgb=h=>{h=String(h||'').trim().replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return h.length!==6||isNaN(n)?[138,146,156]:[n>>16&255,n>>8&255,n&255]};
const carMix=(c,t,a)=>{const A=carRgb(c),T=carRgb(t);return '#'+A.map((v,i)=>Math.round(v+(T[i]-v)*a).toString(16).padStart(2,'0')).join('')};
const carLum=c=>{const [r,g,b]=carRgb(c);return (r*.299+g*.587+b*.114)/255};
function carBox(d){const n=d.match(/-?\d+(\.\d+)?/g).map(Number),x=[],y=[];for(let i=0;i+1<n.length;i+=2){x.push(n[i]);y.push(n[i+1])}
 return {x0:Math.min(...x),x1:Math.max(...x),y0:Math.min(...y),y1:Math.max(...y)}}
// Wiel: band, velg met spaken per stijl, remschijf en remklauw
function carWheel(B,x,u){const r=B.r,cy=carN(CAR_G-r),R=r*(B.rf||.62),s=B.rs||'5',rim=`url(#${u}r)`,lip={d:'#6a7079',g:'#d8b56a',c:'#eef1f4'}[B.rc]||'#d5dae0';
 const P=(a,d)=>carN(x+d*Math.cos(a))+','+carN(cy+d*Math.sin(a)),C=(rr,f,x2)=>`<circle cx="${x}" cy="${cy}" r="${carN(rr)}" fill="${f}"${x2||''}/>`;
 const spoke=(a,r0,w0,r1,w1,sk)=>{sk=sk||0;const h0=w0/2/r0,h1=w1/2/r1;return `M${P(a-h0,r0)} L${P(a+sk-h1,r1)} L${P(a+sk+h1,r1)} L${P(a+h0,r0)} Z`};
 let o=C(r,'#0b0c0e')+C(r*.93,'none',` stroke="#202227" stroke-width="${carN(r*.06)}"`);
 if(B.ww)o+=C(R+(r-R)*.48,'none',` stroke="#e9e6dc" stroke-width="${carN((r-R)*.42)}"`);
 o+=C(R,'#14161a');
 if(s!=='s'&&s!=='c'){o+=C(R*.74,'#4e545c')+C(R*.42,'#25282d');
  if(B.cal){const a0=-2.55,a1=-1.75,r0=R*.46,r1=R*.7;o+=`<path d="M${P(a0,r1)} A${carN(r1)},${carN(r1)} 0 0 1 ${P(a1,r1)} L${P(a1,r0)} A${carN(r0)},${carN(r0)} 0 0 0 ${P(a0,r0)} Z" fill="${B.cal}"/>`}}
 let d='';const T=Math.PI*2,a0=-Math.PI/2;
 if(s==='5')for(let i=0;i<5;i++)d+=spoke(a0+i*T/5,R*.2,R*.42,R*.93,R*.36);
 else if(s==='y')for(let i=0;i<5;i++){const a=a0+i*T/5;d+=spoke(a,R*.2,R*.36,R*.52,R*.26)+spoke(a-.2,R*.46,R*.17,R*.93,R*.16)+spoke(a+.2,R*.46,R*.17,R*.93,R*.16)}
 else if(s==='m')for(let i=0;i<10;i++)d+=spoke(a0+i*T/10,R*.2,R*.17,R*.93,R*.13);
 else if(s==='t')for(let i=0;i<8;i++)d+=spoke(a0+i*T/8,R*.2,R*.24,R*.93,R*.3,.42);
 else if(s==='o')for(let i=0;i<6;i++)d+=spoke(a0+i*T/6,R*.22,R*.5,R*.8,R*.46);
 if(d)o+=`<path d="${d}" fill="${rim}"/>`;
 if(s==='x'){let m='';for(let i=0;i<14;i++){const a=a0+i*T/14;m+=`M${P(a,R*.24)} L${P(a+.42,R*.92)} M${P(a,R*.24)} L${P(a-.42,R*.92)} `}
  o+=`<path d="${m}" stroke="${rim}" stroke-width="${carN(R*.075)}" fill="none"/>`}
 if(s==='s'){o+=C(R*.95,rim)+C(R*.68,'none',` stroke="rgba(0,0,0,.35)" stroke-width="${carN(R*.06)}"`);
  for(let i=0;i<8;i++){const p=P(a0+i*T/8,R*.82).split(',');o+=`<circle cx="${p[0]}" cy="${p[1]}" r="${carN(R*.07)}" fill="#22252a"/>`}}
 if(s==='c'){let m='';for(let i=0;i<18;i++){const a=a0+i*T/18;m+=`M${P(a,R*.6)} L${P(a+.18,R*.93)} `}
  o+=`<path d="${m}" stroke="#c9ced5" stroke-width="${carN(R*.05)}" fill="none"/>`+C(R*.6,rim)+C(R*.44,'none',` stroke="rgba(0,0,0,.25)" stroke-width="${carN(R*.05)}"`)}
 if(s==='o'){o+=C(R*.9,'none',` stroke="${rim}" stroke-width="${carN(R*.16)}"`);for(let i=0;i<12;i++){const p=P(a0+i*T/12,R*.9).split(',');o+=`<circle cx="${p[0]}" cy="${p[1]}" r="${carN(R*.045)}" fill="#1a1c20"/>`}}
 return o+C(R,'none',` stroke="${lip}" stroke-width="${carN(R*.08)}" opacity=".9"`)+C(R*.17,rim)+C(R*.07,'#1b1d21')}
function carSvg(b,color,opt){opt=opt||{};const B=CAR_BODIES[b]||CAR_BODIES.hatch,u='cg'+(++_carUid),c=color||'#8a929c',G=CAR_G,cy=carN(G-B.r);
 const arch=x=>{const dy=B.ay-cy,dx=Math.sqrt(B.ra*B.ra-dy*dy);return {x,a:carN(x+dx),b:carN(x-dx),L:dy>0?1:0}};
 const A=B.w.map(arch),arc=q=>`L${q.a},${B.ay} A${B.ra},${B.ra} 0 ${q.L} 0 ${q.b},${B.ay}`;
 const body=B.p.replace('{F}',arc(A[1])).replace('{B}',arc(A[0]));
 const dark=carLum(c)<.16,two=carLum(c)>.42?'#15171c':'#e7e5df';
 const H=carBox(B.hl),TL=carBox(B.tl),hx=(H.x0+H.x1)/2,hy=(H.y0+H.y1)/2,tx=(TL.x0+TL.x1)/2,ty=(TL.y0+TL.y1)/2;
 const path=(d,f,x)=>`<path d="${d}" fill="${f}"${x||''}/>`,all=(a,f,x)=>(a||[]).map(d=>path(d,f,x)).join('');
 const arcUp=(x,R,st)=>`<path d="M${carN(x-R)},${carN(cy+R*.2)} A${carN(R)},${carN(R)} 0 0 1 ${carN(x+R)},${carN(cy+R*.2)}" fill="none"${st}/>`;
 const mx=B.mr&&B.mr[0],my=B.mr&&B.mr[1],ms=Math.min(1.25,Math.max(.8,B.s/40));
 const car=`${B.sp?path(B.sp,'#111316',' stroke="#2a2d33" stroke-width=".8"'):''}
  ${A.map(q=>`<path d="M${q.b},${B.ay} A${B.ra},${B.ra} 0 ${q.L} 1 ${q.a},${B.ay} Z" fill="#050608"/>`).join('')}
  ${path(body,`url(#${u}b)`)}
  <g clip-path="url(#${u}p)">
   ${B.two?`<rect x="0" y="0" width="200" height="${B.two}" fill="${two}"/>`:''}
   ${B.low?path(B.low,'#121418'):''}
   <rect x="0" y="${B.sh-1.4}" width="200" height="6.4" fill="url(#${u}h)"/>
   <rect x="0" y="${carN(B.ay-10)}" width="200" height="10" fill="url(#${u}l)"/>
   ${all(B.kc,'#101215')}
   ${A.map(q=>(B.clad?arcUp(q.x,B.ra+2,' stroke="#111316" stroke-width="3.4"'):'')
    +arcUp(q.x,B.ra+.7,' stroke="rgba(0,0,0,.42)" stroke-width="1.4"')
    +arcUp(q.x,B.ra+(B.flare?3.4:2.2),` stroke="rgba(255,255,255,${B.flare?.2:.1})" stroke-width="${B.flare?1.1:.8}"`)).join('')}
   ${(B.cr||[]).map(d=>`<path d="${d}" fill="none" stroke="rgba(255,255,255,${dark?.2:.26})" stroke-width=".75"/>`).join('')}
   ${(B.ln||[]).map(d=>`<path d="${d}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width=".6"/>`).join('')}
  </g>
  ${path(body,'none',` stroke="url(#${u}e)" stroke-width=".8"`)}
  ${B.dlo?path(B.dlo,'#07090c'):''}
  ${all(B.win,`url(#${u}w)`,B.tr==='c'?' stroke="#cdd2d8" stroke-width=".9"':' stroke="rgba(0,0,0,.7)" stroke-width=".6"')}
  <g clip-path="url(#${u}q)"><path d="M70,0 L86,0 L44,72 L28,72 Z M110,0 L116,0 L74,72 L68,72 Z M150,0 L160,0 L118,72 L108,72 Z" fill="#fff" opacity=".08"/></g>
  ${all(B.bc,`url(#${u}b)`)}${all(B.k,`url(#${u}k2)`,' stroke="rgba(255,255,255,.16)" stroke-width=".45"')}${all(B.c,`url(#${u}c)`)}
  ${(B.hd||[]).map(([x,y])=>B.hs==='f'?`<rect x="${carN(x-3.4)}" y="${carN(y-.45)}" width="6.8" height=".9" rx=".45" fill="rgba(0,0,0,.5)"/>`
   :`<rect x="${carN(x-3.2)}" y="${carN(y-.85)}" width="6.4" height="1.7" rx=".85" fill="${B.hs==='c'?`url(#${u}c)`:'rgba(0,0,0,.42)'}"/><rect x="${carN(x-2.8)}" y="${carN(y-.85)}" width="5.6" height=".5" rx=".25" fill="rgba(255,255,255,.25)"/>`).join('')}
  ${B.mr?`<g transform="translate(${mx},${my}) scale(${carN(ms)})"><path d="M-3.4,1.8 L-2.6,-1.4 Q-2,-2.6 0,-2.6 L2.8,-2.4 Q4,-2.2 3.8,-.8 L3.2,1.8 Z" fill="url(#${u}b)" stroke="rgba(0,0,0,.45)" stroke-width=".4"/><path d="M-1.2,1.8 L1,1.8 L.6,3.2 L-.8,3.2 Z" fill="#0d0f12"/></g>`:''}
  ${B.ex?Array.from({length:B.ex[2]},(_,i)=>{const ex=carN(B.ex[0]+(i-(B.ex[2]-1)/2)*2.6);return `<ellipse cx="${ex}" cy="${B.ex[1]}" rx="1.15" ry=".9" fill="url(#${u}c)"/><ellipse cx="${ex}" cy="${B.ex[1]}" rx=".65" ry=".5" fill="#0a0b0d"/>`}).join(''):''}
  <ellipse cx="${carN(hx)}" cy="${carN(hy)}" rx="${carN((H.x1-H.x0)/2+5)}" ry="${carN((H.y1-H.y0)/2+3.2)}" fill="url(#${u}g)"/>
  ${path(B.hl,'#fbf4de',' stroke="rgba(0,0,0,.35)" stroke-width=".4"')}
  <ellipse cx="${carN(tx)}" cy="${carN(ty)}" rx="${carN((TL.x1-TL.x0)/2+3.6)}" ry="${carN((TL.y1-TL.y0)/2+2.6)}" fill="url(#${u}t)"/>
  ${path(B.tl,'#d9172a',' stroke="#ff6b78" stroke-width=".35"')}
  ${A.map(q=>carWheel(B,q.x,u)).join('')}`;
 const rim={d:['#7d838d','#2c3036'],g:['#ead08e','#8a6a2c'],c:['#ffffff','#7f8690']}[B.rc]||['#f4f6f8','#9aa2ac'];
 const h=opt.reflect?G+28:72,cx=(B.w[0]+B.w[1])/2,rx=(B.w[1]-B.w[0])/2+B.r*2.7;
 return `<svg viewBox="0 0 200 ${h}" class="carsvg" aria-hidden="true"><defs>
  <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${carMix(c,'#ffffff',.3)}"/><stop offset=".16" stop-color="${carMix(c,'#ffffff',.1)}"/><stop offset=".44" stop-color="${c}"/><stop offset=".76" stop-color="${carMix(c,'#000000',.34)}"/><stop offset="1" stop-color="${carMix(c,'#000000',.7)}"/></linearGradient>
  <linearGradient id="${u}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${dark?.42:.34}"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${u}w" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#62748c"/><stop offset=".32" stop-color="#202a37"/><stop offset=".68" stop-color="#0c1118"/><stop offset="1" stop-color="#05070a"/></linearGradient>
  <linearGradient id="${u}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity="${dark?.2:.24}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
  <linearGradient id="${u}k2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#23262c"/><stop offset=".5" stop-color="#0e1013"/><stop offset="1" stop-color="#060708"/></linearGradient>
  <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".45" stop-color="#aab1ba"/><stop offset=".56" stop-color="#5f666f"/><stop offset="1" stop-color="#dce0e5"/></linearGradient>
  <radialGradient id="${u}r" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${rim[0]}"/><stop offset="1" stop-color="${rim[1]}"/></radialGradient>
  <radialGradient id="${u}g"><stop offset="0" stop-color="#fff4d6" stop-opacity=".6"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient>
  <radialGradient id="${u}t"><stop offset="0" stop-color="#ff2236" stop-opacity=".5"/><stop offset="1" stop-color="#ff2236" stop-opacity="0"/></radialGradient>
  <radialGradient id="${u}s"><stop offset="0" stop-color="#000" stop-opacity=".78"/><stop offset=".7" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="${u}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2cc" stop-opacity=".2"/><stop offset="1" stop-color="#fff2cc" stop-opacity="0"/></linearGradient>
  <clipPath id="${u}p"><path d="${body}"/></clipPath><clipPath id="${u}q">${(B.win||[]).map(d=>`<path d="${d}"/>`).join('')}</clipPath>
  ${opt.reflect?`<linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${u}k"><rect x="0" y="${G}" width="200" height="28" fill="url(#${u}m)"/></mask>`:''}</defs>
  <ellipse cx="${carN(cx)}" cy="${G+.4}" rx="${carN(rx)}" ry="3.6" fill="url(#${u}s)"/>
  ${A.map(q=>`<ellipse cx="${q.x}" cy="${G+.1}" rx="${carN(B.r*1.1)}" ry="1.5" fill="rgba(0,0,0,.85)"/>`).join('')}
  ${opt.hl?`<path d="M${carN(H.x1-1)},${carN(hy)} L200,${carN(hy-13)} L200,${carN(hy+17)} Z" fill="url(#${u}v)"/>`:''}
  ${car}
  ${opt.reflect?`<g mask="url(#${u}k)"><g transform="translate(0,${2*G}) scale(1,-1)">${car}</g></g>`:''}</svg>`}
const CAR_COLORS={1:['#c9cfd6','#8a929c','#3a5fa8','#b8333a','#e6e1d6','#2f6b4a','#d8a23a','#50565f'],
 2:['#e6e1d6','#1d1f26','#3a5fa8','#b8333a','#5d6670','#f2c230','#e2e8ef'],3:['#1d1f26','#2b2f38','#e6e1d6','#6f7d8c','#14306b','#7a1f2a'],
 4:['#1d1f26','#e6e1d6','#c9a227','#14306b','#2f5f4a','#9a1a2a','#c0c6cc'],5:['#f2c230','#38c172','#ff7a1a','#e11d48','#7c3aed','#0ea5e9','#f8fafc','#111318']};
const PLATE_L='BDFGHJKLNPRSTVXZ';
function randPlate(){const L=()=>PLATE_L[Math.floor(Math.random()*PLATE_L.length)],N=()=>Math.floor(Math.random()*10);
 return [()=>L()+L()+'-'+N()+N()+N()+'-'+L(),()=>N()+'-'+L()+L()+L()+'-'+N()+N(),()=>L()+'-'+N()+N()+N()+'-'+L()+L()][Math.floor(Math.random()*3)]()}
function carRarity(m){return m.leg?CAR_MYTH:CAR_RARITY[m.d]}
// Minigame "Contact maken": per slot een reeks pijlen binnen de tijd. Rode pijl = druk de andere kant op.
// Zeldzamer model = meer sloten achter elkaar, langere reeks, minder tijd, geen fouten en meer rode pijlen.
// Rijvaardigheid (training) geeft +5% tijd per level. Niet onmogelijk, wel oefenen.
const HEIST_KEYS=['←','↑','→','↓'],HEIST_OPP=[2,3,0,1];
const HEIST_TIERS={1:{locks:1,len:4,per:1500,miss:2,rev:0},2:{locks:1,len:5,per:1100,miss:1,rev:0},3:{locks:2,len:5,per:820,miss:1,rev:0},
 4:{locks:2,len:6,per:620,miss:0,rev:1},5:{locks:3,len:6,per:480,miss:0,rev:2},6:{locks:3,len:7,per:400,miss:0,rev:3}};
const carTier=m=>m.leg?6:m.d;
const secTxt=ms=>(ms/1000).toLocaleString('nl-NL',{maximumFractionDigits:1})+' s';
// Ervaring als autodief: als groentje trillen je handen (minder tijd per pijl) en ziet vaker een voorbijganger je bezig.
// Groeit met het aantal gestolen auto's en je rang.
const CAR_LV=['Groentje','Leerling','Handig','Ervaren','Meesterdief'];
const carNerve=()=>{const n=(S.stats&&S.stats.cars)||0,ri=rankIdx(S.xp),a=.6*Math.min(1,n/40),b=.4*Math.min(1,ri/6),lv=Math.min(1,a+b),i=Math.min(4,Math.floor(lv*5));
 return {lv,i,name:CAR_LV[i],time:.78+.22*lv,wit:Math.max(.05,.28-.23*lv)}};
function heistParams(m){const sk=(S.skills&&S.skills.cars)||0,T=HEIST_TIERS[carTier(m)],N=carNerve();return {...T,per:Math.round(T.per*(1+sk*SK.cars.time+gearFx('car'))*N.time),d:m.d,wit:N.wit,nv:N}}
function heistTxt(P){return [P.locks>1?P.locks+' sloten':'1 slot',P.len+' pijlen in '+secTxt(P.len*P.per),P.rev?P.rev+' rode per slot':null,P.miss?P.miss+'× fout mag':'geen fouten'].filter(Boolean).join(' · ')}
function carHeist(sp){const m=CARS.find(k=>k.id===sp.id)||CARS[0];
 return new Promise(resolve=>{
  const P=heistParams(m),R=carRarity(m);window.__chase=true;
  const ov=document.createElement('div');ov.className='chase-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','hT');
  ov.innerHTML=`<div class="chase-box heist t${carTier(m)}" style="--rc:${R[1]}">
    <div class="hx-car">${carSvg(m.b,sp.c,{hl:1})}<span class="plate">${sp.plate}</span></div>
    <div class="heist-top"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><span class="label">${esc(m.n)}</span></div>
    <div class="hx-head"><h2 id="hT">Contact maken</h2><div class="hx-locks" id="hLocks" aria-label="Sloten">${Array.from({length:P.locks},()=>'<i></i>').join('')}</div></div>
    ${P.nv.i<2?`<div class="hx-nerve">${P.nv.name}: je handen trillen (−${Math.round((1-P.nv.time)*100)}% tijd). Let op voorbijgangers.</div>`:''}
    <div class="hx-wit" id="hWit" hidden><i>👁</i><span>Een voorbijganger ziet je bezig en pakt zijn telefoon. Schiet op!</span></div>
    <p class="chase-p" id="hP">Toets de pijlen in deze volgorde in. ${P.rev?'<b class="rv">Rode pijl</b> = druk de andere kant op. ':''}${P.miss?'Je mag '+P.miss+'× fout.':'Eén fout en het alarm gaat af.'} Pijltjestoetsen, WASD of de knoppen.</p>
    <div class="heist-seq" id="hSeq">${'<i class="ghost"></i>'.repeat(P.len)}</div>
    <div class="hx-time"><i id="hTime"></i></div>
    <div class="heist-pad">${HEIST_KEYS.map((k,i)=>`<button data-k="${i}" aria-label="Pijl ${k}">${k}</button>`).join('')}</div></div>`;
  document.body.appendChild(ov);
  const q=s=>ov.querySelector(s),bar=q('#hTime');let dur=P.len*P.per;
  let lock=0,idx=0,miss=0,done=false,t0=0,run=0,seq=[],cells=[];
  // voorbijganger: op een willekeurig moment ziet iemand je; je verliest tijd en mislukt het, dan belde hij 112 (maar je bent op tijd weg)
  const wit={on:Math.random()<P.wit,lock:Math.floor(Math.random()*P.locks),at:.3+Math.random()*.35,seen:false};
  const need=s=>s.r?HEIST_OPP[s.k]:s.k;
  const mark=()=>cells.forEach((c,i)=>{c.classList.toggle('cur',i===idx&&!!t0);c.classList.toggle('ok',i<idx)});
  const lockUi=()=>q('#hLocks').querySelectorAll('i').forEach((e,i)=>{e.classList.toggle('open',i<lock);e.classList.toggle('cur',i===lock&&!done)});
  const newSeq=()=>{seq=Array.from({length:P.len},()=>({k:Math.floor(Math.random()*4),r:false}));
   [...Array(P.len-1).keys()].map(i=>i+1).sort(()=>Math.random()-.5).slice(0,P.rev).forEach(i=>seq[i].r=true);
   q('#hSeq').innerHTML=seq.map(s=>`<i class="${s.r?'rev':''}">${HEIST_KEYS[s.k]}</i>`).join('');cells=[...q('#hSeq').children];idx=0};
  const loop=r=>t=>{if(done||r!==run)return;let p=(t-t0)/dur;
   if(wit.on&&!wit.seen&&lock===wit.lock&&p>=wit.at){wit.seen=true;t0-=dur*.25;p=(t-t0)/dur;dur=Math.round(dur*.85);q('#hWit').hidden=false;try{SFX.lose()}catch(e){}}
   bar.style.width=Math.max(0,100-p*100)+'%';bar.classList.toggle('low',p>.7);
   if(p>=1)return finish(false,wit.seen?'Te traag. De voorbijganger belt 112.':'Te traag. Het alarm gaat af.');requestAnimationFrame(loop(r))};
  const startLock=()=>{if(done)return;newSeq();t0=performance.now();run++;mark();lockUi();bar.classList.remove('peek');requestAnimationFrame(loop(run))};
  const press=k=>{if(done||!t0)return;const btn=q(`.heist-pad [data-k="${k}"]`);btn.classList.remove('hit','bad');void btn.offsetWidth;
   if(k===need(seq[idx])){btn.classList.add('hit');SFX.tick();idx++;mark();
    if(idx>=seq.length){lock++;t0=0;run++;lockUi();
     if(lock>=P.locks)return finish(true,'De motor slaat aan. Rijden!');
     SFX.pop();q('#hP').textContent='Slot '+lock+' van '+P.locks+' open. Volgende reeks komt eraan.';setTimeout(startLock,450)}}
   else{btn.classList.add('bad');miss++;SFX.lose();const c=cells[idx];c.classList.add('err');setTimeout(()=>c.classList.remove('err'),300);
    if(miss>P.miss)finish(false,(seq[idx].r?'Rode pijl gemist':'Verkeerde draad')+(wit.seen?'. De voorbijganger belt 112.':'. Het alarm gaat af.'))}};
  const KEYMAP={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,KeyA:0,KeyW:1,KeyD:2,KeyS:3};
  const key=e=>{if(e.code in KEYMAP){e.preventDefault();press(KEYMAP[e.code])}};
  document.addEventListener('keydown',key);
  ov.querySelectorAll('.heist-pad button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();press(+b.dataset.k)}));
  function finish(ok,msg){done=true;run++;document.removeEventListener('keydown',key);const box=q('.chase-box');box.classList.add(ok?'won':'lost');lockUi();
   q('#hT').textContent=ok?'Gelukt!':wit.seen?'112 gebeld!':'Alarm!';q('#hP').textContent=msg;
   if(ok)box.querySelector('.hx-car').classList.add('drive');
   (ok?SFX.win(3):SFX.lose());const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);
   setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(ok?true:wit.seen?'witness':'alarm')},220)},1500)}
  bar.classList.add('peek');lockUi();setTimeout(startLock,800);
 });
}
