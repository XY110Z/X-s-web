(() => {
  // Edit this object to replace media or project information; no layout changes needed.
  const project = {
    title: 'EIN TRAUM VON JERUSALEM',
    type: 'Audiovisual Live Performance',
    year: '2026',
    location: 'Studio Transmediale Formen (STF)',
    visuals: 'Xinyun Zhang',
    sound: 'Haoran Wang',
    description: "Ein Traum von Jerusalem explores the desire to remain in a dream and the inevitability of waking up.\n\nThrough live vocal processing, sound, dynamic light, and projected architecture, an imagined Jerusalem takes shape as a place of memory and longing. Architectural forms emerge, dissolve, and reappear, creating a world that feels almost tangible but never quite within reach.\n\nRepeated calls to awaken interrupt the dream, drawing the performance into a struggle between the comfort of an idealized world and the reality of having to leave it behind.",
    visualVideo: 'assets/jerusalem/visual-loop.mov', // Local 5760 × 1080 loop.
    youtubeUrl: '', // A real youtube.com/watch or youtu.be URL. Never autoplays.
    photographs: {
      left: 'assets/jerusalem/visuals.jpg',
      center: 'assets/jerusalem/performance.jpg',
      right: 'assets/jerusalem/sound.jpg'
    }
  };
  const page = document.getElementById('ein-traum');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  page.querySelectorAll('[data-jerusalem-field]').forEach(el => {
    el.textContent = project[el.dataset.jerusalemField];
  });
  const description = page.querySelector('[data-jerusalem-description]');
  description.replaceChildren(...(project.description || 'PROJECT DESCRIPTION — COMING SOON').split(/\n\s*\n/).map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  description.classList.toggle('is-placeholder', !project.description);
  page.querySelectorAll('[data-photo]').forEach(figure => {
    const img = figure.querySelector('img');
    const placeholder = figure.querySelector('.jerusalem-placeholder');
    const src = project.photographs[figure.dataset.photo];
    const showPlaceholder = () => { img.hidden = true; placeholder.hidden = false; };
    img.addEventListener('error', showPlaceholder);
    if (src) img.src = src;
    else { img.removeAttribute('src'); showPlaceholder(); }
  });
  let heroVideo;
  if (project.visualVideo) {
    heroVideo = document.createElement('video');
    heroVideo.muted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    heroVideo.preload = 'metadata';
    heroVideo.setAttribute('aria-label', 'TouchDesigner visual recording');
    heroVideo.src = project.visualVideo;
    const container = page.querySelector('[data-jerusalem-visual]');
    heroVideo.addEventListener('loadeddata', () => { container.querySelector('.jerusalem-placeholder').hidden = true; });
    heroVideo.addEventListener('error', () => { container.querySelector('.jerusalem-placeholder').hidden = false; });
    container.append(heroVideo);
  }
  // The empty URL leaves the placeholder intact. A supplied URL uses native click-to-play controls.
  let youtube;
  if (project.youtubeUrl) {
    try {
      const url = new URL(project.youtubeUrl);
      const host = url.hostname.replace(/^www\./, '');
      const id = host === 'youtu.be' ? url.pathname.slice(1) :
        ['youtube.com', 'youtube-nocookie.com'].includes(host) ?
        (url.searchParams.get('v') || url.pathname.match(/^\/embed\/([^/]+)/)?.[1]) : '';
      if (/^[\w-]{11}$/.test(id || '')) {
        youtube = document.createElement('iframe');
        youtube.title = 'Ein Traum von Jerusalem — full performance';
        youtube.dataset.source = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0`;
        youtube.allow = 'encrypted-media; fullscreen; picture-in-picture';
        youtube.allowFullscreen = true;
        youtube.loading = 'lazy';
        page.querySelector('[data-jerusalem-youtube]').replaceChildren(youtube);
      }
    } catch { /* Keep the placeholder if the URL is not ready. */ }
  }
  const photography = page.querySelector('.jerusalem-photography');
  const photos = [...photography.querySelectorAll('.jerusalem-photo')];
  const entered = photos.map(() => 0);
  photography.classList.add('is-animated');
  const clamp = n => Math.max(0, Math.min(1, n));
  let queued = false;
  function update() {
    queued = false;
    if (page.hidden) return;
    const mobile = matchMedia('(max-width:650px)').matches;
    const sectionTop = photography.getBoundingClientRect().top;
    const progress = (innerHeight * .85 - sectionTop) / Math.min(innerHeight * .9, 700);
    photos.forEach((photo, i) => {
      // Mobile figures retain reading order and enter when each reaches the viewport.
      const naturalTop = photo.getBoundingClientRect().top - (80 * (1 - entered[i]));
      const raw = motion.matches ? 1 : mobile ?
        clamp((innerHeight * .9 - naturalTop) / Math.min(240, innerHeight * .35)) :
        clamp((progress - i * .2) / .3);
      const eased = raw * raw * (3 - 2 * raw);
      // Follow only the entrance range. Scrolling above it restores the entrance;
      // below it every image remains at its final, static position.
      entered[i] = eased;
      photo.style.setProperty('--photo-opacity', entered[i]);
      photo.style.setProperty('--photo-offset', `${80 * (1 - entered[i])}px`);
    });
  }
  function requestUpdate() {
    if (!queued && !page.hidden) { queued = true; requestAnimationFrame(update); }
  }
  let wasHidden = page.hidden;
  function syncPage() {
    if (wasHidden && !page.hidden) {
      entered.fill(0);
      photos.forEach(photo => {
        photo.style.setProperty('--photo-opacity', 0);
        photo.style.setProperty('--photo-offset', '80px');
      });
    }
    wasHidden = page.hidden;
    if (heroVideo) {
      heroVideo.autoplay = !motion.matches && !page.hidden;
      if (heroVideo.autoplay) heroVideo.play().catch(() => {});
      else heroVideo.pause();
    }
    if (youtube) {
      if (page.hidden) youtube.removeAttribute('src');
      else if (!youtube.getAttribute('src')) youtube.src = youtube.dataset.source;
    }
    requestUpdate();
  }
  new MutationObserver(syncPage).observe(page, { attributes: true, attributeFilter: ['hidden'] });
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate);
  motion.addEventListener('change', syncPage);
  syncPage();
})();
