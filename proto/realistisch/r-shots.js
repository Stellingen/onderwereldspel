// Standpunten en lichtinstellingen voor de voorbeeldbeelden.
const PI=Math.PI;
export const TIMES={
  dag:{sunEl:50,sunAz:24,sunI:3.6,sunC:0xfff2e0,hemi:[0xcfdcf2,0x9a8c76,.5],exposure:.66,turb:4,ray:1.1,mie:.004,bloom:[.1,.5,.95],fog:[0xc9dcef,.0015],ao:1,sat:1.08},
  goud:{envC:['#3a5a9a','#9a9ac0','#ffc890','#8a6a50','#5a4a40'],sunGlow:'rgba(255,170,90,.4)',sunEl:9,sunAz:-78,sunI:3.1,sunC:0xffb070,hemi:[0xa9b8dc,0x8a6a52,.62],exposure:.64,turb:8,ray:2.4,mie:.012,bloom:[.26,.6,.82],fog:[0xf0c9a2,.0024],tint:0xfff6ee,soft:4},
  nacht:{night:1,sunEl:40,sunAz:150,sunI:.3,sunC:0x8ea6ff,hemi:[0x2a3a66,0x14121a,.55],exposure:.95,bloom:[.28,.55,.9],fog:[0x0b1020,.004],env:.55,lampI:38,ao:.9,vig:.34,sat:1.1,emis:.6,glow:.15},
  regen:{night:1,wet:1,sunEl:40,sunAz:150,sunI:.22,sunC:0x8ea6ff,hemi:[0x26355c,0x14121a,.5],exposure:1.0,bloom:[.3,.6,.9],fog:[0x0c1222,.006],env:.8,lampI:42,ao:.8,vig:.36,sat:1.12,emis:.62,glow:.2}
};
// l = index in LOOKS (r-people.js); pose: sta | loop | bel | praat | wijs | zit
export const SHOTS={
  // 1. speelbeeld: dezelfde camera als nu, op Het Plein
  plein:{focus:[229,119.5],cam:{pitch:56,yaw:4,dist:43},fov:38,time:'dag',R:105,seed:3,
    people:[{x:229,z:126.5,ry:PI,l:0,pose:'loop',ph:1.2,player:1},{x:226.4,z:123.2,ry:.6,l:3,pose:'praat'},{x:227.4,z:122.1,ry:-2.4,l:5,pose:'sta'},{x:233.5,z:117.5,ry:-1.2,l:7,pose:'bel'},{x:222,z:115,ry:1.7,l:2,pose:'loop',ph:.4},{x:236,z:124,ry:-.4,l:9,pose:'loop',ph:2.2}],
    crowd:{n:14,r:19,seed:5},ui:'hud'},
  // 2. camera achter je karakter, straat in het centrum
  straat:{focus:[156,140],cam:{pos:[137.2,2.9,144.7],at:[160,2.0,142.6]},fov:52,time:'dag',tm:{sunAz:-52,sunEl:44,exposure:.6},PX:9,R:170,shadowR:120,seed:8,aoR:.7,
    people:[{x:142.4,z:145.3,ry:PI/2,l:0,pose:'loop',ph:.9,player:1},{x:149,z:146.2,ry:-PI/2,l:4,pose:'loop',ph:2},{x:152.5,z:145.1,ry:-PI/2+.2,l:6,pose:'bel'},{x:158,z:146,ry:PI/2,l:8,pose:'loop',ph:.3}],
    crowd:{n:26,r:60,seed:11},cars:[{x:149.5,z:140.95,ry:PI/2,v:1},{x:163,z:139.0,ry:-PI/2,v:0},{x:176,z:140.95,ry:PI/2,v:1,taxi:1}]},
  // 3. avond met regen
  regen:{focus:[229,112],cam:{pos:[236.5,2.5,131.5],at:[226.5,3.2,104]},fov:50,time:'regen',R:120,seed:5,aoR:.7,lights:14,
    people:[{x:234.6,z:126.4,ry:PI+.25,l:0,pose:'loop',ph:1.1,player:1},{x:228.5,z:118,ry:.4,l:10,pose:'sta',umb:1},{x:222.5,z:110.5,ry:2.2,l:3,pose:'loop',ph:2.4,umb:1},{x:231,z:108.5,ry:-2.6,l:6,pose:'bel'}],
    crowd:{n:8,r:16,seed:21}},
  // 4. de brug bij ondergaande zon, met de stad op de achtergrond
  haven:{focus:[330,140],cam:{pos:[376.5,4.6,145.4],at:[300,5.2,138.2]},fov:50,time:'goud',tm:{sunAz:-36,sunEl:9,exposure:.7,bloom:[.16,.5,.92]},PX:7,R:215,shadowR:150,seed:6,aoR:.8,noCrane:1,
    people:[{x:366.5,z:143.1,ry:-PI/2,l:0,pose:'loop',ph:1,player:1}],
    cars:[{x:359,z:141.8,ry:PI/2,v:3},{x:346,z:138.2,ry:-PI/2,v:0},{x:331,z:141.8,ry:PI/2,v:6,taxi:1},{x:318,z:138.2,ry:-PI/2,v:4}]},
  // 5. gesprek: karakter waarmee je praat, van dichtbij (over de schouder van je eigen karakter)
  gesprek:{focus:[229,120],cam:{pos:[228.05,1.9,126.75],at:[229.25,1.2,122.9]},fov:40,time:'dag',tm:{sunAz:-58,sunEl:46,exposure:.62},PX:9,R:95,seed:3,aoR:.5,dof:{focus:3.95,ap:.0003,max:.007},
    people:[{x:228.2,z:125.2,ry:2.73,l:0,pose:'sta',player:1},{x:229.2,z:122.9,ry:-.41,l:11,pose:'praat'}],props:[{k:'kar',x:231.0,z:122.2,ry:-.5}],
    crowd:{n:10,r:18,seed:5},ui:'gesprek',portrait:{cam:[228.82,1.86,123.78],at:[229.2,1.8,122.9],fov:26,focus:.96}}
};
