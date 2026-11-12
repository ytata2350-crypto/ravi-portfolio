/* JavaScript / V14 alert renderer / isolated local portfolio demonstration */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const ritual = $('ritual');
  const follow = $('follow-card');
  const channel = 'ravi-alert-preview';
  let frame = 0;
  let startedAt = 0;
  let elapsed = 0;
  let paused = false;
  let current = null;
  let requestId = 0;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const durations = { follow: 5000, sub: 14000, bits: 10000, donate: 8000 };
  const titles = { sub: 'O PACTO FOI FIRMADO', bits: 'CHUVA DE BITS', donate: 'TRIBUTO RECEBIDO' };
  const crystal = '<svg viewBox="0 0 100 140" aria-hidden="true"><path d="M50 3L96 86 50 137 4 86Z" fill="#4b091d" stroke="#ffd1ca" stroke-width="2"/><path d="M50 3L50 87 4 86Z" fill="#ff6d78"/><path d="M50 3L96 86 50 87Z" fill="#e52646"/><path d="M4 86L50 105 50 137Z" fill="#c51839"/><path d="M96 86L50 105 50 137Z" fill="#510b24"/><path d="M4 86L50 60 96 86 50 105Z" fill="#ffe1cf"/><path d="M50 60L50 105 96 86Z" fill="#ff465d"/><path d="M50 3L50 60M4 86L50 105 96 86" fill="none" stroke="#ffaca5" stroke-width="1.5"/></svg>';

  function report(state) {
    parent.postMessage({ channel, state, type: current, requestId }, '*');
  }
  function resize() {
    const host = $('viewport');
    const scale = Math.min(host.clientWidth / 1200, host.clientHeight / 720);
    $('scene').style.transform = `translate(-50%,-50%) scale(${scale})`;
  }
  new ResizeObserver(resize).observe($('viewport'));
  resize();

  for (let i = 0; i < 32; i++) {
    const ember = document.createElement('i');
    ember.className = 'ember';
    ember.style.cssText = `--x:${150 + i * 29}px;--y:${390 + (i % 5) * 35}px;--size:${2 + i % 3}px;--delay:${.8 + i % 9 * .21}s;--dx:${(i % 2 ? 1 : -1) * (20 + i * 2)}px`;
    $('particles').append(ember);
  }
  $('main-crystal').innerHTML = crystal;
  for (let i = 0; i < 22; i++) {
    const drop = document.createElement('div');
    drop.className = 'falling-crystal';
    drop.innerHTML = crystal;
    drop.style.cssText = `--cx:${410 + (i * 73) % 650}px;--cy:${-100 - (i % 4) * 60}px;--cs:${25 + (i * 11) % 40}px;--cd:${.15 + (i % 8) * .12}s;--travel:${350 + (i % 4) * 60}px;--spin:${(i % 2 ? 1 : -1) * (15 + i % 4 * 12)}deg`;
    $('crystal-rain').append(drop);
  }
  function createBat(className, style) {
    const bat = document.createElement('div');
    bat.className = `bat ${className}`;
    bat.style.cssText = style;
    const sprite = document.createElement('span');
    sprite.className = 'bat-sprite';
    bat.append(sprite);
    $('bats').append(bat);
  }
  function buildSwarm() {
    const veil = document.createElement('div');
    veil.className = 'swarm-veil';
    $('bats').append(veil);
    for (let i = 0; i < 3; i++) {
      createBat('herald', `--w:${230 + i * 25}px;--x:${220 + i * 245}px;--y:${230 + (i === 1 ? -60 : 30)}px;--delay:${i * .14}s;--r:${(i - 1) * 12}deg;--dx:${(i - 1) * 260}px;--dy:-220px`);
    }
    for (let i = 0; i < 84; i++) {
      const col = i % 12, row = Math.floor(i / 12), side = col < 6 ? -1 : 1;
      createBat('swarm', `--w:${190 + (i * 17) % 85}px;--x:${25 + col * 83 + (i * 37 % 51) - 25}px;--y:${80 + row * 74 + (i * 23 % 39) - 19}px;--delay:${.8 + (i % 3) * .16 + (i % 7) * .02}s;--flight:${4.1 + (i % 3) * .18}s;--mx:${side * (30 + (i * 13) % 65)}px;--my:${(i * 29) % 85 - 42}px;--r:${(i % 5 - 2) * 8}deg;--sx:${side * (350 + i % 4 * 90)}px;--sy:${row < 3 ? -300 : 300}px;--dx:${side * (650 + i % 6 * 65)}px;--dy:${(row - 3) * 150}px;--flap:${.34 + i % 4 * .045}s;--phase:${-(i % 11) * .053}s`);
    }
  }
  function reset(notify = true) {
    cancelAnimationFrame(frame);
    frame = 0;
    ritual.className = '';
    follow.className = '';
    $('bats').replaceChildren();
    paused = false;
    root.dataset.paused = 'false';
    current = null;
    elapsed = 0;
    if (notify) report('stopped');
  }
  function tick(now) {
    if (!current || paused) return;
    const time = elapsed + now - startedAt;
    if (current === 'bits' && !reduced) {
      const fraction = Math.min(1, Math.max(0, (time - 2350) / 950));
      $('hero-value').textContent = Math.round(1500 * (1 - (1 - fraction) ** 3)).toLocaleString('pt-BR');
    }
    if (time >= durations[current] + 850) {
      reset(false);
      report('ended');
      return;
    }
    if (time >= durations[current]) (current === 'follow' ? follow : ritual).classList.add('leaving');
    frame = requestAnimationFrame(tick);
  }
  function play(type, id) {
    if (!Object.hasOwn(durations, type)) return;
    reset(false);
    requestId = id;
    current = type;
    root.dataset.reduced = String(reduced);
    if (type === 'follow') {
      $('follower-name').textContent = 'Seu nome';
      void follow.offsetWidth;
      follow.className = 'show';
    } else {
      $('event-title').textContent = titles[type];
      $('supporter').textContent = 'Seu nome';
      $('hero-value').textContent = type === 'bits' ? (reduced ? '1.500' : '0') : type === 'sub' ? 'NOVO SUB' : 'R$ 150,00';
      $('tribute').textContent = type === 'sub' ? 'Bem-vindo ao círculo do castelo' : type === 'bits' ? 'BITS · O castelo sente sua energia' : 'Seu apoio mantém a chama acesa';
      if (type === 'sub' && !reduced) buildSwarm();
      void ritual.offsetWidth;
      ritual.className = `show ${type}`;
    }
    startedAt = performance.now();
    frame = requestAnimationFrame(tick);
    report('playing');
  }
  function setPaused(value) {
    if (!current || paused === value) return;
    if (value) {
      elapsed += performance.now() - startedAt;
      cancelAnimationFrame(frame);
    } else {
      startedAt = performance.now();
      frame = requestAnimationFrame(tick);
    }
    paused = value;
    root.dataset.paused = String(value);
    report(value ? 'paused' : 'playing');
  }
  addEventListener('message', ({ source, data }) => {
    if (source !== parent || data?.channel !== channel) return;
    if (data.command === 'play') play(data.type, data.requestId);
    if (data.command === 'stop') { requestId = data.requestId; reset(); }
    if (data.command === 'pause') setPaused(true);
    if (data.command === 'resume') setPaused(false);
    if (data.command === 'reduced') {
      reduced = Boolean(data.value);
      root.dataset.reduced = String(reduced);
      if (current) reset();
    }
    if (data.command === 'hello') report('ready');
  });
  report('ready');
})();
