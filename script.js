window.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. GLOBAL VISUAL CONTROLS & RETICLE TRACKER
  // ==========================================
  const reticle = document.getElementById('cursorReticle');
  const reticleLabel = document.getElementById('reticleLabel');
  window.addEventListener('mousemove', (e) => {
    if (reticle && reticleLabel) {
      reticle.style.left = `${e.clientX}px`;
      reticle.style.top = `${e.clientY}px`;
      reticleLabel.textContent = `${String(e.clientX).padStart(3, '0')},${String(e.clientY).padStart(3, '0')}`;
    }
  });

  const halftoneToggleBtn = document.getElementById('halftoneToggleBtn');
  if (halftoneToggleBtn) {
    halftoneToggleBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('halftone-on');
      halftoneToggleBtn.classList.toggle('active', active);
      halftoneToggleBtn.textContent = `HALFTONE: ${active ? 'ON' : 'OFF'}`;
    });
  }

  const invertBtn = document.getElementById('invertBtn');
  if (invertBtn) {
    invertBtn.addEventListener('click', () => {
      document.body.classList.toggle('inverted');
    });
  }

  const glitchBtn = document.getElementById('glitchBtn');
  if (glitchBtn) {
    glitchBtn.addEventListener('click', (e) => {
      const active = document.body.classList.toggle('glitch-active');
      e.target.classList.toggle('active', active);
      e.target.textContent = `GLITCH: ${active ? 'ON' : 'OFF'}`;
    });
  }

  function getFgColor() {
    return document.body.classList.contains('inverted') ? '#0a0a0a' : '#f2f2f2';
  }

  // Inline Word Interactions
  document.querySelectorAll('.word-redact').forEach(w => {
    w.addEventListener('click', () => {
      w.classList.toggle('revealed');
    });
  });

  document.querySelectorAll('.word-bloom').forEach(el => {
    el.addEventListener('click', () => {
      const sec = el.closest('section');
      if (sec) {
        const readout = sec.querySelector('.micro-readout');
        if (readout) readout.textContent = `> ${el.dataset.note}`;
      }
    });
  });

  const glyphs = '01█▓▒░/\\+=-*#';
  document.querySelectorAll('.word-scramble').forEach(el => {
    const original = el.textContent;
    const alt = el.dataset.alt;
    let toggled = false;
    el.addEventListener('mouseenter', () => {
      toggled = !toggled;
      const target = toggled ? alt : original;
      let iter = 0;
      const iv = setInterval(() => {
        el.textContent = target.split('').map((c, i) => i < iter ? target[i] : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
        if (iter >= target.length) clearInterval(iv);
        iter += 0.5;
      }, 22);
    });
  });

  // ==========================================
  // SECTION 01: WIND-REACTIVE L-SYSTEM CANOPY
  // ==========================================
  (function initChamber1() {
    const canvas = document.getElementById('canvas-1');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let wind = 0;
    let targetWind = 0;
    let seed = 1.2;

    function resize() {
      canvas.width = canvas.clientWidth || 500;
      canvas.height = canvas.clientHeight || 320;
    }
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      targetWind = ((e.clientX - rect.left) / rect.width - 0.5) * 0.85;
    });

    canvas.addEventListener('click', () => {
      seed = Math.random() * 6;
    });

    function drawBranch(x, y, len, angle, depth) {
      if (depth === 0) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = depth * 0.6;
      ctx.stroke();

      if (depth <= 2) {
        ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
      }

      const spread = 0.38 + Math.sin(seed + depth) * 0.1;
      drawBranch(x2, y2, len * 0.76, angle - spread + wind, depth - 1);
      drawBranch(x2, y2, len * 0.76, angle + spread + wind, depth - 1);
    }

    function animate() {
      wind += (targetWind - wind) * 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = getFgColor();
      ctx.fillStyle = getFgColor();
      drawBranch(canvas.width / 2, canvas.height - 15, canvas.height * 0.22, -Math.PI / 2, 8);
      requestAnimationFrame(animate);
    }
    animate();
  })();

  // ==========================================
  // SECTION 02: INTERACTIVE CIRCUIT NODE PATCHBAY
  // ==========================================
  (function initChamber2() {
    const canvas = document.getElementById('canvas-2');
    const statusEl = document.getElementById('circuitStatus');
    const resetBtn = document.getElementById('resetCircuitBtn');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let activePath = [];

    function generateNodes() {
      canvas.width = canvas.clientWidth || 500;
      canvas.height = canvas.clientHeight || 320;
      nodes = [];
      activePath = [];
      const cols = 4, rows = 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          nodes.push({
            x: (canvas.width / (cols + 1)) * (c + 1),
            y: (canvas.height / (rows + 1)) * (r + 1),
            id: r * cols + c
          });
        }
      }
    }
    window.addEventListener('resize', generateNodes);
    generateNodes();

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      nodes.forEach(n => {
        if (Math.hypot(n.x - mx, n.y - my) < 26) {
          if (!activePath.includes(n)) {
            activePath.push(n);
            if (statusEl) statusEl.textContent = `> ${activePath.length} NODES LINKED`;
          }
        }
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        activePath = [];
        if (statusEl) statusEl.textContent = '';
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fg = getFgColor();
      ctx.strokeStyle = fg;
      ctx.fillStyle = fg;

      if (activePath.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.moveTo(activePath[0].x, activePath[0].y);
        for (let i = 1; i < activePath.length; i++) {
          ctx.lineTo(activePath[i].x, activePath[i].y);
        }
        ctx.stroke();
      }

      nodes.forEach(n => {
        const isLinked = activePath.includes(n);
        ctx.strokeRect(n.x - 9, n.y - 9, 18, 18);
        if (isLinked) {
          ctx.fillRect(n.x - 5, n.y - 5, 10, 10);
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ==========================================
  // SECTION 03: DYNAMIC HALFTONE WAVE RASTERIZER
  // ==========================================
  (function initChamber3() {
    const canvas = document.getElementById('canvas-3');
    const slider = document.getElementById('dotScaleSlider');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let mouseX = -999, mouseY = -999;
    let tick = 0;

    function resize() {
      canvas.width = canvas.clientWidth || 800;
      canvas.height = canvas.clientHeight || 280;
    }
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouseX = -999; });

    function render() {
      tick += 0.05;
      const step = slider ? parseInt(slider.value) : 14;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getFgColor();

      for (let x = step; x < canvas.width; x += step) {
        for (let y = step; y < canvas.height; y += step) {
          const dist = Math.hypot(x - mouseX, y - mouseY);
          const wave = Math.sin(x * 0.02 + y * 0.02 + tick) * 0.5 + 0.5;
          const boost = dist < 110 ? (1 - dist / 110) * (step * 0.45) : 0;
          const radius = Math.max(1, wave * (step * 0.35) + boost);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(render);
    }
    render();
  })();

  // ==========================================
  // SECTION 04: DUAL-LAYER X-RAY SPOTLIGHT
  // ==========================================
  (function initChamber4() {
    const box = document.getElementById('xrayBox');
    const reveal = document.getElementById('xrayReveal');
    if (!box || !reveal) return;

    box.addEventListener('mousemove', (e) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      reveal.style.clipPath = `circle(95px at ${x}px ${y}px)`;
    });
    box.addEventListener('mouseleave', () => {
      reveal.style.clipPath = `circle(0px at 50% 50%)`;
    });
  })();

  // ==========================================
  // SECTION 05: 450-PARTICLE GRAVITY CONSTELLATION
  // ==========================================
  (function initChamber5() {
    const canvas = document.getElementById('canvas-5');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -999, y: -999, down: false };

    function init() {
      canvas.width = canvas.clientWidth || 500;
      canvas.height = canvas.clientHeight || 320;
      particles = Array.from({ length: 450 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2
      }));
    }
    window.addEventListener('resize', init);
    init();

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mousedown', () => { mouse.down = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.down = false; });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getFgColor();

      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 140 && dist > 1) {
          const force = mouse.down ? 0.45 : -0.35;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillRect(p.x, p.y, 2.5, 2.5);
      });
      requestAnimationFrame(animate);
    }
    animate();
  })();

  // ==========================================
  // SECTION 06: 3D WIREFRAME POLYHEDRON
  // ==========================================
  (function initChamber6() {
    const canvas = document.getElementById('canvas-6');
    const readout = document.getElementById('rotationReadout');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angleX = 0.4, angleY = 0.6;
    let isDragging = false, prevX = 0, prevY = 0;

    function resize() {
      canvas.width = canvas.clientWidth || 500;
      canvas.height = canvas.clientHeight || 320;
    }
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      angleY += (e.clientX - prevX) * 0.01;
      angleX += (e.clientY - prevY) * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      [0, -1.7, 0], [0, 1.7, 0]
    ];
    const edges = [
      [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7],[0,8],[1,8],[2,8],[3,8],
      [4,9],[5,9],[6,9],[7,9]
    ];

    function render() {
      if (!isDragging) angleY += 0.008;
      if (readout) readout.textContent = `${Math.round((angleX * 57.3) % 360)}° / ${Math.round((angleY * 57.3) % 360)}°`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = getFgColor();
      ctx.fillStyle = getFgColor();

      const projected = vertices.map(([x, y, z]) => {
        let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
        let z1 = z * Math.cos(angleY) + x * Math.sin(angleY);
        let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + y * Math.sin(angleX);

        const scale = 250 / (4 + z2);
        return [canvas.width / 2 + x1 * scale, canvas.height / 2 + y2 * scale];
      });

      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projected[a][0], projected[a][1]);
        ctx.lineTo(projected[b][0], projected[b][1]);
        ctx.stroke();
      });

      projected.forEach(([px, py]) => ctx.fillRect(px - 3, py - 3, 6, 6));
      requestAnimationFrame(render);
    }
    render();
  })();

  // ==========================================
  // SECTION 07: BOTANICAL IMAGE PIXEL DISSECTOR
  // ==========================================
  (function initChamber7() {
    const canvas = document.getElementById('canvas-7');
    const switchBtn = document.getElementById('switchSpecimenBtn');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let mouseX = -999, mouseY = -999;
    let specimenIndex = 0;

    function resize() {
      canvas.width = canvas.clientWidth || 800;
      canvas.height = canvas.clientHeight || 280;
    }
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouseX = -999; });

    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        specimenIndex = (specimenIndex + 1) % 3;
        switchBtn.textContent = `SPECIMEN 0${specimenIndex + 1}/03`;
      });
    }

    function sampleSpecimen(nx, ny, type) {
      const cx = nx - 0.5;
      const cy = ny - 0.5;
      const r = Math.hypot(cx, cy);
      const angle = Math.atan2(cy, cx);

      if (type === 0) {
        const petals = Math.cos(angle * 6) * 0.14 + 0.28;
        return r < petals && r > 0.04;
      } else if (type === 1) {
        const spine = Math.abs(cx) < 0.015 && Math.abs(cy) < 0.4;
        const ribs = Math.abs(Math.sin(cy * 38)) > 0.65 && Math.abs(cx) < (0.38 - Math.abs(cy) * 0.7);
        return spine || ribs;
      } else {
        const ring1 = Math.abs(r - 0.34) < 0.03;
        const ring2 = Math.abs(r - 0.18) < 0.04;
        const cross = (Math.abs(cx) < 0.01 || Math.abs(cy) < 0.01) && r < 0.42;
        return ring1 || ring2 || cross;
      }
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fg = getFgColor();
      ctx.fillStyle = fg;
      ctx.strokeStyle = fg;

      const baseGrid = 10;
      for (let x = 0; x < canvas.width; x += baseGrid) {
        for (let y = 0; y < canvas.height; y += baseGrid) {
          const dist = Math.hypot(x - mouseX, y - mouseY);
          const nx = x / canvas.width;
          const ny = y / canvas.height;

          if (sampleSpecimen(nx, ny, specimenIndex)) {
            if (dist < 90) {
              const push = (1 - dist / 90) * 14;
              const ang = Math.atan2(y - mouseY, x - mouseX);
              const ox = x + Math.cos(ang) * push;
              const oy = y + Math.sin(ang) * push;
              ctx.strokeRect(ox, oy, baseGrid - 2, baseGrid - 2);
            } else {
              ctx.fillRect(x, y, baseGrid - 1, baseGrid - 1);
            }
          }
        }
      }
      requestAnimationFrame(render);
    }
    render();
  })();

  // ==========================================
  // SECTION 08: MECHANICAL COMBINATION CIPHER LOCK
  // ==========================================
  (function initChamber8() {
    const glyphsList = ['0', '1', 'B', 'T', 'X', '9', 'Z', '?'];
    const dials = document.querySelectorAll('.cipher-dial');
    const lockStatus = document.getElementById('lockStatus');

    dials.forEach(dial => {
      dial.addEventListener('click', () => {
        const currentIdx = glyphsList.indexOf(dial.textContent);
        const nextChar = glyphsList[(currentIdx + 1) % glyphsList.length];
        dial.textContent = nextChar;

        const isMatch = nextChar === dial.dataset.target;
        dial.classList.toggle('matched', isMatch);

        const allUnlocked = Array.from(dials).every(d => d.textContent === d.dataset.target);
        if (allUnlocked && lockStatus) {
          lockStatus.textContent = 'UNLOCKED';
          lockStatus.style.color = getFgColor();
        }
      });
    });
  })();

  // ==========================================
  // SCROLL PROGRESS & CHAPTER INDICATOR
  // ==========================================
  const sections = document.querySelectorAll('.poetry-section');
  const navLinks = document.querySelectorAll('.chapter-nav .nav-link');
  const progressBar = document.getElementById('scrollProgressBar');

  window.addEventListener('scroll', () => {
    let activeId = 'sec-1';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 280) {
        activeId = sec.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }
  });

});