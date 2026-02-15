const boardEl = document.getElementById('board');
const overlayEl = document.getElementById('overlay');
const tokenEl = document.getElementById('token');
const rollBtn = document.getElementById('rollBtn');
const answerForm = document.getElementById('answerForm');
const meaningInput = document.getElementById('meaningInput');
const feedbackEl = document.getElementById('feedback');
const wordTextEl = document.getElementById('wordText');
const cellNumberEl = document.getElementById('cellNumber');
const positionEl = document.getElementById('position');
const scoreEl = document.getElementById('score');
const diceEl = document.getElementById('dice');
const statusEl = document.getElementById('status');

const ladders = { 3: 22, 5: 8, 11: 26, 20: 29, 27: 56, 36: 44, 51: 67, 71: 92, 80: 99 };
const snakes = { 17: 4, 19: 7, 21: 9, 43: 34, 54: 31, 62: 18, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79 };

const wordBank = [
  ['abundant', 'plenty'], ['adapt', 'change'], ['admire', 'respect'], ['ambiguous', 'not clear'], ['ancient', 'very old'],
  ['arrange', 'organize'], ['assist', 'help'], ['attempt', 'try'], ['balance', 'steady'], ['benefit', 'good effect'],
  ['benevolent', 'kind and giving'], ['capture', 'catch'], ['cautious', 'careful'], ['celebrate', 'enjoy'], ['certain', 'sure'],
  ['charm', 'attract'], ['clumsy', 'awkward'], ['combine', 'join'], ['comfort', 'make calm'], ['command', 'order'],
  ['compare', 'find differences'], ['complex', 'not simple'], ['conquer', 'win over'], ['consider', 'think about'], ['constant', 'always same'],
  ['construct', 'build'], ['content', 'happy'], ['contrast', 'difference'], ['cooperate', 'work together'], ['courage', 'bravery'],
  ['curious', 'eager to know'], ['decrease', 'become less'], ['defend', 'protect'], ['delicate', 'fragile'], ['demand', 'strong request'],
  ['depend', 'need support'], ['describe', 'tell about'], ['design', 'plan'], ['detect', 'discover'], ['determine', 'decide'],
  ['diligent', 'hardworking'], ['discuss', 'talk about'], ['eloquent', 'speaks clearly'], ['efficient', 'works well'], ['enormous', 'very big'],
  ['enthusiastic', 'full of energy'], ['essential', 'very important'], ['examine', 'inspect'], ['expand', 'grow larger'], ['explore', 'look around'],
  ['famous', 'well known'], ['flexible', 'easy to bend'], ['fortunate', 'lucky'], ['fragile', 'easily broken'], ['frequent', 'happening often'],
  ['formidable', 'very strong'], ['graceful', 'moves smoothly'], ['habitat', 'home place'], ['harmony', 'peaceful agreement'], ['hesitate', 'pause in doubt'],
  ['honest', 'truthful'], ['identify', 'recognize'], ['illuminate', 'light up'], ['improve', 'make better'], ['include', 'contain'],
  ['increase', 'become more'], ['indicate', 'point out'], ['industrious', 'hardworking'], ['inspire', 'encourage'], ['intricate', 'very detailed'],
  ['justice', 'fairness'], ['keen', 'sharp or eager'], ['knowledge', 'what you know'], ['language', 'way of speaking'], ['lucid', 'easy to understand'],
  ['manage', 'handle'], ['measure', 'find size'], ['meticulous', 'very careful'], ['mighty', 'very strong'], ['modern', 'new style'],
  ['naive', 'too trusting'], ['observe', 'watch'], ['obvious', 'easy to see'], ['obsolete', 'out of date'], ['patient', 'calm waiting'],
  ['perplex', 'confuse'], ['precise', 'exact'], ['predict', 'guess future'], ['prefer', 'like more'], ['prepare', 'get ready'],
  ['protect', 'keep safe'], ['rapid', 'very fast'], ['rare', 'not common'], ['resilient', 'bounces back'], ['reduce', 'make less'],
  ['reflect', 'think deeply'], ['reliable', 'can be trusted'], ['resourceful', 'good at solving'], ['rigorous', 'very strict'], ['subtle', 'not obvious']
].map(([word, meaning]) => ({ word, meaning, accepts: meaning.split(/[ ,]+/) }));

let position = 1;
let score = 0;
let awaitingAnswer = false;

function colorForCell(number) {
  const palette = ['#e74c3c', '#f39c12', '#8bc34a', '#4aa3df'];
  const col = (number - 1) % 10;
  return palette[Math.floor(col / 2.5)];
}

function positionToGrid(pos) {
  const rowFromBottom = Math.floor((pos - 1) / 10);
  const indexInRow = (pos - 1) % 10;
  const col = rowFromBottom % 2 === 0 ? indexInRow : 9 - indexInRow;
  const rowTop = 9 - rowFromBottom;
  return { rowTop, col };
}

function positionToPercent(pos) {
  const { rowTop, col } = positionToGrid(pos);
  return { x: (col + 0.5) * 10, y: (rowTop + 0.5) * 10 };
}

function drawBoard() {
  for (let rowTop = 0; rowTop < 10; rowTop += 1) {
    const rowFromBottom = 9 - rowTop;
    const leftToRight = rowFromBottom % 2 === 0;
    for (let i = 0; i < 10; i += 1) {
      const col = leftToRight ? i : 9 - i;
      const num = rowFromBottom * 10 + i + 1;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.gridRow = rowTop + 1;
      cell.style.gridColumn = col + 1;
      cell.style.background = colorForCell(num);

      const number = document.createElement('div');
      number.className = 'cell-number';
      number.textContent = num;

      const word = document.createElement('div');
      word.className = 'cell-word';
      word.textContent = wordBank[num - 1].word;

      cell.append(number, word);
      boardEl.appendChild(cell);
    }
  }
}

function createSvg(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function buildSnakePath(p1, p2, bends = 5, amplitude = 3.2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;

  let d = `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  for (let i = 1; i <= bends; i += 1) {
    const t = i / bends;
    const wave = Math.sin(t * Math.PI * bends) * amplitude;
    const x = p1.x + dx * t + px * wave;
    const y = p1.y + dy * t + py * wave;
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ` L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  return d;
}

function drawSnake(start, end, index) {
  const p1 = positionToPercent(start);
  const p2 = positionToPercent(end);
  const bodyColors = [
    ['#6e1f86', '#b478d8'],
    ['#2a9d4b', '#93de8f'],
    ['#d9534f', '#ffa08a']
  ];
  const palette = bodyColors[index % bodyColors.length];
  const pathData = buildSnakePath(p1, p2, 6, 2.4 + (index % 3) * 0.4);

  const body = createSvg('path');
  body.setAttribute('d', pathData);
  body.setAttribute('fill', 'none');
  body.setAttribute('stroke', palette[0]);
  body.setAttribute('stroke-width', '2.3');
  body.setAttribute('stroke-linecap', 'round');
  overlayEl.appendChild(body);

  const stripes = createSvg('path');
  stripes.setAttribute('d', pathData);
  stripes.setAttribute('fill', 'none');
  stripes.setAttribute('stroke', palette[1]);
  stripes.setAttribute('stroke-width', '1.1');
  stripes.setAttribute('stroke-linecap', 'round');
  stripes.setAttribute('stroke-dasharray', '0.25 1.35');
  overlayEl.appendChild(stripes);

  const head = createSvg('circle');
  head.setAttribute('cx', p1.x);
  head.setAttribute('cy', p1.y);
  head.setAttribute('r', '1.2');
  head.setAttribute('fill', palette[0]);
  overlayEl.appendChild(head);

  const eye = createSvg('circle');
  eye.setAttribute('cx', p1.x + 0.4);
  eye.setAttribute('cy', p1.y - 0.25);
  eye.setAttribute('r', '0.15');
  eye.setAttribute('fill', '#fff');
  overlayEl.appendChild(eye);

  const tongue = createSvg('path');
  tongue.setAttribute('d', `M ${p1.x - 0.8} ${p1.y + 0.2} l -0.9 0.15 m 0.85 -0.15 l -0.22 -0.2 m 0.22 0.2 l -0.12 0.25`);
  tongue.setAttribute('stroke', '#cf2f2f');
  tongue.setAttribute('stroke-width', '0.18');
  tongue.setAttribute('fill', 'none');
  overlayEl.appendChild(tongue);
}

function drawLadder(start, end) {
  const p1 = positionToPercent(start);
  const p2 = positionToPercent(end);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const halfWidth = 1.2;

  const leftStart = { x: p1.x + px * halfWidth, y: p1.y + py * halfWidth };
  const leftEnd = { x: p2.x + px * halfWidth, y: p2.y + py * halfWidth };
  const rightStart = { x: p1.x - px * halfWidth, y: p1.y - py * halfWidth };
  const rightEnd = { x: p2.x - px * halfWidth, y: p2.y - py * halfWidth };

  const rail1 = createSvg('line');
  rail1.setAttribute('x1', leftStart.x);
  rail1.setAttribute('y1', leftStart.y);
  rail1.setAttribute('x2', leftEnd.x);
  rail1.setAttribute('y2', leftEnd.y);
  rail1.setAttribute('stroke', '#8b5a2b');
  rail1.setAttribute('stroke-width', '0.7');
  rail1.setAttribute('stroke-linecap', 'round');

  const rail2 = createSvg('line');
  rail2.setAttribute('x1', rightStart.x);
  rail2.setAttribute('y1', rightStart.y);
  rail2.setAttribute('x2', rightEnd.x);
  rail2.setAttribute('y2', rightEnd.y);
  rail2.setAttribute('stroke', '#8b5a2b');
  rail2.setAttribute('stroke-width', '0.7');
  rail2.setAttribute('stroke-linecap', 'round');

  overlayEl.append(rail1, rail2);

  const rungs = Math.max(4, Math.floor(length / 3));
  for (let i = 1; i < rungs; i += 1) {
    const t = i / rungs;
    const cx = p1.x + dx * t;
    const cy = p1.y + dy * t;

    const rung = createSvg('line');
    rung.setAttribute('x1', cx + px * (halfWidth - 0.1));
    rung.setAttribute('y1', cy + py * (halfWidth - 0.1));
    rung.setAttribute('x2', cx - px * (halfWidth - 0.1));
    rung.setAttribute('y2', cy - py * (halfWidth - 0.1));
    rung.setAttribute('stroke', '#c48a43');
    rung.setAttribute('stroke-width', '0.5');
    rung.setAttribute('stroke-linecap', 'round');
    overlayEl.appendChild(rung);
  }
}

function drawOverlay() {
  Object.entries(ladders).forEach(([start, end]) => drawLadder(Number(start), end));
  Object.entries(snakes).forEach(([start, end], index) => drawSnake(Number(start), end, index));
}

function updateToken() {
  const { x, y } = positionToPercent(position);
  tokenEl.style.left = `${x}%`;
  tokenEl.style.top = `${y}%`;
}

function updateStats() {
  positionEl.textContent = String(position);
  scoreEl.textContent = String(score);
}

function normalized(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

function getWordInfo(pos) {
  return wordBank[pos - 1];
}

function showQuestion() {
  const entry = getWordInfo(position);
  cellNumberEl.textContent = String(position);
  wordTextEl.textContent = entry.word;
  feedbackEl.textContent = '';
  meaningInput.value = '';
  meaningInput.focus();
}

function applySnakeOrLadder() {
  if (ladders[position]) {
    statusEl.textContent = `Great! Ladder up from ${position} to ${ladders[position]}!`;
    position = ladders[position];
    updateToken();
  } else if (snakes[position]) {
    statusEl.textContent = `Oh no! Snake down from ${position} to ${snakes[position]}!`;
    position = snakes[position];
    updateToken();
  }
}

async function autoRoll() {
  if (awaitingAnswer || position >= 100) {
    return;
  }

  rollBtn.disabled = true;
  statusEl.textContent = 'Rolling automatically...';
  let roll = 1;

  for (let i = 0; i < 10; i += 1) {
    roll = Math.floor(Math.random() * 6) + 1;
    diceEl.textContent = String(roll);
    await new Promise((resolve) => setTimeout(resolve, 95));
  }

  if (position + roll <= 100) {
    position += roll;
  } else {
    statusEl.textContent = 'Need exact number to reach 100. Turn skipped!';
  }

  updateToken();
  applySnakeOrLadder();
  updateStats();
  showQuestion();

  awaitingAnswer = true;
  statusEl.textContent = `You landed on ${position}. Write the meaning!`;
}

answerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!awaitingAnswer) {
    return;
  }

  const answer = normalized(meaningInput.value);
  const entry = getWordInfo(position);
  const isCorrect = entry.accepts.some((key) => answer.includes(normalized(key)));

  if (isCorrect) {
    score += 3;
    feedbackEl.textContent = `✅ Correct! "${entry.word}" means ${entry.meaning}. (+3)`;
    feedbackEl.style.color = '#1f8b4c';
  } else {
    score -= 1;
    feedbackEl.textContent = `❌ Not quite. "${entry.word}" means ${entry.meaning}. (-1)`;
    feedbackEl.style.color = '#b9371d';
  }

  updateStats();
  awaitingAnswer = false;

  if (position === 100) {
    statusEl.textContent = `Game complete! Final score: ${score}`;
    rollBtn.disabled = true;
  } else {
    statusEl.textContent = 'Answer submitted! Press Roll for next turn.';
    rollBtn.disabled = false;
  }
});

rollBtn.addEventListener('click', autoRoll);

drawBoard();
drawOverlay();
updateToken();
updateStats();
showQuestion();
