(() => {
  'use strict';
  const wall = document.querySelector('.stills-wall');
  const field = wall?.querySelector('.stills-field');
  const rowA = document.getElementById('stills-a');
  const rowB = document.getElementById('stills-b');
  if (!wall || !field || !rowA || !rowB) return;

  // app.js supplies the 16 selected WebP stills. Reuse those URLs in a
  // continuous field so each file is transferred only once by the browser.
  const sourceSets = [rowA, rowB].map(row =>
    [...row.querySelectorAll('img')].map(image => image.getAttribute('src'))
  );
  if (sourceSets.some(set => !set.length)) return;

  const smallScreen = matchMedia('(max-width: 700px)');
  const saveData = Boolean(navigator.connection?.saveData);
  let resizeFrame = 0;

  const setTravel = () => {
    wall.querySelectorAll('.stills-row').forEach(row => {
      const first = row.querySelector('.stills-segment');
      if (!first) return;
      const gap = parseFloat(getComputedStyle(row).gap) || 0;
      row.style.setProperty('--wall-travel', `-${Math.ceil(first.offsetWidth + gap)}px`);
    });
  };

  const makeSegment = sources => {
    const segment = document.createElement('div');
    segment.className = 'stills-segment';
    sources.forEach(src => {
      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.setAttribute('fetchpriority', 'low');
      segment.append(image);
    });
    return segment;
  };

  const build = () => {
    wall.querySelectorAll('.stills-row[data-wall-generated]').forEach(row => row.remove());
    const count = saveData ? 2 : smallScreen.matches ? 3 : 4;
    const copies = smallScreen.matches || saveData ? 2 : 3;
    const names = ['a', 'b', 'c', 'd'];
    for (let index = 0; index < count; index++) {
      const row = index === 0 ? rowA : index === 1 ? rowB : document.createElement('div');
      if (index > 1) {
        row.className = `stills-row row-${names[index]}`;
        row.dataset.wallGenerated = '';
        field.append(row);
      }
      row.replaceChildren();
      const limit = saveData ? 4 : smallScreen.matches ? 6 : 8;
      const sources = sourceSets[index % 2].slice(0, limit);
      const sequence = index > 1 ? [...sources].reverse() : sources;
      for (let copy = 0; copy < copies; copy++) row.append(makeSegment(sequence));
    }
    wall.classList.toggle('is-data-saving', saveData);
    requestAnimationFrame(() => {
      setTravel();
      wall.classList.add('is-ready');
    });
  };

  // Let the opening film claim decoding and bandwidth first.
  setTimeout(build, 950);
  smallScreen.addEventListener?.('change', build);
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(setTravel);
  }, { passive: true });
})();
