export const SUITS = ['♠','♥','♣','♦'];
export const NAMES = ['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush','Royal flush'];
export const POINTS = [0,2,5,10,15,20,30,50,75,100];
export const DOTS = [6,12,18];
export const cardRank = c => c % 13 + 2;
export const cardSuit = c => Math.floor(c / 13);
export const cardLabel = c => `${({11:'J',12:'Q',13:'K',14:'A'})[cardRank(c)] || cardRank(c)}${SUITS[cardSuit(c)]}`;
export function rankHand(cards) {
  if(cards.length !== 5 || cards.some(c=>c===null)) return null;
  const ranks=cards.map(cardRank).sort((a,b)=>a-b);
  const counts=Object.values(ranks.reduce((o,r)=>(o[r]=(o[r]||0)+1,o),{})).sort((a,b)=>b-a);
  const flush=cards.every(c=>cardSuit(c)===cardSuit(cards[0]));
  const straight=new Set(ranks).size===5 && (ranks[4]-ranks[0]===4 || ranks.join(',')==='2,3,4,5,14');
  const tier=straight&&flush?(ranks[0]===10?9:8):counts[0]===4?7:counts[0]===3&&counts[1]===2?6:flush?5:straight?4:counts[0]===3?3:counts[0]===2&&counts[1]===2?2:counts[0]===2?1:0;
  return {tier,name:NAMES[tier],points:POINTS[tier]};
}
export function seededRandom(seed) {
  let a=2166136261; for(const ch of seed) a=Math.imul(a^ch.charCodeAt(0),16777619);
  return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
export function newGame(seed) {
 const deck=Array.from({length:52},(_,i)=>i),rng=seededRandom(seed);
 for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 return {version:1,seed,board:Array(25).fill(null),market:deck.splice(0,3),deck,discard:[],swaps:2,rerolls:3,finished:false};
}
export function score(board) {
 const rows=Array.from({length:5},(_,r)=>rankHand(board.slice(r*5,r*5+5)));
 const cols=Array.from({length:5},(_,c)=>rankHand(Array.from({length:5},(_,r)=>board[r*5+c])));
 const links=DOTS.map(i=>(rows[Math.floor(i/5)]?.tier>=2 && cols[i%5]?.tier>=2));
 return {rows,cols,links,total:[...rows,...cols].reduce((sum,h)=>sum+(h?.points||0),0)+links.filter(Boolean).length*12};
}
export function act(state, action) {
 const s=structuredClone(state); if(s.finished) return state;
 if(action.type==='place') {
  if(!Number.isInteger(action.cell)||action.cell<0||action.cell>24||s.board[action.cell]!==null||!Number.isInteger(action.pick)||action.pick<0||action.pick>=s.market.length)return state;
  s.board[action.cell]=s.market[action.pick];s.market.splice(action.pick,1);if(s.deck.length)s.market.push(s.deck.shift());
 } else if(action.type==='swap') {
  const {a,b}=action;if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>24||b>24||a===b||s.board[a]===null||s.board[b]===null||!s.swaps)return state;
  [s.board[a],s.board[b]]=[s.board[b],s.board[a]];s.swaps--;
 } else if(action.type==='reroll') {
  if(!s.rerolls||s.deck.length<3||s.board.every(c=>c!==null))return state;
  s.discard.push(...s.market);s.market=s.deck.splice(0,3);s.rerolls--;
 } else if(action.type==='finish') {
  if(s.board.some(c=>c===null))return state;s.finished=true;
 } else return state;
 return s;
}
export function validSave(s) {
 if(!s||s.version!==1||typeof s.seed!=='string'||s.seed.length>100||!Array.isArray(s.board)||s.board.length!==25||!Array.isArray(s.market)||s.market.length!==3||!Array.isArray(s.deck)||!Array.isArray(s.discard)||typeof s.finished!=='boolean'||![0,1,2].includes(s.swaps)||![0,1,2,3].includes(s.rerolls))return false;
 const cards=[...s.board.filter(c=>c!==null),...s.market,...s.deck,...s.discard];
 return cards.length===52&&new Set(cards).size===52&&cards.every(c=>Number.isInteger(c)&&c>=0&&c<52)&&(!s.finished||s.board.every(c=>c!==null));
}
