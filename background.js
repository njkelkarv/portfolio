
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const CONFIG = {
    cell: 14,
    maxHeight: 8,
    frameOverlap: 4,
    speedMin: 0.008,      // slowest stamp animation
    speedMax: 0.01,       // fastest stamp animation
    spawnMin: 600,        // ms between spawns (min)
    spawnMax: 800,        // ms between spawns (max)
    baseColor: [18, 16, 14],
    tileBase: 28,         // base brightness of tile top face
    tileBrightness: 0.5,  // brightness gain per unit of height
};

const STEP = CONFIG.cell;

const STAMPS = [
    {
        name: 'cross_grow', enabled: true, frames: [
            [[0, 0]],
            [[-1, 0], [1, 0], [0, -1], [0, 1]],
            [[-2, 0], [2, 0], [0, -2], [0, 2]],
            [[-3, 0], [3, 0], [0, -3], [0, 3]],
            [[-4, 0], [4, 0], [0, -4], [0, 4]],
        ]
    },
    {
        name: 'ring_expand', enabled: true, frames: [
            [[0, 0]],
            [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]],
            (() => { const o = []; for (let c = -2; c <= 2; c++)for (let r = -2; r <= 2; r++) { const d = Math.hypot(c, r); if (d > 1.5 && d <= 2.8) o.push([c, r]); } return o; })(),
            (() => { const o = []; for (let c = -4; c <= 4; c++)for (let r = -4; r <= 4; r++) { const d = Math.hypot(c, r); if (d > 2.8 && d <= 4.2) o.push([c, r]); } return o; })(),
        ]
    },
    {
        name: 'diamond_grow', enabled: true, frames: [
            [[0, 0]],
            [[-1, 0], [1, 0], [0, -1], [0, 1]],
            [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]],
            [[-3, 0], [3, 0], [0, -3], [0, 3], [-2, -1], [2, -1], [-2, 1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]],
        ]
    },
    {
        name: 'diagonal_sweep', enabled: true, frames: [
            [[-4, -4]],
            [[-3, -3]],
            [[-2, -2]],
            [[-1, -1]],
            [[0, 0]],
            [[1, 1]],
            [[2, 2]],
            [[3, 3]],
            [[4, 4]],
        ]
    },
    {
        name: 'corners_close', enabled: true, frames: [
            [[-5, -5], [5, -5], [-5, 5], [5, 5]],
            [[-4, -4], [4, -4], [-4, 4], [4, 4]],
            [[-3, -3], [3, -3], [-3, 3], [3, 3]],
            [[-2, -2], [2, -2], [-2, 2], [2, 2]],
            [[-1, -1], [1, -1], [-1, 1], [1, 1]],
            [[0, 0]],
        ]
    },
];

let cols, rows, active = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / STEP) + 1;
    rows = Math.ceil(canvas.height / STEP) + 1;
}

function spawn() {
    const pool = STAMPS.filter(s => s.enabled);
    if (!pool.length) return;
    const stamp = pool[Math.floor(Math.random() * pool.length)];
    active.push({
        cx: Math.floor(Math.random() * cols),
        cy: Math.floor(Math.random() * rows),
        frameSets: stamp.frames.map(f => new Set(f.map(([c, r]) => `${c},${r}`))),
        phase: 0,
        speed: CONFIG.speedMin + Math.random() * (CONFIG.speedMax - CONFIG.speedMin),
    });
}

function getHeight(col, row) {
    return active.reduce((sum, a) => {
        const n = a.frameSets.length;
        const key = `${col - a.cx},${row - a.cy}`;
        for (let f = 0; f < n; f++) {
            if (!a.frameSets[f].has(key)) continue;
            const peak = f / n;
            const width = CONFIG.frameOverlap / n;
            const diff = a.phase - peak;
            if (diff >= 0 && diff < width)
                sum += Math.sin((diff / width) * Math.PI) * CONFIG.maxHeight;
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

function schedule() {
    spawn();
    setTimeout(schedule, CONFIG.spawnMin + Math.random() * (CONFIG.spawnMax - CONFIG.spawnMin));
}

window.addEventListener('resize', resize);
resize();
schedule();
draw();