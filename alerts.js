/* JavaScript / portfolio alert controls / local V14 animation and original audio */
(() => {
  'use strict';
  const stage = document.getElementById('alert-stage');
  const preview = document.getElementById('alert-preview');
  const buttons = [...document.querySelectorAll('[data-alert]')];
  const pauseButton = document.getElementById('alert-pause');
  const replayButton = document.getElementById('alert-replay');
  const stopButton = document.getElementById('alert-stop');
  const sound = document.getElementById('alert-sound');
  const reduced = document.getElementById('alert-reduced');
  const status = document.getElementById('alert-status');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const audio = new Audio();
  const labels = { follow: 'Follow', sub: 'Sub', donate: 'Donate', bits: 'Bits' };
  const examples = { follow: 'novo seguidor', sub: 'novo Sub', donate: 'R$ 150,00', bits: '1.500 Bits' };
  let ready = false;
  let active = null;
  let last = null;
  let paused = false;
  let requestId = 0;
  let loadingTimer;
  reduced.checked = preference.matches;
  audio.volume = .6;

  function send(command, values = {}) {
    preview.contentWindow?.postMessage({ channel: 'ravi-alert-preview', command, requestId, ...values }, '*');
  }
  function renderState(state = 'idle') {
    stage.dataset.previewState = state;
    for (const button of buttons) {
      button.disabled = !ready;
      button.setAttribute('aria-pressed', String(button.dataset.alert === active));
    }
    pauseButton.disabled = !active;
    pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
    replayButton.disabled = !ready || !last;
    stopButton.disabled = !active;
  }
  function stopAudio() {
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Media may not have loaded yet. */ }
  }
  function playAudio() {
    const token = requestId;
    audio.play().catch(() => {
      if (token === requestId && active && sound.checked && !paused) {
        status.textContent = `${labels[active]} em demonstração, sem áudio. O navegador não liberou o som.`;
      }
    });
  }
  function stop(message = 'Demonstração parada. Escolha um alerta para testar.') {
    if (!active) return;
    requestId++;
    send('stop');
    stopAudio();
    active = null;
    paused = false;
    status.textContent = message;
    renderState();
  }
  function play(type) {
    if (!ready || !Object.hasOwn(labels, type)) return;
    requestId++;
    stopAudio();
    active = last = type;
    paused = false;
    audio.src = `assets/som-${type}.mp3`;
    audio.muted = !sound.checked;
    if (sound.checked) playAudio();
    send('play', { type });
    status.textContent = `${labels[type]} · ${examples[type]}. Nome ilustrativo: Seu nome.${reduced.checked ? ' Movimento reduzido.' : ''}`;
    renderState('playing');
  }
  for (const button of buttons) button.addEventListener('click', () => play(button.dataset.alert));
  replayButton.addEventListener('click', () => play(last));
  stopButton.addEventListener('click', () => stop());
  pauseButton.addEventListener('click', () => {
    if (!active) return;
    paused = !paused;
    send(paused ? 'pause' : 'resume');
    if (paused) audio.pause();
    else if (sound.checked && !audio.ended) playAudio();
    status.textContent = `${labels[active]} ${paused ? 'pausado. Clique em Continuar para retomar.' : 'em demonstração.'}`;
    renderState(paused ? 'paused' : 'playing');
  });
  sound.addEventListener('change', () => {
    audio.muted = !sound.checked;
    if (!sound.checked) audio.pause();
    else if (active && !paused && !audio.ended) playAudio();
  });
  reduced.addEventListener('change', () => {
    stop('Movimento alterado. Escolha um alerta para testar.');
    send('reduced', { value: reduced.checked });
  });
  preference.addEventListener('change', ({ matches }) => {
    reduced.checked = matches;
    stop('Preferência de movimento atualizada. Escolha um alerta para testar.');
    send('reduced', { value: matches });
  });
  window.addEventListener('message', ({ source, data }) => {
    if (source !== preview.contentWindow || data?.channel !== 'ravi-alert-preview') return;
    if (data.state === 'ready') {
      ready = true;
      clearTimeout(loadingTimer);
      send('reduced', { value: reduced.checked });
      status.textContent = 'Escolha um alerta para ver a animação.';
      renderState();
    }
    if (data.requestId !== requestId) return;
    if (data.state === 'ended') {
      stopAudio();
      active = null;
      paused = false;
      status.textContent = 'Demonstração concluída. Repita ou escolha outro alerta.';
      renderState();
    }
  });
  preview.addEventListener('load', () => {
    send('hello');
    loadingTimer = setTimeout(() => {
      if (!ready) status.textContent = 'Não foi possível carregar a animação. Extraia a pasta completa e tente abrir o HTML novamente.';
    }, 8000);
  });
  send('hello');
  document.addEventListener('portfolio:stop-alert', () => stop());
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) stop('Demonstração encerrada ao sair da seção. Escolha um alerta para testar.');
  }, { threshold: .05 }).observe(document.getElementById('alertas'));
})();
