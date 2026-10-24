(() => {
  const page = document.getElementById('nachtorchidee');
  const journey = page.querySelector('.nacht-journey');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Independent transparent CSS masks sample the user's photograph, preserving its real colors.
  const ambient = document.createElement('div');
  ambient.className = 'nacht-ambient';
  ambient.setAttribute('aria-hidden', 'true');
  ['nacht-glow-a', 'nacht-glow-b', 'nacht-glow-c', 'nacht-pointer-glow'].forEach(name => {
    const layer = document.createElement('span'); layer.className = name; ambient.append(layer);
  });
  document.body.append(ambient);
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let pointerFrame = 0, pointerX = 0, pointerY = 0;
  function hidePointer() { ambient.classList.remove('is-pointing'); }
  function syncAmbient() { ambient.hidden = page.hidden; if (page.hidden || reduced.matches) hidePointer(); }
  document.addEventListener('pointermove', event => {
    if (page.hidden || reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
    pointerX = event.clientX; pointerY = event.clientY;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      ambient.style.setProperty('--light-x', `${pointerX}px`);
      ambient.style.setProperty('--light-y', `${pointerY}px`);
      if (!page.hidden) ambient.classList.add('is-pointing');
    });
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave', hidePointer);
  addEventListener('blur', hidePointer);
  reduced.addEventListener('change', syncAmbient);
  new MutationObserver(syncAmbient).observe(page, {attributes:true, attributeFilter:['hidden']});
  syncAmbient();
  // Add the supplied documentary photographs here, in their intended order.
  const photographs = []; // { src: 'assets/nachtorchidee/photo.jpg', alt: '...' }
  const gallery = page.querySelector('.nacht-gallery');
  photographs.forEach(photo => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = photo.src; image.alt = photo.alt; image.loading = 'lazy';
    figure.append(image); gallery.append(figure);
  });
  page.querySelector('.nacht-pending').hidden = photographs.length > 0;
  const smooth = (start, end, value) => {
    const p = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return p * p * (3 - 2 * p);
  };
  let scheduled = false;
  function update() {
    scheduled = false;
    if (page.hidden) return;
    const distance = journey.offsetHeight - page.querySelector('.nacht-stage').offsetHeight;
    const progress = reduced.matches ? 0 : Math.max(0, -journey.getBoundingClientRect().top) / Math.max(1, distance);
    page.style.setProperty('--nacht-photo', 1 - smooth(.04, .58, progress));
    page.style.setProperty('--nacht-title', 1 - smooth(.02, .32, progress));
    page.style.setProperty('--nacht-light', 1 - smooth(.49, .96, progress));
  }
  function schedule() { if (!scheduled && !page.hidden) { scheduled = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(page, {attributes:true, attributeFilter:['hidden']});
  schedule();
})();
