/* Ravi portfolio. Local media, accessible gallery and user-initiated audio. */
(() => {
  'use strict';
  const asset = (name) => `assets/${name}`;
  const picture = (name, title) => ({ src: asset(name), title, type: 'image' });
  const movie = (name, title, poster) => ({ src: asset(name), title, type: 'video', poster: asset(poster) });
  const projects = {
    henrique: { name: 'Henrique', items: [
      picture('henrique-offline.webp', 'Tela offline'), picture('henrique-icone.webp', 'Ícone do canal'),
      picture('henrique-regras.webp', 'Regras'), picture('henrique-apoio.webp', 'Painel de apoio'),
      picture('henrique-siga.webp', 'Me siga'), picture('henrique-setup.webp', 'Setup'), picture('henrique-sobre.webp', 'Sobre mim'),
    ] },
    vamp: { name: 'Pack Vamp', items: [
      picture('vamp-iniciando.webp', 'Abertura da live'), picture('vamp-encerrando.webp', 'Encerramento'),
      picture('vamp-camera.webp', 'Cena com câmera'), picture('vamp-cena.webp', 'Moldura de cena e chat'),
      picture('vamp-sobre.webp', 'Sobre mim'), picture('vamp-regras.webp', 'Regras'),
      picture('vamp-setup.webp', 'Setup'), picture('vamp-donates.webp', 'Donates'),
      movie('vamp-abertura.mp4', 'Abertura animada', 'vamp-iniciando.webp'),
      movie('vamp-encerramento.mp4', 'Encerramento animado', 'vamp-encerrando.webp'),
    ] },
    fall: { name: 'Fall', items: [
      picture('fall-quarto.webp', 'Cena do quarto'), picture('fall-descanso.webp', 'Clima de descanso'),
      movie('fall-cena.mp4', 'Cena animada', 'fall-quarto.webp'),
    ] },
    emotes: { name: 'Emotes em pixel art', items: [...document.querySelectorAll('[data-emote]')].map((button) => ({
      src: button.querySelector('img').getAttribute('src'), title: button.querySelector('img').alt,
      type: 'image', pixel: true,
    })) },
  };

  const viewer = document.getElementById('art-viewer');
  const mediaBox = document.getElementById('viewer-media');
  const closeButton = document.getElementById('viewer-close');
  const hero = document.getElementById('hero-video');
  const motionButton = document.getElementById('motion-control');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeProject = '', activeIndex = 0, returnFocus = null;
  let allowHeroMotion = !motionPreference.matches, heroVisible = true;

  function showMedia() {
    mediaBox.querySelector('video')?.pause();
    mediaBox.replaceChildren();
    const project = projects[activeProject];
    const item = project.items[activeIndex];
    document.getElementById('viewer-project').textContent = project.name;
    document.getElementById('viewer-title').textContent = item.title;
    document.getElementById('viewer-position').textContent = `${activeIndex + 1} de ${project.items.length}`;
    const element = document.createElement(item.type === 'video' ? 'video' : 'img');
    if (item.type === 'video') {
      element.controls = true;
      element.playsInline = true;
      element.preload = 'metadata';
      element.poster = item.poster;
      element.setAttribute('aria-label', `${project.name}: ${item.title}`);
    } else {
      element.alt = `${project.name}: ${item.title}`;
      if (item.pixel) element.className = 'is-emote';
    }
    element.addEventListener('error', () => {
      const message = document.createElement('p');
      message.textContent = 'Não foi possível abrir esta arte. Confira se a pasta assets está junto do HTML.';
      message.style.cssText = 'color:#251821;padding:24px;max-width:50ch';
      mediaBox.replaceChildren(message);
    }, { once: true });
    element.src = item.src;
    mediaBox.append(element);
  }

  function openProject(name, index, trigger) {
    if (!projects[name] || !projects[name].items.length) return;
    activeProject = name;
    activeIndex = Math.min(Math.max(index, 0), projects[name].items.length - 1);
    returnFocus = trigger;
    stopSample();
    hero.pause();
    showMedia();
    document.body.classList.add('viewer-open');
    viewer.showModal();
    closeButton.focus();
  }

  function navigate(direction) {
    const length = projects[activeProject].items.length;
    activeIndex = (activeIndex + direction + length) % length;
    showMedia();
  }

  for (const button of document.querySelectorAll('[data-project]')) {
    button.addEventListener('click', () => openProject(button.dataset.project, Number(button.dataset.index), button));
  }
  for (const button of document.querySelectorAll('[data-emote]')) {
    button.addEventListener('click', () => openProject('emotes', Number(button.dataset.emote), button));
  }
  document.getElementById('viewer-prev').addEventListener('click', () => navigate(-1));
  document.getElementById('viewer-next').addEventListener('click', () => navigate(1));
  closeButton.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'VIDEO') return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  viewer.addEventListener('close', () => {
    mediaBox.querySelector('video')?.pause();
    mediaBox.replaceChildren();
    document.body.classList.remove('viewer-open');
    returnFocus?.focus({ preventScroll: true });
    syncHero();
  });

  function updateMotionControl() {
    motionButton.setAttribute('aria-label', hero.paused ? 'Reproduzir animação' : 'Pausar animação');
    motionButton.querySelector('use').setAttribute('href', hero.paused ? '#play' : '#pause');
  }
  function syncHero() {
    if (allowHeroMotion && heroVisible && !document.hidden && !viewer.open) {
      if (!hero.getAttribute('src')) hero.src = asset('vamp-abertura.mp4');
      hero.muted = true;
      hero.play().catch(updateMotionControl);
    } else hero.pause();
  }
  motionButton.addEventListener('click', () => {
    allowHeroMotion = hero.paused;
    syncHero();
  });
  hero.addEventListener('play', updateMotionControl);
  hero.addEventListener('pause', updateMotionControl);
  hero.addEventListener('error', () => { allowHeroMotion = false; updateMotionControl(); });
  motionPreference.addEventListener('change', (event) => { allowHeroMotion = !event.matches; syncHero(); });
  const observer = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncHero(); }, { threshold: .1 });
  observer.observe(hero);

  function stopSample() {
    document.dispatchEvent(new Event('portfolio:stop-alert'));
  }
  document.addEventListener('visibilitychange', syncHero);

  const copyButton = document.getElementById('copy-discord');
  copyButton.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('Mollyx3');
      status.textContent = 'Mollyx3 copiado. Envie sua ideia pelo Discord.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('discord-handle'));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Usuário selecionado. Copie e procure por Mollyx3 no Discord.';
    }
  });
})();
