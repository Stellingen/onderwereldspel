// Tab: Misdaden — bonusoverzicht, de beste klussen voor jou en per rang inklapbaar
let crimeShowAll=false;const crimeOpen={};
const fmtK=v=>v>=1e6?'€'+(v/1e6).toLocaleString('nl-NL',{maximumFractionDigits:1})+' mln':v>=1e4?'€'+Math.round(v/1000)+'k':fmt(v);
const crEv=c=>chance(c)/100*(c.min+c.max)/2*lootMult()*mastLoot(c.id)/c.en;
// vakmanschap: sterretjes en de voortgang naar het volgende niveau
function mastHtml(c){const n=mastN(c.id),l=mastLv(c.id),nx=MAST[l+1];
 return `<div class="cr-m l${l}" title="Vakmanschap: ${n}× gelukt${nx?`, nog ${nx[0]-n} tot ${nx[1]}`:''}"><span class="cr-ms">${[1,2,3,4].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span><b>${MAST[l][1]}</b>${nx?`<em><i style="width:${Math.round((n-MAST[l][0])/(nx[0]-MAST[l][0])*100)}%"></i></em><small>${n}/${nx[0]}</small>`:'<small>+8% kans · +20% buit</small>'}</div>`}
V.crimes=()=>{
 const ri=rankIdx(S.xp),mult=lootMult();
 const tiers=[...new Set(CRIMES.map(c=>c.r))].sort((a,b)=>a-b);
 const visible=tiers.filter(t=>crimeShowAll||t<=ri+1);
 const avail=CRIMES.filter(c=>c.r<=ri);
 const isOpen=t=>crimeOpen[t]!=null?crimeOpen[t]:(t>=ri-1);
 const row=(c,best)=>{const lock=ri<c.r,left=cdLeft(c.id),ch=chance(c),tired=S.energy<c.en;
  const label=lock?'Vanaf '+RANKS[c.r][0]:inJail()?'Je zit vast':left?Math.ceil(left/1000)+' s':tired?'Te moe · '+c.en:'Uitvoeren';
  return `<div class="cr ${lock?'locked':''} ${best?'best':''}">
   <div class="cr-t"><h3>${c.n}</h3><p>${c.d}</p>${lock?'':mastHtml(c)}</div>
   <div class="cr-s"><div><span>Buit</span><b class="g">${fmtK(c.min*mult*mastLoot(c.id))} – ${fmtK(c.max*mult*mastLoot(c.id))}</b></div>
    <div><span>Kans</span><b class="${ch>60?'up':ch>35?'':'dn'}">${ch}%</b><i class="cr-ch"><i style="width:${ch}%"></i></i></div>
    <div><span>Energie</span><b>${c.en}</b></div><div><span>Mislukt</span><b>${fmtTime(jailSec(c.jail))} cel</b><small class="lvl${c.flee}">vluchten ${FLEE_LEVELS[c.flee].label}</small></div>
    <div class="cr-x"><span>Erbij</span><b>+${c.xp} XP</b>${c.cr?`<small>+${Math.round(c.cr*credMult(''))} cred (perfect ${Math.round(c.cr*credMult('perfect'))})</small>`:''}</div></div>
   <button class="btn ${best&&!lock&&!left&&!tired&&!inJail()?'':''}" onclick="act.crime('${c.id}')" ${lock||left||inJail()||tired?'disabled':''}>${label}</button>
   ${left?`<div class="cd" style="transform:scaleX(${Math.min(1,left/crimeCd(c))})"></div>`:''}</div>`};
 const best=avail.slice().sort((a,b)=>crEv(b)-crEv(a)).slice(0,3);
 const bon=[['Rang',ri*RANK_LOOT+rankLvlBonus()],['Familie',fam().loot/100],['Uitrusting',gearFx('buit')],['Hacken',sk('hack')*SK.hack.loot/100],['Buit-boost',buffLoot()/100],[lidName(),tierLoot()]].filter(x=>x[1]>0);
 const chb=[['Rang',ri*2],['Uitrusting',gearBonus()],['Familie',fam().chance],['Vingervlugheid',sk('steal')*SK.steal.all],['Focus',focusPct()]].filter(x=>x[1]>0);
 const pct=v=>'+'+Math.round(v*100)+'%';
 return `<h1>Misdaden</h1>
 <section class="card hud cr-hero">
  <div class="cr-h-k"><span class="label">Buit</span><b class="g">×${mult.toLocaleString('nl-NL',{maximumFractionDigits:2})}</b><em>${bon.map(([l,v])=>`${l} ${pct(v)}`).join(' · ')||'Nog geen bonus'}</em></div>
  <div class="cr-h-k"><span class="label">Extra slaagkans</span><b class="up">+${Math.round(chb.reduce((a,x)=>a+x[1],0))}%</b><em>${chb.map(([l,v])=>`${l} +${Math.round(v)}%`).join(' · ')||'Nog geen bonus'}${S.heat>=4?` · hitte −${Math.floor(S.heat/4)}%`:''}${tierK()?` · daarna ×${(1+tierK()).toLocaleString('nl-NL')} als ${lidName()}`:''}</em></div>
  <div class="cr-h-k"><span class="label">Straatcredit</span><b style="color:var(--violet)">×${credMult('').toLocaleString('nl-NL',{maximumFractionDigits:2})}</b><em>Uitrusting +${Math.round(gearCredK()*100)}%${tierK()?` · ${lidName()} +${Math.round(tierK()*100)}%`:''} · perfect ×1,5, netjes ×1,2 · je hebt ${S.cred}</em></div>
  <div class="cr-h-k"><span class="label">Energie</span><b style="color:var(--ice)">${Math.floor(S.energy)}/${EN_MAX}</b><div class="bar"><i style="width:${S.energy/EN_MAX*100}%;background:var(--ice)"></i></div><em>1 punt per ${EN_REGEN_S} s${S.energy<EN_MAX?' · <a href="#ontspannen">bijvullen</a>':''}</em></div>
  <div class="cr-h-k"><span class="label">Hitte</span><b style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--fg)'}">${S.heat}%</b><div class="bar"><i style="width:${S.heat}%;background:${S.heat>60?'var(--red)':'var(--acc)'}"></i></div><em>Elke 4% hitte = −1% kans</em></div>
 </section>
 <div class="cr-mast-how"><b>Vakmanschap</b><span>Elke klus die lukt telt mee voor die klus: na 10 keer <em>Brons</em>, 30 <em>Zilver</em>, 75 <em>Goud</em> en 150 <em>Meester</em>. Elk niveau geeft +2% kans en +5% buit op die klus.</span></div>
 ${best.length?`<div class="tierhead"><h2>Beste voor jou</h2><span>Meeste buit per energiepunt, met jouw kans</span></div><div class="cr-list">${best.map(c=>row(c,true)).join('')}</div>`:''}
 <div class="cr-bar"><span>${avail.length} van de ${CRIMES.length} klussen staan voor je open. Mislukt een klus, dan kun je vluchten of ga je de cel in.</span>
  <div class="filters"><button class="chip-toggle ${crimeShowAll?'':'on'}" onclick="crimeShowAll=false;render()">Tot mijn rang</button><button class="chip-toggle ${crimeShowAll?'on':''}" onclick="crimeShowAll=true;render()">Alle ${CRIMES.length}</button></div></div>
 ${visible.map(t=>{const cs=CRIMES.filter(c=>c.r===t),open=isOpen(t),lock=t>ri,ready=cs.filter(c=>!lock&&!cdLeft(c.id)&&S.energy>=c.en).length;
  return `<button class="cr-tier ${lock?'locked':''} ${open?'open':''}" onclick="crimeOpen[${t}]=${!open};render()"><h2>${RANKS[t][0]}</h2><span>${lock?'Nog '+Math.ceil(RANKS[t][1]-S.xp).toLocaleString('nl-NL')+' XP':cs.length+' klussen · '+ready+' klaar'}</span><i>${open?'−':'+'}</i></button>
  ${open?`<div class="cr-list">${cs.map(c=>row(c,false)).join('')}</div>`:''}`}).join('')}`};
