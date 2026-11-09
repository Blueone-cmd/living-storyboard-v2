(() => {
  'use strict';

  const R2_PUBLIC_BASE = 'https://pub-0774e10c01994b08aefd51661ebaa368.r2.dev';
  const allWorks = window.PORTFOLIO_CONTENT?.works || [];
  const byId = new Map(allWorks.map(work => [work.id, work]));
  const remoteMediaURL = path => `${R2_PUBLIC_BASE}/${path.replace(/^\/+/, '')}`;
  const mediaURL = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return location.protocol === 'file:'
      ? `../living-storyboard-public/${path}`
      : remoteMediaURL(path);
  };

  // The autoplay hero keeps compact controls; project videos use native playback controls.
  const attachHeroVideoControls = (video, mount, onUserPlay) => {
    video.controls = false;
    video.setAttribute('controlslist', 'nodownload');
    video.addEventListener('contextmenu', event => event.preventDefault());

    const bar = document.createElement('div');
    bar.className = 'video-control-bar video-control-bar--hero';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', '首页背景视频控制');
    const makeButton = (className) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `video-control interactive ${className}`;
      const icon = document.createElement('span');
      icon.className = 'video-control-icon';
      icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'video-control-label';
      button.append(icon, label);
      bar.append(button);
      return { button, icon, label };
    };
    const play = makeButton('video-control--play');
    const sound = makeButton('video-control--sound');

    const sync = () => {
      const paused = video.paused || video.ended;
      play.icon.innerHTML = paused
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor"/></svg>';
      play.label.textContent = paused ? '播放' : '暂停';
      play.button.setAttribute('aria-label', paused ? '播放首页背景视频' : '暂停首页背景视频');
      play.button.setAttribute('aria-pressed', String(!paused));
      const silent = video.muted || video.volume === 0;
      sound.icon.innerHTML = silent
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m16 9 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      sound.label.textContent = silent ? '开启声音' : '静音';
      sound.button.setAttribute('aria-label', silent ? '取消静音' : '静音');
      sound.button.setAttribute('aria-pressed', String(silent));
    };
    const togglePlay = () => {
      if (video.paused || video.ended) {
        onUserPlay?.(true);
        video.play().catch(() => {});
      } else {
        onUserPlay?.(false);
        video.pause();
      }
    };
    play.button.addEventListener('click', togglePlay);
    sound.button.addEventListener('click', () => { video.muted = !video.muted; });
    ['play', 'pause', 'ended', 'volumechange', 'emptied'].forEach(type => video.addEventListener(type, sync));
    if (video.parentElement === mount && video.nextSibling) mount.insertBefore(bar, video.nextSibling);
    else mount.append(bar);
    sync();
  };

  const otherIds = ['film-17', 'film-15', 'film-14', 'film-11', 'film-12'];
  const otherGrid = document.getElementById('other-grid');
  otherIds.forEach((id, index) => {
    const work = byId.get(id);
    if (!work) return;
    const button = document.createElement('button');
    button.className = 'other-card interactive reveal';
    button.type = 'button';
    button.dataset.workId = id;
    button.setAttribute('aria-label', `播放${work.title}`);
    button.style.setProperty('--reveal-delay', `${index * 70}ms`);
    const visual = document.createElement('span');
    visual.className = 'other-visual';
    const img = document.createElement('img');
    img.src = `assets/${work.poster}`;
    img.alt = work.title;
    img.loading = 'lazy';
    const number = document.createElement('i');
    number.textContent = String(index + 1).padStart(2, '0');
    visual.append(img, number);
    const caption = document.createElement('span');
    caption.className = 'other-caption';
    caption.textContent = work.title;
    button.append(visual, caption);
    otherGrid.append(button);
  });

  const promptIds = ['prompt-island-01', 'prompt-thor-02', 'prompt-thor-03', 'prompt-thor-04', 'prompt-thor-05', 'prompt-thor-06', 'prompt-thor-07', 'prompt-gunwoman-seamonster'];
  const promptGrid = document.getElementById('prompt-grid');
  const promptDialog = document.createElement('dialog');
  promptDialog.id = 'prompt-dialog';
  promptDialog.className = 'prompt-dialog';
  promptDialog.setAttribute('aria-labelledby', 'prompt-dialog-title');
  const promptShell = document.createElement('div');
  promptShell.className = 'prompt-dialog-shell';
  const promptHead = document.createElement('header');
  promptHead.className = 'prompt-dialog-head';
  const promptHeadCopy = document.createElement('div');
  promptHeadCopy.className = 'prompt-dialog-head-copy';
  const promptCounter = document.createElement('small');
  promptCounter.className = 'prompt-dialog-counter';
  const promptTitle = document.createElement('h2');
  promptTitle.id = 'prompt-dialog-title';
  const promptClose = document.createElement('button');
  promptClose.type = 'button';
  promptClose.className = 'prompt-dialog-close interactive';
  promptClose.setAttribute('aria-label', '关闭提示词片段');
  promptClose.textContent = '✕';
  promptHeadCopy.append(promptCounter, promptTitle);
  promptHead.append(promptHeadCopy, promptClose);
  const promptMain = document.createElement('div');
  promptMain.className = 'prompt-dialog-main';
  const promptMedia = document.createElement('div');
  promptMedia.className = 'prompt-dialog-media';
  const promptPlayer = document.createElement('video');
  promptPlayer.playsInline = true;
  promptPlayer.preload = 'none';
  promptPlayer.controls = true;
  promptPlayer.setAttribute('controlslist', 'nodownload');
  promptPlayer.addEventListener('contextmenu', event => event.preventDefault());
  const promptStatus = document.createElement('p');
  promptStatus.className = 'prompt-dialog-status';
  promptStatus.setAttribute('aria-live', 'polite');
  promptMedia.append(promptPlayer);
  promptMedia.append(promptStatus);
  const promptCopy = document.createElement('section');
  promptCopy.className = 'prompt-dialog-copy';
  const promptCopyLabel = document.createElement('span');
  promptCopyLabel.className = 'prompt-dialog-label';
  promptCopyLabel.textContent = 'ORIGINAL PROMPT / 原始提示词';
  const promptScript = document.createElement('p');
  promptScript.className = 'prompt-dialog-script';
  promptCopy.append(promptCopyLabel, promptScript);
  promptMain.append(promptMedia, promptCopy);
  promptShell.append(promptHead, promptMain);
  promptDialog.append(promptShell);
  document.body.append(promptDialog);
  let promptTrigger = null;

  const openPrompt = (work, index, trigger) => {
    promptTrigger = trigger;
    promptCounter.textContent = `SHOT STUDY / ${String(index + 1).padStart(2, '0')}—${String(promptIds.length).padStart(2, '0')}`;
    promptTitle.textContent = work.title;
    promptScript.textContent = work.promptText || '提示词素材待补';
    promptPlayer.poster = `assets/${work.poster}`;
    promptPlayer.dataset.sourcePath = work.video || '';
    promptPlayer.dataset.remoteFallback = '0';
    promptPlayer.classList.remove('is-landscape');
    promptPlayer.muted = false;
    promptPlayer.volume = 1;
    promptPlayer.controls = Boolean(work.video);
    promptStatus.textContent = work.video ? '' : '视频素材待补';
    promptDialog.showModal();
    document.body.classList.add('dialog-open');
    promptClose.focus({ preventScroll: true });
    if (work.video) {
      promptPlayer.src = mediaURL(work.video);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        promptPlayer.play().catch(() => {});
      }
    }
  };

  promptClose.addEventListener('click', () => promptDialog.close());
  promptDialog.addEventListener('click', event => {
    if (event.target === promptDialog) promptDialog.close();
  });
  promptDialog.addEventListener('close', () => {
    if (promptDialog.open) return;
    promptPlayer.pause();
    promptPlayer.removeAttribute('src');
    promptPlayer.load();
    promptPlayer.classList.remove('is-landscape');
    document.body.classList.remove('dialog-open');
    promptTrigger?.focus({ preventScroll: true });
    promptTrigger = null;
  });
  promptPlayer.addEventListener('loadedmetadata', () => {
    promptPlayer.classList.toggle('is-landscape', promptPlayer.videoWidth > promptPlayer.videoHeight);
  });
  promptPlayer.addEventListener('error', () => {
    if (!promptDialog.open || !promptPlayer.dataset.sourcePath) return;
    if (location.protocol === 'file:' && promptPlayer.dataset.remoteFallback !== '1') {
      promptPlayer.dataset.remoteFallback = '1';
      promptStatus.textContent = '正在尝试在线视频地址…';
      promptPlayer.src = remoteMediaURL(promptPlayer.dataset.sourcePath);
      promptPlayer.play().catch(() => {});
      return;
    }
    promptStatus.textContent = '视频暂时无法加载，提示词仍可查看。';
  });

  promptIds.forEach((id, index) => {
    const work = byId.get(id);
    if (!work) return;
    const card = document.createElement('button');
    card.className = 'prompt-card interactive reveal';
    card.type = 'button';
    card.setAttribute('aria-label', `查看${work.title}的视频与提示词`);
    card.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
    const visual = document.createElement('span');
    visual.className = 'prompt-card-visual';
    const image = document.createElement('img');
    image.src = `assets/${work.poster}`;
    image.alt = `${work.title}画面`;
    image.loading = 'lazy';
    visual.append(image);
    const text = document.createElement('span');
    text.className = 'prompt-card-info';
    const kicker = document.createElement('small');
    kicker.textContent = `${String(index + 1).padStart(2, '0')} / ${String(promptIds.length).padStart(2, '0')}`;
    const name = document.createElement('strong');
    name.textContent = work.title;
    const arrow = document.createElement('em');
    arrow.textContent = '查看镜头与提示词 ↗';
    text.append(kicker, name, arrow);
    card.append(visual, text);
    card.addEventListener('click', () => openPrompt(work, index, card));
    promptGrid.append(card);
  });

  const stillFilesA = ['02','07','12','18','24','29','34','40'];
  const stillFilesB = ['01','08','11','15','21','33','37','41'];
  [[stillFilesA, 'stills-a'], [stillFilesB, 'stills-b']].forEach(([files, id]) => {
    const row = document.getElementById(id);
    files.forEach(number => {
      const image = document.createElement('img');
      image.src = `assets/stills-drift/still-${number}.webp`;
      image.alt = '';
      image.loading = 'lazy';
      row.append(image);
    });
  });

  const mediaDialog = document.getElementById('media-dialog');
  const mediaPlayer = document.getElementById('media-player');
  mediaPlayer.addEventListener('contextmenu', event => event.preventDefault());
  const mediaTitle = document.getElementById('media-title');
  const mediaHint = document.getElementById('media-hint');
  const imageDialog = document.getElementById('image-dialog');
  const expandedImage = document.getElementById('expanded-image');
  const closeDialog = dialog => { if (dialog.open) dialog.close(); };
  document.addEventListener('click', event => {
    const interactive = event.target.closest('.interactive');
    if (interactive && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const box = interactive.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      ripple.style.left = `${event.clientX - box.left}px`;
      ripple.style.top = `${event.clientY - box.top}px`;
      ripple.style.width = ripple.style.height = `${Math.max(box.width, box.height) * 2.4}px`;
      interactive.append(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }
    const workButton = event.target.closest('[data-work-id]');
    if (workButton) {
      const work = byId.get(workButton.dataset.workId);
      if (!work?.video) return;
      mediaTitle.textContent = work.title;
      mediaHint.textContent = '';
      mediaPlayer.poster = `assets/${work.poster}`;
      mediaPlayer.dataset.sourcePath = work.video;
      mediaPlayer.dataset.remoteFallback = '0';
      mediaPlayer.muted = false;
      mediaPlayer.volume = 1;
      mediaPlayer.src = mediaURL(work.video);
      mediaDialog.showModal();
      document.body.classList.add('dialog-open');
      mediaPlayer.play().catch(() => {});
      return;
    }
    const imageButton = event.target.closest('[data-image]');
    if (imageButton) {
      expandedImage.src = imageButton.dataset.image;
      expandedImage.alt = imageButton.querySelector('img')?.alt || '项目截图原图';
      imageDialog.showModal();
      document.body.classList.add('dialog-open');
      return;
    }
    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) closeDialog(closeButton.closest('dialog'));
  });
  [mediaDialog, imageDialog].forEach(dialog => {
    dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (dialog === mediaDialog) { mediaPlayer.pause(); mediaPlayer.removeAttribute('src'); mediaPlayer.load(); }
      else expandedImage.removeAttribute('src');
    });
  });
  mediaPlayer.addEventListener('error', () => {
    if (location.protocol === 'file:' && mediaPlayer.dataset.remoteFallback !== '1') {
      mediaPlayer.dataset.remoteFallback = '1';
      mediaHint.textContent = '正在尝试在线视频地址…';
      mediaPlayer.src = remoteMediaURL(mediaPlayer.dataset.sourcePath);
      mediaPlayer.play().catch(() => {});
      return;
    }
    mediaHint.textContent = '当前网络暂时无法加载视频，请稍后重试。';
  });

  const heroVideo = document.getElementById('hero-video');
  let heroWantsPlayback = true;
  attachHeroVideoControls(heroVideo, heroVideo.closest('.hero'), wantsPlayback => {
    heroWantsPlayback = wantsPlayback;
  });
  if (window.matchMedia('(max-width: 700px)').matches) heroVideo.poster = 'assets/hero-fusion-v2-mobile-portrait-poster.webp';
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType || '')) {
    heroWantsPlayback = false;
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  } else {
    heroVideo.play().catch(() => {});
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
    else if (heroWantsPlayback) heroVideo.play().catch(() => {});
  });

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionReduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  }
  const header = document.getElementById('site-header');
  const navigation = Array.from(document.querySelectorAll('.main-nav a'));
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-25% 0px -62% 0px' });
  ['drama','fan','commerce','about'].forEach(id => navObserver.observe(document.getElementById(id)));
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  if (location.hash.length > 1) {
    addEventListener('load', () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      document.documentElement.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start' });
      setTimeout(() => document.documentElement.style.removeProperty('scroll-behavior'), 300);
    }, { once: true });
  }
})();
