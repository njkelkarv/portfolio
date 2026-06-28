const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 72;
const particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function rand(min, max) { return Math.random() * (max - min) + min; }

function createParticle() {
    return {
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        r: rand(0.8, 2.8),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.12, 0.12),
        opacity: rand(0.1, 0.45),
    };
}

function init() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
}

function drawConnections() {
    const threshold = 160;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < threshold) {
                const alpha = (1 - dist / threshold) * 0.40;
                ctx.strokeStyle = `rgba(200, 190, 175, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0d0c0b');
    grad.addColorStop(1, '#1a1612');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawConnections();

    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 200, 185, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
    }

    requestAnimationFrame(draw);
}

window.addEventListener('resize', () => { resize(); init(); });
resize();
init();
draw();