import {SUITS,NAMES,POINTS,DOTS,cardRank,cardSuit,cardLabel,newGame,score,act,validSave} from './engine.js';
const $=id=>document.getElementById(id);
const dailySeed=()=>`daily-${new Date().toISOString().slice(0,10)}`;
const freshSeed=()=>`shuffle-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Play remains available without storage. */}};
const challenge=new URLSearchParams(location.search).get('deal')?.slice(0,100);
const saved=read('poker-dots-save',null);
let state=validSave(saved)&&(!challenge||saved.seed===challenge)?saved:newGame(challenge||dailySeed());
let selected=0,swapMode=false,swapFirst=null,previous=null,pendingSeed=null,focusCell=0;
let best=Number(read('poker-dots-best',0))||0;
function cardMarkup(c){const r=cardRank(c);return `<span class="corner">${({11:'J',12:'Q',13:'K',14:'A'})[r]||r}</span><span class="suit" aria-hidden="true">${SUITS[cardSuit(c)]}</span><span class="small-suit" aria-hidden="true">${SUITS[cardSuit(c)]}</span>`;}
function announce(text){$('message').textContent=text;}
function render(message){
 const result=score(state.board),filled=state.board.filter(c=>c!==null).length,full=filled===25;
 $('modeLabel').textContent=state.seed.startsWith('daily-')?'THE DAILY DEAL':'YOUR SHARED DEAL';$('seedLabel').textContent=state.seed.replace(/^daily-/,'');
 $('turnLabel').textContent=state.finished?'TABLE BANKED':full?'FINAL TOUCHES':`YOUR TABLE · ${filled} / 25 PLACED`;
 $('total').textContent=result.total;$('best').textContent=`BEST ${best||'—'}`;
 const bonus=result.links.filter(Boolean).length*12;
 $('handPoints').textContent=`${result.total-bonus} hand points`;$('dotPoints').textContent=`+${bonus} dot bonus`;
 $('progress').style.width=`${Math.min(100,result.total/150*100)}%`;$('linkCount').textContent=`${bonus/12} / 3 dots connected`;
 for(const [id,hands,prefix] of [['colScores',result.cols,'Column'],['rowScores',result.rows,'Row']]){
  $(id).innerHTML=hands.map((h,i)=>`<div class="line-score ${h?'scored':''}" title="${prefix} ${i+1}: ${h?`${h.name}, ${h.points} points`:'incomplete'}" aria-label="${prefix} ${i+1}: ${h?`${h.name}, ${h.points} points`:'incomplete'}"><strong>${h?`+${h.points}`:'·'}</strong></div>`).join('');
 }
 $('board').innerHTML=state.board.map((c,i)=>{
 const dot=DOTS.indexOf(i),linked=dot>=0&&result.links[dot];
 return `<button class="cell ${c===null?'empty':`card ${[1,3].includes(cardSuit(c))?'red':''}`} ${dot>=0?'dot':''} ${linked?'linked':''} ${swapFirst===i?'swap-target':''}" data-cell="${i}" aria-label="Row ${Math.floor(i/5)+1}, column ${i%5+1}: ${c===null?'empty':cardLabel(c)}${dot>=0?', gold dot':''}" ${state.finished?'disabled':''}>${c===null?(dot>=0?'✦':'+'):cardMarkup(c)}</button>`;
 }).join('');
 $('market').innerHTML=state.market.map((c,i)=>`<button class="card ${[1,3].includes(cardSuit(c))?'red':''} ${selected===i&&!swapMode?'selected':''}" data-pick="${i}" aria-label="Choose ${cardLabel(c)}, key ${i+1}" aria-pressed="${selected===i&&!swapMode}" ${full||state.finished?'disabled':''}>${cardMarkup(c)}</button>`).join('');
 $('remaining').textContent=full?'25 / 25':`${String(filled+1).padStart(2,'0')} / 25`;
 $('draftTitle').textContent=state.finished?'A table to remember':full?'Make it yours':'Pick your possibility';
 $('draftHint').textContent=state.finished?'Replay this deal or discover a new one.':swapMode?'Choose two placed cards to exchange.':full?'Use any swaps, then bank your score.':'Choose a card, then an empty space.';
 $('reroll').innerHTML=`Refresh market <span>${state.rerolls} left</span>`;$('reroll').disabled=!state.rerolls||full||state.finished;
 $('swap').innerHTML=swapMode?'Cancel swap':`Swap <span>${state.swaps} left</span>`;$('swap').disabled=!state.swaps||filled<2||state.finished;$('swap').setAttribute('aria-pressed',String(swapMode));
 $('undo').disabled=!previous||state.finished;$('bank').hidden=!full||state.finished;
 if(message)announce(message);
 write('poker-dots-save',state);
}
function move(action){const next=act(state,action);if(next===state)return false;previous=structuredClone(state);state=next;return true;}
function place(cell){
 if(state.finished)return;
 focusCell=cell;
 if(swapMode){if(state.board[cell]===null){announce('Choose a placed card to swap.');return;}
 if(swapFirst===null){swapFirst=cell;render('Now choose a second placed card.');}
 else if(swapFirst===cell){swapFirst=null;render('Choose two different cards.');}
 else{move({type:'swap',a:swapFirst,b:cell});swapMode=false;swapFirst=null;render('Cards exchanged. Both crossing hands have been recalculated.');}
 }else if(move({type:'place',cell,pick:selected})){
 render(state.board.every(c=>c!==null)?'Your grid is full. Make final swaps, then bank your table.':`${cardLabel(state.board[cell])} placed. Choose your next card.`);
 }else announce('That space is occupied. Use Swap to exchange placed cards.');
 $('board').querySelector(`[data-cell="${cell}"]`)?.focus({preventScroll:true});
}
$('board').addEventListener('click',e=>{const b=e.target.closest('[data-cell]');if(b)place(Number(b.dataset.cell));});
$('board').addEventListener('focusin',e=>{if(e.target.dataset.cell)focusCell=Number(e.target.dataset.cell);});
$('market').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(!b)return;selected=Number(b.dataset.pick);swapMode=false;swapFirst=null;render(`${cardLabel(state.market[selected])} selected. Choose an empty space.`);$('market').children[selected].focus({preventScroll:true});});
$('reroll').onclick=()=>{if(move({type:'reroll'})){swapMode=false;swapFirst=null;render('Three new possibilities. Refreshed cards leave this deal.');}};
$('swap').onclick=()=>{swapMode=!swapMode;swapFirst=null;render(swapMode?'Choose the first of two placed cards to swap.':'Swap cancelled. Choose a card from the market.');};
$('undo').onclick=()=>{if(previous){state=previous;previous=null;swapMode=false;swapFirst=null;render('Last action undone.');}};
function showResult(){const r=score(state.board);$('resultTitle').textContent=r.total>=150?'You’re in orbit.':r.total>=100?'In full bloom.':r.total>=60?'Room to grow.':'Every table teaches.';$('resultScore').textContent=r.total;$('resultDetails').textContent=`${r.links.filter(Boolean).length} dots connected · ${r.rows.concat(r.cols).filter(h=>h.tier>=2).length} hands with two pair or better.`;$('resultSeed').textContent=`Deal: ${state.seed}`;$('shareStatus').textContent='';$('result').showModal();}
$('bank').onclick=()=>{if(move({type:'finish'})){best=Math.max(best,score(state.board).total);write('poker-dots-best',best);previous=null;render('Table banked. Replay the same deal to explore a different path.');showResult();}};
function start(seed){state=newGame(seed);selected=0;previous=null;swapMode=false;swapFirst=null;const url=new URL(location.href);url.searchParams.set('deal',seed);history.replaceState(null,'',url);document.querySelectorAll('dialog[open]').forEach(d=>d.close());render('Start anywhere. Pairs are a reliable foundation; gold dots reward stronger intersections.');}
function requestNew(seed){if(!state.finished&&state.board.some(c=>c!==null)){pendingSeed=seed;$('confirm').showModal();}else start(seed);}
$('daily').onclick=()=>requestNew(dailySeed());$('new').onclick=()=>requestNew(freshSeed());$('cancelNew').onclick=()=>$('confirm').close();$('confirmNew').onclick=()=>start(pendingSeed);$('replay').onclick=()=>start(state.seed);$('resultNew').onclick=()=>start(freshSeed());
$('share').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('deal',state.seed);const text=`Poker Dots: I scored ${score(state.board).total}. Same cards, your possibilities. ${url.href}`;try{await navigator.clipboard.writeText(text);$('shareStatus').textContent='Challenge copied. Send it to a friend.';}catch{$('shareStatus').textContent=`Copy this link: ${url.href}`;}};
$('rulesButton').onclick=()=>$('rules').showModal();$('letsPlay').onclick=()=>{$('rules').close();write('poker-dots-onboarded',true);};
for(const b of document.querySelectorAll('.close'))b.onclick=()=>b.closest('dialog').close();
$('rankTable').innerHTML=NAMES.map((name,i)=>`<div><span>${name}</span><b>${POINTS[i]}</b></div>`).join('');
window.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||state.finished)return;
 if(['1','2','3'].includes(e.key)&&state.board.includes(null)){selected=Number(e.key)-1;swapMode=false;swapFirst=null;render(`${cardLabel(state.market[selected])} selected.`);$('board').children[focusCell].focus({preventScroll:true});e.preventDefault();}
 const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5};
 if(e.key in offsets&&document.activeElement?.dataset.cell!==undefined){e.preventDefault();focusCell=(focusCell+offsets[e.key]+25)%25;$('board').children[focusCell].focus({preventScroll:true});}
 if(e.key==='Escape'&&swapMode){swapMode=false;swapFirst=null;render('Swap cancelled.');}
});
render(state.finished?'Your banked table. Start a fresh shuffle or replay the daily deal.':'Start anywhere. Each card will score in two hands.');
if(!read('poker-dots-onboarded',false))$('rules').showModal();
