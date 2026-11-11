"use strict";
/* Builds the questions of a stage. A round is {ask, show, options:[{t,ok,label?}], why, hint, say}. No DOM here. */
const ROUNDS_PER_STAGE=8, ROUNDS_MIX=12;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const one=a=>a[Math.floor(Math.random()*a.length)];
const cleanS=s=>s.replace(/[\[\]]/g,'');
const moodOf=l=>l[0];

/* All usable forms of a verb in a mood, at a person. Ambiguous forms are left out. */
function forms(v,label,person,part='να'){
  let list;
  switch(label){
    case 'o':  list=[v.p[person],v.a[person]];break;
    case 'ye': list=[`${part} ${v.p[person]}`];break;
    case 'ya': list=[`${part} ${v.s[person]}`];break;
    case 'y':  list=part==='αν'?[`αν ${v.s[person]}`]:[`${part} ${v.p[person]}`,`${part} ${v.s[person]}`];break;
    case 'pe': list=[v.ie];break;
    case 'pa': list=v.ia;break;
    case 'p':  list=[v.ie,...v.ia];break;
  }
  return list.filter(f=>!AMBIGUOUS.has(f));
}
/* «ας» reads naturally only with εμείς, αυτός, αυτοί. «αν» only with the aorist: «αν γράφεις» looks the same as the indicative */
const particleFor=(person,allowAn=false)=>allowAn&&Math.random()<.2?'αν':person>=2&&Math.random()<.25?'ας':'να';

function balanced(labels,n){
  const out=[];
  while(out.length<n)out.push(...shuffle(labels));
  return shuffle(out.slice(0,n));
}
/* Which verb every known form belongs to. Forms of «εσείς» in the present are not in VERBS. */
const VERB_OF=new Map();
VERBS.forEach((v,i)=>[...v.p,...v.a,...v.s,v.ie,...v.ia].forEach(f=>VERB_OF.set(f,i)));
[['τρώτε','τρώω'],['πίνετε','πίνω'],['γράφετε','γράφω'],['ανοίγετε','ανοίγω']].forEach(([f,l])=>VERB_OF.set(f,VERBS.findIndex(v=>v.p[0]===l)));
function verbsIn(r){
  const text=[r.show||'',...r.options.map(o=>o.t)].join(' ').replace(/<[^>]+>/g,' ').toLowerCase();
  return [...new Set((text.match(/[\u0370-\u03ff]+/g)||[]).filter(w=>VERB_OF.has(w)).map(w=>VERB_OF.get(w)))];
}
/* Remembers what a pass of a stage has shown: a verb never comes back in the same pass, in any form or as a wrong option */
function newPool(){
  const keys=new Set(),verbs=new Set();
  return r=>{
    if(!r||keys.has(r.key))return false;
    const here=verbsIn(r);
    if(here.some(v=>verbs.has(v)))return false;
    keys.add(r.key);here.forEach(v=>verbs.add(v));
    return true;
  };
}
/* Calls make(label) for each round. Starts over in the rare case an early choice leaves nothing for a later one. */
function unique(labels,n,make,base=[]){
  let out=[];
  for(let attempt=0;attempt<100&&out.length<n;attempt++){
    const take=newPool();
    base.forEach(take);
    out=[];
    for(const label of balanced(labels,n)){
      for(let tries=0;tries<200;tries++){
        const r=make(label);
        if(take(r)){out.push(r);break;}
      }
    }
  }
  return out;
}
/* For stages with a fixed list of questions */
const distinct=(list,n,take=newPool())=>{
  const out=[];
  for(const r of list){
    if(out.length===n)break;
    if(take(r))out.push(r);
  }
  return out;
};
const labelOptions=(labels,right)=>labels.map(l=>({t:LABELS[l],ok:l===right,label:l,mood:moodOf(l)}));

/* A stage can narrow the answers with its own labels */
function idWord(level,labels=level.labels){
  return label=>{
    const person=Math.floor(Math.random()*5);
    const list=forms(one(VERBS),label,person,particleFor(person,label==='y'||label==='ya'));
    if(!list.length)return null;
    const form=one(list);
    return {key:form,ask:level.id==='l1'?'Ποια έγκλιση είναι;':'Ποια έγκλιση και ποιος χρόνος είναι;',show:`<span class="word">${form}</span>`,say:form,options:labelOptions(labels,label),why:WHY[label]};
  };
}
function idSent(level,labels=level.labels){
  /* In level 1 the tenses are merged: ye/ya count as y, pe/pa as p */
  const pool=l=>l==='y'?[...SENTENCES.ye,...SENTENCES.ya]:l==='p'?[...SENTENCES.pe,...SENTENCES.pa]:l==='pe'?[...SENTENCES.pe,...SENTENCES.pePlural]:SENTENCES[l];
  return label=>{
    const s=one(pool(label));
    return {key:s,ask:level.id==='l1'?'Ποια έγκλιση είναι το ρήμα με το χρώμα;':'Ποια έγκλιση και ποιος χρόνος είναι το ρήμα με το χρώμα;',show:mark(s),say:cleanS(s),options:labelOptions(labels,label),why:WHY[label]};
  };
}
function pick(level){
  const labels=level.labels;
  return label=>{
    const person=Math.floor(Math.random()*5), part=particleFor(person,level.id==='l1'), v=one(VERBS);
    const per=labels.map(l=>[l,forms(v,l,person,part)]);
    if(per.some(([,list])=>!list.length))return null;
    const right=one(forms(v,label,person,part));
    const others=shuffle(per.filter(([l])=>l!==label)).slice(0,3).map(([l,list])=>({t:one(list),ok:false,label:l}));
    return {key:right,ask:'Βρες τη λέξη που ζητώ:',want:label,options:shuffle([{t:right,ok:true,label},...others]),why:WHY[label]};
  };
}
function fill(level){
  return label=>{
    const [s,right,...wrong]=one(FILL[label]);
    return {key:s,ask:'Βάλε στο κενό:',want:label,show:blank(s),filled:s.replace('___',`<mark>${right}</mark>`),say:s.replace('___','…'),sayDone:s.replace('___',right),
      options:shuffle([{t:right,ok:true},...wrong.map(t=>({t,ok:false}))]),why:WHY[label],hint:`Ψάχνουμε ${LABELS[label].toLowerCase()}. ${WHY[label]}`};
  };
}
function context(stage){
  const list=shuffle(CONTEXT[stage.mood]);
  return list.map(([label,s,right,wrong,why])=>({key:s,ask:'Ποιος χρόνος ταιριάζει εδώ;',show:blank(s),filled:s.replace('___',`<mark>${right}</mark>`),say:s.replace('___','…'),sayDone:s.replace('___',right),
    options:shuffle([{t:right,ok:true},{t:wrong,ok:false}]),why,hint:'Κοίτα τις άλλες λέξεις: γίνεται συχνά ή μία φορά;'}));
}
function traps(level){
  return shuffle(TRAPS).map(([label,s,why,hint])=>({key:s,ask:'Ποια έγκλιση και ποιος χρόνος είναι το ρήμα με το χρώμα;',show:mark(s),say:cleanS(s),options:labelOptions(level.labels,label),why,hint}));
}
function correct(){
  return shuffle(CORRECT).map(([right,wrong,why])=>({key:right,ask:'Ποια πρόταση είναι σωστή;',options:shuffle([{t:right,ok:true},{t:wrong,ok:false}]),why,hint:why}));
}

/* Verbs whose sg imperatives both stand alone, so a transform has one clear answer */
const clearImperative=v=>!AMBIGUOUS.has(v.ie)&&!AMBIGUOUS.has(v.ia[0]);
function transformMood(){
  return ()=>{
    const v=one(VERBS.filter(clearImperative));
    const f={o:v.p[1],y:`να ${v.p[1]}`,p:v.ie};
    const from=one(['o','y','p']), to=one(['o','y','p'].filter(m=>m!==from));
    return {key:f[from]+to,ask:`Κάν' το <b class="m-${to}">${LABELS[to].toLowerCase()}</b>:`,show:`<span class="word">${f[from]}</span>`,say:f[from],
      options:shuffle(['o','y','p'].map(m=>({t:f[m],ok:m===to,label:m}))),why:WHY[to]};
  };
}
function transformSubj(){
  return ()=>{
    const v=one(VERBS), person=Math.floor(Math.random()*5);
    const e=`να ${v.p[person]}`, a=`να ${v.s[person]}`, toAor=Math.random()<.5;
    const from=toAor?e:a, to=toAor?a:e, past=v.a[person];
    return {key:from,ask:`Κάν' το <b class="m-y">${toAor?'αόριστο':'ενεστώτα'}</b>:`,show:`<span class="word">${from}</span>`,say:from,
      options:shuffle([{t:to,ok:true},{t:from,ok:false},{t:past,ok:false,label:'o'}]),why:WHY[toAor?'ya':'ye'],hint:WHY[toAor?'ya':'ye']};
  };
}
function transformImp(){
  return ()=>{
    const v=one(VERBS.filter(clearImperative));
    if(Math.random()<.3){
      return {key:v.ie+'pl',ask:`Κάν' το <b class="m-p">αόριστο</b>, για πολλά παιδιά (εσείς):`,show:`<span class="word">${v.ie}</span>`,say:v.ie,
        options:shuffle([{t:v.ia[1],ok:true},{t:v.ia[0],ok:false},{t:v.ie,ok:false}]),why:WHY.pa,hint:'Θέλουμε αόριστο και τύπο για «εσείς».'};
    }
    const toAor=Math.random()<.5, from=toAor?v.ie:v.ia[0], to=toAor?v.ia[0]:v.ie;
    return {key:v.ie+(toAor?'a':'e'),ask:`Κάν' το <b class="m-p">${toAor?'αόριστο':'ενεστώτα'}</b>:`,show:`<span class="word">${from}</span>`,say:from,
      options:shuffle([{t:to,ok:true},{t:from,ok:false},{t:v.p[1],ok:false,label:'o'}]),why:WHY[toAor?'pa':'pe'],hint:WHY[toAor?'pa':'pe']};
  };
}

function mixRounds(level){
  const makers=[idWord(level),idSent(level),pick(level),fill(level)];
  const take=newPool();
  const fixed=[...distinct(traps(level),2,take),...distinct(correct(),1,take)];
  return shuffle([...fixed,...unique(level.labels,ROUNDS_MIX-3,label=>one(makers)(label),fixed)]);
}

function buildRounds(level,stage){
  const n=ROUNDS_PER_STAGE, L=stage.labels||level.labels;
  switch(stage.kind){
    case 'idWord': return unique(L,n,idWord(level,L));
    case 'idSent': return unique(L,n,idSent(level,L));
    case 'pick':   return unique(L,n,pick(level));
    case 'fill':   return unique(L,n,fill(level));
    case 'context':return context(stage);
    case 'traps':  return distinct(traps(level),10);
    case 'correct':return distinct(correct(),n);
    case 'mix':    return mixRounds(level);
    case 'transform':
      if(level.id==='l1')return unique([0],n,transformMood());
      if(level.id==='l2')return unique([0],n,transformSubj());
      return unique([0],n,transformImp());
  }
  return [];
}
const mark=s=>s.replace(/\[([^\]]+)\]/,'<mark>$1</mark>');
const blank=s=>s.replace('___','<span class="blank">&nbsp;</span>');

