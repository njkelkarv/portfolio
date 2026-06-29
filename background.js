const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const CONFIG = {
    cell: 14,
    frameOverlap: 4,
    baseColor: [18, 16, 14],
    tileBase: 28,
    tileBrightness: 0.5,
    cursorRadius: 2,
    cursorHeight: 12,
};

const STEP = CONFIG.cell;

// --- Stamps ---

const STAMPS = {
    diagonal_sweep: {
        generate: () => {
            const len = 15 + Math.floor(Math.random() * 10);
            const frames = [];
            for (let i = -len; i <= 0; i++) frames.push([[i, i]]);
            return frames;
        }
    },
    diagonal_sweep_inv: {
        generate: () => {
            const len = 15 + Math.floor(Math.random() * 10);
            const frames = [];
            for (let i = len; i >= 0; i--) frames.push([[i, -i]]);
            return frames;
        }
    },
    star: {
        frames: [
            [[0, 0]],
        ]
    },
    star_burst: {
        frames: [
            [[0, 0]],
            [[-1, 0], [1, 0], [0, -1], [0, 1]],
        ]
    },
    ring_expand: {
        frames: [
            [[0, 0]],
            [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]],
            (() => { const o = []; for (let c = -3; c <= 3; c++) for (let r = -3; r <= 3; r++) { const d = Math.hypot(c, r); if (d > 1.8 && d <= 3.2) o.push([c, r]); } return o; })(),
            (() => { const o = []; for (let c = -5; c <= 5; c++) for (let r = -5; r <= 5; r++) { const d = Math.hypot(c, r); if (d > 3.2 && d <= 5.2) o.push([c, r]); } return o; })(),
        ]
    },
    ring_shrink: {
        frames: [
            (() => { const o = []; for (let c = -5; c <= 5; c++) for (let r = -5; r <= 5; r++) { const d = Math.hypot(c, r); if (d > 3.2 && d <= 5.2) o.push([c, r]); } return o; })(),
            (() => { const o = []; for (let c = -3; c <= 3; c++) for (let r = -3; r <= 3; r++) { const d = Math.hypot(c, r); if (d > 1.8 && d <= 3.2) o.push([c, r]); } return o; })(),
            [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]],
            [[0, 0]],
        ]
    },
};
// --- Phases ---

const PHASES = [
    {
        name: 'diagonals',
        duration: 7000,
        stamps: ['diagonal_sweep', 'diagonal_sweep_inv'],
        spawnMin: 120,
        spawnMax: 300,
        speedMin: 0.018,
        speedMax: 0.028,
        maxHeight: 14,
    },
    {
        name: 'stars',
        duration: 8000,
        stamps: ['star', 'star_burst'],
        spawnMin: 50,
        spawnMax: 150,
        speedMin: 0.03,
        speedMax: 0.06,
        maxHeight: 20,
    },
    {
        name: 'circles',
        duration: 10000,
        stamps: ['ring_expand', 'ring_shrink'],
        spawnMin: 700,
        spawnMax: 1300,
        speedMin: 0.005,
        speedMax: 0.009,
        maxHeight: 10,
    },
];

// --- Phase manager ---

let phaseIndex = 0;
let phaseTimeout = null;

function currentPhase() { return PHASES[phaseIndex]; }

function nextPhase() {
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    // active = [];
    schedulePhase();
}

function schedulePhase() {
    clearTimeout(phaseTimeout);
    phaseTimeout = setTimeout(nextPhase, currentPhase().duration);
}

// --- State ---

let cols, rows, active = [];
let mouse = { x: -9999, y: -9999 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / STEP) + 1;
    rows = Math.ceil(canvas.height / STEP) + 1;
}

function spawn() {
    const phase  = currentPhase();
    const name   = phase.stamps[Math.floor(Math.random() * phase.stamps.length)];
    const stamp  = STAMPS[name];
    const frames = stamp.generate ? stamp.generate() : stamp.frames;
    active.push({
        cx:        Math.floor(Math.random() * cols),
        cy:        Math.floor(Math.random() * rows),
        frameSets: frames.map(f => new Set(f.map(([c, r]) => `${c},${r}`))),
        phase:     0,
        speed:     phase.speedMin + Math.random() * (phase.speedMax - phase.speedMin),
        maxHeight: phase.maxHeight,
    });
}

function schedule() {
    if (!document.hidden) spawn();
    const phase = currentPhase();
    setTimeout(schedule, phase.spawnMin + Math.random() * (phase.spawnMax - phase.spawnMin));
}

// --- Rendering ---

function cursorHeight(col, row) {
    const dx = col - mouse.x / STEP;
    const dy = row - mouse.y / STEP;
    const dist = Math.hypot(dx, dy);
    const r = CONFIG.cursorRadius;
    if (dist >= r) return 0;
    return (1 - dist / r) * CONFIG.cursorHeight;
}

function getHeight(col, row) {
    return cursorHeight(col, row) + active.reduce((sum, a) => {
        const n = a.frameSets.length;
        const key = `${col - a.cx},${row - a.cy}`;
        for (let f = 0; f < n; f++) {
            if (!a.frameSets[f].has(key)) continue;
            const peak = f / n;
            const width = CONFIG.frameOverlap / n;
            const diff = a.phase - peak;
            if (diff >= 0 && diff < width)
                sum += Math.sin((diff / width) * Math.PI) * a.maxHeight;
        }
        return sum;
    }, 0);
}

function drawPixel(x, y, h) {
    const CELL = CONFIG.cell;
    if (h > 0.5) {
        const [r, g, b] = CONFIG.baseColor;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y - h + CELL, CELL, h);
    }
    const bv = CONFIG.tileBase + h * CONFIG.tileBrightness;
    ctx.fillStyle = `rgb(${bv}, ${bv - 3}, ${bv - 6})`;
    ctx.fillRect(x, y - h, CELL, CELL);
}

function draw() {
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++)
            drawPixel(col * STEP, row * STEP, getHeight(col, row));

    for (const a of active) a.phase += a.speed;
    active = active.filter(a => a.phase < 1 + CONFIG.frameOverlap / 2);

    requestAnimationFrame(draw);
}

document.addEventListener('visibilitychange', () => { if (!document.hidden) active = []; });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
window.addEventListener('resize', resize);

resize();
schedulePhase();
schedule();
draw();