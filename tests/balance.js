import {
  newGame,
  act,
  score,
  cardRank,
  cardSuit,
  rankHand,
} from "../engine.js";
function potential(cards) {
  const c = cards.filter((x) => x !== null);
  if (c.length === 5) return rankHand(c).points;
  const counts = {};
  for (const v of c) counts[cardRank(v)] = (counts[cardRank(v)] || 0) + 1;
  return (
    Object.values(counts).reduce((s, n) => s + n * (n - 1) * 1.8, 0) +
    (c.length > 1 && c.every((v) => cardSuit(v) === cardSuit(c[0]))
      ? c.length * 1.5
      : 0)
  );
}
const samples = { baseline: [], greedy: [] };
for (let n = 0; n < 100; n++)
  for (const policy of Object.keys(samples)) {
    let s = newGame(`balance-${n}`);
    for (let turn = 0; turn < 25; turn++) {
      let best = -Infinity,
        action;
      for (let i = 0; i < 25; i++) {
        if (s.board[i] !== null) continue;
        for (let p = 0; p < 3; p++) {
          if (policy === "baseline") {
            action = { type: "place", cell: i, pick: 0 };
            break;
          }
          const b = s.board.slice();
          b[i] = s.market[p];
          let value = 0;
          for (let r = 0; r < 5; r++) {
            value += potential(b.slice(r * 5, r * 5 + 5));
            value += potential(
              Array.from({ length: 5 }, (_, c) => b[c * 5 + r]),
            );
          }
          value += score(b).links.filter(Boolean).length * 12;
          if (value > best) {
            best = value;
            action = { type: "place", cell: i, pick: p };
          }
        }
        if (policy === "baseline" && action) break;
      }
      s = act(s, action);
    }
    samples[policy].push(score(s.board).total);
  }
for (const [policy, scores] of Object.entries(samples)) {
  scores.sort((a, b) => a - b);
  console.log(
    policy,
    JSON.stringify({
      games: scores.length,
      min: scores[0],
      median: scores[50],
      mean: scores.reduce((a, b) => a + b) / scores.length,
      max: scores.at(-1),
    }),
  );
}
