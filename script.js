/* ============================================================
   DINESH KUMAR — PORTFOLIO
   Vanilla JS — no frameworks/libraries.
   Sections: Loader, Cursor, Nav, Reveal, Magnetic, Tilt,
   Hero canvas, Counters, Skill bars, Filters, Before/After,
   Contact form, misc helpers.
   ============================================================ */
(function(){
  "use strict";

  /* ---------- 0. Utility ---------- */
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const isTouch = matchMedia('(hover:none), (pointer:coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    initCursor();
    initNav();
    initRevealObserver();
    initMagnetic();
    initTilt();
    initHeroCanvas();
    initCounters();
    initSkillBars();
    initFilters();
    initBeforeAfter();
    initContactForm();
    initBackToTop();
    initYear();
  }

  /* ---------- 2. Custom cursor (design-tool cursor) ---------- */
  function initCursor(){
    if(isTouch) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const label = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    label.className = 'cursor-label';
    document.body.append(dot, ring, label);

    let mx=0, my=0, rx=0, ry=0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx+'px'; dot.style.top = my+'px';
      label.style.left = mx+'px'; label.style.top = my+'px';
      document.body.classList.add('cursor-active');
    });
    (function loop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.left = rx+'px'; ring.style.top = ry+'px';
      requestAnimationFrame(loop);
    })();

    const setTool = (cls, text) => {
      ring.className = 'cursor-ring' + (cls ? ' '+cls : '');
      label.textContent = text || '';
    };

    $$('a, button, .filter-btn').forEach(el => {
      el.addEventListener('mouseenter', () => setTool('tool-drag', 'click'));
      el.addEventListener('mouseleave', () => setTool('', ''));
    });
    $$('.project-card, .pack-item, .about-portrait').forEach(el => {
      el.addEventListener('mouseenter', () => setTool('tool-view', 'view'));
      el.addEventListener('mouseleave', () => setTool('', ''));
    });
    $$('input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => setTool('tool-text', ''));
      el.addEventListener('mouseleave', () => setTool('', ''));
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
  }

  /* ---------- 3. Navigation ---------- */
  function initNav(){
    const nav = $('.nav');
    if(!nav) return;
    const toggle = $('.nav-toggle');
    const links = $('.nav-links');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive:true });

    if(toggle && links){
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });
      $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
        toggle.classList.remove('active'); links.classList.remove('open');
      }));
    }

    // Highlight current page link
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if(href === path || (path === '' && href === 'index.html')){
        a.classList.add('active');
      }
    });
  }

  /* ---------- 4. Scroll reveal ---------- */
  function initRevealObserver(){
    const items = $$('.reveal');
    if(!items.length) return;
    if(reduceMotion){ items.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
    items.forEach((el,i) => { el.style.setProperty('--i', i%8); io.observe(el); });
  }

  /* ---------- 5. Magnetic buttons ---------- */
  function initMagnetic(){
    if(isTouch || reduceMotion) return;
    $$('.magnetic').forEach(el => {
      let bound = el.getBoundingClientRect();
      el.addEventListener('mouseenter', () => bound = el.getBoundingClientRect());
      el.addEventListener('mousemove', e => {
        const relX = e.clientX - bound.left - bound.width/2;
        const relY = e.clientY - bound.top - bound.height/2;
        el.style.transform = `translate(${relX*0.28}px, ${relY*0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- 6. 3D tilt on project cards ---------- */
  function initTilt(){
    if(isTouch || reduceMotion) return;
    $$('.project-card, .pack-item').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*8).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 7. Hero canvas — floating "layer node" particle field ---------- */
  function initHeroCanvas(){
    const canvas = $('#hero-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const COUNT = window.innerWidth < 700 ? 34 : 64;

    function resize(){
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function make(){
      particles = Array.from({length:COUNT}, () => ({
        x:Math.random()*w, y:Math.random()*h,
        vx:(Math.random()-0.5)*0.25, vy:(Math.random()-0.5)*0.25,
        r:Math.random()*1.6+0.6,
        hue: Math.random() > 0.5 ? '123,92,255' : '63,237,196'
      }));
    }
    function step(){
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > w) p.vx *= -1;
        if(p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},0.55)`;
        ctx.arc(p.x, p.y, p.r*devicePixelRatio, 0, Math.PI*2);
        ctx.fill();
      });
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const a = particles[i], b = particles[j];
          const dx = a.x-b.x, dy = a.y-b.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          const max = 140*devicePixelRatio;
          if(dist < max){
            ctx.strokeStyle = `rgba(140,150,180,${0.09*(1-dist/max)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }
      if(!reduceMotion) requestAnimationFrame(step);
    }
    resize(); make(); step();
    window.addEventListener('resize', () => { resize(); make(); });
  }

  /* ---------- 8. Animated counters ---------- */
  function initCounters(){
    const stats = $$('.stat b[data-count]');
    if(!stats.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now-start)/dur, 1);
        const eased = 1 - Math.pow(1-p, 3);
        el.textContent = (target < 10 ? (target*eased).toFixed(1) : Math.floor(target*eased)) + suffix;
        if(p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ run(e.target); io.unobserve(e.target); } });
    }, { threshold:0.5 });
    stats.forEach(el => io.observe(el));
  }

  /* ---------- 9. Skill progress bars ---------- */
  function initSkillBars(){
    const bars = $$('.skill-bar > i');
    if(!bars.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.style.width = e.target.dataset.pct + '%';
          io.unobserve(e.target);
        }
      });
    }, { threshold:0.4 });
    bars.forEach(b => io.observe(b));
  }

  /* ---------- 10. Work filter tabs ---------- */
  function initFilters(){
    const btns = $$('.filter-btn');
    const cards = $$('[data-cat]');
    if(!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        cards.forEach(card => {
          const show = cat === 'all' || card.dataset.cat === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- 11. Before / after slider ---------- */
  function initBeforeAfter(){
    $$('.ba-slider').forEach(slider => {
      const before = $('.ba-before', slider);
      const handle = $('.ba-handle', slider);
      let dragging = false;

      const setPos = (clientX) => {
        const r = slider.getBoundingClientRect();
        let pct = ((clientX - r.left) / r.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        before.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
        handle.style.left = pct + '%';
      };
      slider.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
      window.addEventListener('mousemove', e => { if(dragging) setPos(e.clientX); });
      window.addEventListener('mouseup', () => dragging = false);
      slider.addEventListener('touchstart', e => setPos(e.touches[0].clientX), {passive:true});
      slider.addEventListener('touchmove', e => setPos(e.touches[0].clientX), {passive:true});
    });
  }

  /* ---------- 12. Contact form (client-side only demo submit) ---------- */
  function initContactForm(){
    const form = $('#contact-form');
    if(!form) return;
    const msg = $('.form-msg', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#c-name').value.trim();
      if(!name){ msg.textContent = 'Please add your name before sending.'; return; }
      msg.textContent = 'Sending…';
      setTimeout(() => {
        msg.textContent = `Thanks ${name.split(' ')[0]} — message received. I reply within 24 hours.`;
        form.reset();
      }, 900);
    });
  }

  /* ---------- 13. Back to top ---------- */
  function initBackToTop(){
    $$('.back-top').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top:0, behavior:'smooth' });
      });
    });
  }

  /* ---------- 14. Footer year ---------- */
  function initYear(){
    $$('.js-year').forEach(el => el.textContent = new Date().getFullYear());
  }

})();
