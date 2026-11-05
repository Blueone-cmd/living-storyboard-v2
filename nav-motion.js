(() => {
  'use strict';

  const header = document.getElementById('site-header');
  const nav = header?.querySelector('.main-nav');
  const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  if (!header || !nav || !links.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const thumb = document.createElement('span');
  thumb.className = 'nav-rubber-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  nav.prepend(thumb);

  let currentLink = null;
  let thumbAnimation = null;
  let thumbFrame = 0;
  let scrollFrame = 0;
  let previousY = Math.max(0, window.scrollY);
  let directionTravel = 0;
  let keepVisibleUntil = 0;
  let focusFromPointer = false;

  const showHeader = () => header.classList.remove('is-hidden-by-scroll');
  const dialogIsOpen = () => document.body.classList.contains('dialog-open') ||
    Boolean(document.querySelector('dialog[open]'));

  function updateThumb(animate = true) {
    const activeLink = window.scrollY < 95 ? null : links.find(link => link.classList.contains('is-active'));
    const changed = activeLink !== currentLink;
    currentLink = activeLink || null;

    links.forEach(link => {
      if (link === activeLink) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    if (!activeLink) {
      nav.classList.remove('has-active-section');
      thumbAnimation?.cancel();
      thumbAnimation = null;
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const targetRect = activeLink.getBoundingClientRect();
    const targetLeft = targetRect.left - navRect.left;
    const targetWidth = targetRect.width;
    const previousRect = thumb.getBoundingClientRect();
    const wasVisible = nav.classList.contains('has-active-section');
    const fromLeft = previousRect.left - navRect.left;
    const fromWidth = previousRect.width;

    thumbAnimation?.cancel();
    thumbAnimation = null;
    thumb.style.left = `${targetLeft}px`;
    thumb.style.width = `${targetWidth}px`;
    nav.classList.add('has-active-section');

    if (!animate || !changed || !wasVisible || reducedMotion.matches || !thumb.animate ||
        Math.abs(targetLeft - fromLeft) < 1) return;

    const distance = targetLeft - fromLeft;
    const direction = Math.sign(distance);
    const stretch = Math.min(20, Math.abs(distance) * .23);
    const middleWidth = Math.max(fromWidth, targetWidth) + stretch;
    thumbAnimation = thumb.animate([
      { left: `${fromLeft}px`, width: `${fromWidth}px`, offset: 0 },
      { left: `${fromLeft + distance * .53}px`, width: `${middleWidth}px`, offset: .43 },
      { left: `${targetLeft + direction * 3}px`, width: `${Math.max(22, targetWidth - 3)}px`, offset: .79 },
      { left: `${targetLeft}px`, width: `${targetWidth}px`, offset: 1 }
    ], { duration: 430, easing: 'cubic-bezier(.2,.7,.25,1)' });
    thumbAnimation.addEventListener('finish', () => { thumbAnimation = null; }, { once: true });
  }

  function scheduleThumb(animate = true) {
    if (thumbFrame) cancelAnimationFrame(thumbFrame);
    thumbFrame = requestAnimationFrame(() => {
      thumbFrame = 0;
      updateThumb(animate);
    });
  }

  function updateScroll() {
    scrollFrame = 0;
    const y = Math.max(0, window.scrollY);
    const delta = y - previousY;
    previousY = y;
    directionTravel = Math.max(-60, Math.min(60, directionTravel + delta));

    if (y < 95) {
      links.forEach(link => {
        if (link.classList.contains('is-active')) link.classList.remove('is-active');
      });
    }

    if (y < 115 || dialogIsOpen() || (header.contains(document.activeElement) && !focusFromPointer) ||
        performance.now() < keepVisibleUntil) {
      showHeader();
      directionTravel = 0;
    } else if (directionTravel > 15) {
      header.classList.add('is-hidden-by-scroll');
      directionTravel = 0;
    } else if (directionTravel < -10) {
      showHeader();
      directionTravel = 0;
    }

    if (y < 115 && currentLink) scheduleThumb(false);
  }

  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, { passive: true });

  header.addEventListener('focusin', showHeader);
  header.addEventListener('pointerdown', () => {
    focusFromPointer = true;
    showHeader();
    keepVisibleUntil = performance.now() + 900;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') focusFromPointer = false;
  });

  nav.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!target) return;
    links.forEach(link => link.classList.toggle('is-active', link === target));
    scheduleThumb();
  });

  const brand = header.querySelector('.brand[href="#hero"]');
  brand?.addEventListener('click', () => {
    links.forEach(link => link.classList.remove('is-active'));
    scheduleThumb(false);
  });

  const activeObserver = new MutationObserver(() => scheduleThumb());
  links.forEach(link => activeObserver.observe(link, {
    attributes: true, attributeFilter: ['class']
  }));
  new MutationObserver(() => {
    if (dialogIsOpen()) showHeader();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if ('ResizeObserver' in window) new ResizeObserver(() => scheduleThumb(false)).observe(nav);
  window.addEventListener('resize', () => scheduleThumb(false), { passive: true });
  document.fonts?.ready.then(() => scheduleThumb(false));
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) thumbAnimation?.cancel();
    scheduleThumb(false);
  });

  updateScroll();
  scheduleThumb(false);
})();
