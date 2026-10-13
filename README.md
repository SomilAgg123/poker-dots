<p align="center">
  <img src="docs/readme/hero.png" width="100%" alt="Poker Dots. Every card. Two possibilities. A forest-green poker puzzle with 25 spaces, 10 hands, and three gold intersections. Draft, place, connect." />
</p>

<p align="center">
  <strong>A poker puzzle where every card belongs to two hands.</strong><br />
  Draft your cards. Shape the grid. Turn a lucky draw into a clever connection.
</p>

<p align="center">
  <a href="#take-a-seat">Take a seat</a> ·
  <a href="#the-golden-rule">The golden rule</a> ·
  <a href="#under-the-table">Rules &amp; field notes</a>
</p>

| **01 · DRAFT** | **02 · PLACE** | **03 · CONNECT** |
| :--- | :--- | :--- |
| Pick **one of three cards**. The other two stay for your next move. | Find its home on a **5 × 5 grid**. Every row and every column scores. | Build strong hands through the **gold dots**. Make both directions count. |

### The golden rule

> **Two pair or better in both crossing hands = +12 at the dot.**<br />
> Three golden intersections. Three chances to make the whole table work together.

<p align="center">
  <strong>3 market refreshes &nbsp; / &nbsp; 2 card swaps &nbsp; / &nbsp; Your best next move</strong><br />
  <sub>Daily deals · Replayable seeds · Keyboard &amp; touch · No timer · No wagering</sub>
</p>

### Take a seat

```sh
python3 -m http.server 4173
```

Open **[localhost:4173](http://localhost:4173)** and make your first connection. No build step. No account. Just a table full of possibilities.

<details>
<summary><strong>A look at the table ↗</strong></summary>

![Poker Dots desktop gameplay: ivory cards on a forest-green table, a three-card market, and live scoring.](docs/desktop.png)

[See the mobile layout](docs/mobile.png).

</details>

---

### Under the table

The rules, strategy, design decisions, and reproducible checks behind the game.

<details>
<summary><strong>The complete rules · scoring, controls & saved progress</strong></summary>

## How to play

1. Choose one of three face-up market cards, then an empty space on the 5 × 5 table. Your chosen card is replaced from a shuffled standard 52-card deck. Unchosen cards remain available.
2. Build poker hands in **all five rows and all five columns**. Each placed card contributes to two hands. Only complete five-card lines score. Tap a line's score for its hand description.
3. Three gold dots mark row/column intersections (2,2), (3,3), and (4,4). If **both crossing hands are two pair or better**, that dot adds **12 points**. Straights and flushes also qualify.
4. You may **refresh the entire market three times**. All three old market cards leave the deal permanently. You may also **swap two placed cards twice**. Swaps remain available after all 25 spaces are filled.
5. **Bank this table** locks your score and opens your results. There is no timer or losing state. Reach 60 for Sprout, 100 for Bloom, or 150 for Orbit.

| Hand | Points |
|---|---:|
| High card | 0 |
| One pair | 2 |
| Two pair | 5 |
| Three of a kind | 10 |
| Straight | 15 |
| Flush | 20 |
| Full house | 30 |
| Four of a kind | 50 |
| Straight flush | 75 |
| Royal flush | 100 |

Aces are high or low in straights; A–2–3–4–5 is valid, Q–K–A–2–3 is not. Suit order never breaks ties. Each line scores its best category only. The royal-flush category is a ten-through-ace straight flush.

### Controls and persistence

- Mouse/touch: choose a market card, then a grid cell. Swap selects two occupied cells; tap the same first cell again to deselect it.
- Keyboard: **1 / 2 / 3** selects a card and focuses the table. **Arrow keys** move; **Enter / Space** places or selects a swap card. Tab reaches every control. Escape cancels a swap or closes a dialog.
- **Undo** reverses the last placement, refresh, or swap, including its resource cost. Only one action can be undone; banking is final. Undo history is session-only.
- Validated table state and your all-time best save locally. Storage restrictions do not prevent playing. A new table replaces the current save after confirmation when progress exists.
- The daily deal uses the **UTC date**. Fresh shuffles create new seeds. Results include a copyable challenge link (`?deal=SEED`); identical seeds produce identical decks. Choices determine subsequent market draws. Daily deals can be replayed, and this is a friendly score challenge, not a secure competitive leaderboard.

</details>

<details>
<summary><strong>Think two moves ahead · strategy notes</strong></summary>

## Strategy

Start with pairs, but plan both directions. A high-value flush row may be worth more than several isolated pairs; matching suits is often easier when you keep useful cards in the market. Reserve flexible spaces near the gold dots. A two-pair intersection earns 5 + 5 + 12, making cooperative hands valuable without eclipsing rare poker hands.

Do not refresh a market merely because one card is awkward: the other two remain until used. Save exchanges for the full grid, when moving one card can repair two hands and unlock a dot. Check all four affected lines before swapping. You can experiment with one-step Undo, then replay the same seed to compare entire plans.

</details>

<details>
<summary><strong>Run it locally · requirements & setup</strong></summary>

## Run locally

Requires Python 3. From this directory:

```sh
python3 -m http.server 4173
```

Open **http://localhost:4173**. Or run `npm start`. Serve over HTTP rather than opening `index.html` directly: the game uses native JavaScript modules. Node is only required for tests. All fonts, icons, styles, and code are local; gameplay needs no external services.

</details>

<details>
<summary><strong>Give it a home · static hosting & GitHub Pages</strong></summary>

## Hosting

The distributable is only **index.html, app.js, engine.js, style.css, and icon.svg**. Upload these five files together to any static web host. Use the repository root as the source; no build command is required. Relative asset paths work under a project subpath such as `/poker-dots/`. HTTPS enables clipboard copying; when unavailable the game displays the challenge URL for manual copying.

For GitHub Pages, the included **Publish game (manual)** workflow creates a clean five-file artifact. The owner can select **GitHub Actions** as the Pages source in repository settings, then run that workflow from Actions. It intentionally does not deploy automatically. This delivery does not change repository visibility or access settings and does not claim a live hosted URL before publication.

</details>

<details>
<summary><strong>From first deal to final polish · design & iteration</strong></summary>

## Design and iteration notes

- **Persistent market over a forced random draw:** three visible choices allow planning and let players keep a future combination alive. Refreshes trade flexibility for irreversible information loss.
- **Crossing bonuses over betting:** three fixed targets give the board a geography and an original tactical objective, while avoiding real-money mechanics entirely.
- **Two exchanges and a separate bank step:** a completed grid is a final puzzle, not an abrupt ending. Resource counts, undo, explicit replacement confirmation, and live scoring reduce accidental losses.
- **Warm ivory cards, forest felt, gold dots:** suits remain distinguishable by shape as well as color. No image downloads or generated art are needed. Motion is minimal and respects reduced-motion preferences.
- **First visual QA:** found excessive desktop lane gaps from aspect-ratio sizing; made cards fill their lanes. The original mobile layout put the market below the board and demanded repeated scrolling. The revised compact market stays at the top while the board scrolls beneath it.
- **Second usability pass:** made row/column scores tappable for hand explanations, added a 320px layout check and repeatable shared-deal test, and formatted the source for maintenance.
- **Balance check:** across 100 fixed seeds, blindly taking the first card into the next cell scored mean **13.81**, median **13**, range **2–56**. A simple greedy pair/suit/line heuristic scored mean **116.03**, median **113**, range **45–209**, without refreshes or swaps. This supports 100 as an attainable planning target and 150 as a stretch goal; it is a heuristic comparison, not a human difficulty study. Reproduce with `npm run test:balance`.

</details>

<details>
<summary><strong>Show the work · tests & balance evidence</strong></summary>

## Verification

```sh
npm ci
npm test                  # Engine, action guards, saves, 1,000 full games
npm run test:exhaustive    # Every one of 2,598,960 five-card hands
npx playwright install chromium
npm run test:browser      # Desktop + mobile, repeated complete flows
npm run test:balance      # Deterministic baseline / greedy comparison
```

If Chromium is already installed, use `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`. This was the local test path because the browser-download CDN was blocked in the execution environment.

Engine checks cover all ten rankings, ace-low straights, rejected wraparound, deterministic shuffling, immutable transitions, invalid actions, occupied cells, card conservation/uniqueness, refresh/swap limits, completed-game locking, crossing bonus qualification, and malformed save rejection. Exhaustive ranking matches the exact category frequencies: 1,302,540 / 1,098,240 / 123,552 / 54,912 / 10,200 / 5,108 / 3,744 / 624 / 36 / 4.

Browser tests cover onboarding, draft selection, placement, swaps, undo, refresh, save/reload, all 25 placements, final exchanges, banking, results, replay, a second complete game, fresh shuffle, keyboard play, replacement confirmation/cancel, blocked storage, shared-seed reproducibility, score explanations, and horizontal overflow at 390px and 320px. Desktop and mobile screenshots are produced in `test-results/`. Browser coverage is Chromium desktop and touch emulation; physical iOS/Safari and human playtesting remain useful follow-up validation.

`Game checks` runs engine, exhaustive, and browser tests on pushes and pull requests, and retains screenshot evidence as an Actions artifact.

</details>

<details>
<summary><strong>Inside the deck · source map</strong></summary>

## Source map

- `engine.js`: pure seeded deck, state transitions, poker evaluation, score, save validation.
- `app.js`: interaction, rendering, accessibility, local save, dialogs, sharing.
- `style.css`, `index.html`, `icon.svg`: complete responsive interface and local artwork.
- `tests/`: deterministic engine, exhaustive, balance, and browser checks.
- `.github/workflows/`: continuous checks and owner-triggered static hosting.

</details>

---

<p align="center">
  <strong>POKER DOTS</strong><br />
  <sub>An independently built game in a public AI-agent experiment.<br />
  A small experiment in possibility.</sub>
</p>
