(() => {
  'use strict';

  const dialog = document.getElementById('media-dialog');
  const player = document.getElementById('media-player');
  const title = document.getElementById('media-title');
  const hint = document.getElementById('media-hint');
  const copyStatus = document.getElementById('fan-copy-status');
  let statusTimer;

  dialog.addEventListener('close', () => {
    dialog.classList.remove('is-landscape');
    player.classList.remove('landscape');
  });

  document.addEventListener('click', async event => {
    const videoCard = event.target.closest('[data-local-video]');
    if (videoCard) {
      const landscape = videoCard.classList.contains('fan-post--landscape');
      dialog.classList.toggle('is-landscape', landscape);
      player.classList.toggle('landscape', landscape);
      player.preload = 'none';
      player.poster = videoCard.dataset.localPoster;
      player.dataset.remoteFallback = '1';
      player.dataset.sourcePath = videoCard.dataset.localVideo;
      player.muted = false;
      player.volume = 1;
      player.src = videoCard.dataset.localVideo;
      title.textContent = videoCard.dataset.localTitle;
      hint.textContent = '';
      dialog.showModal();
      document.body.classList.add('dialog-open');
      player.play().catch(() => {});
      return;
    }

    const copyButton = event.target.closest('[data-copy-douyin-id]');
    if (!copyButton) return;
    const accountId = '71005379447';
    let copied = false;
    try {
      await navigator.clipboard.writeText(accountId);
      copied = true;
    } catch {
      const field = document.createElement('textarea');
      field.value = accountId;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      copied = document.execCommand('copy');
      field.remove();
    }
    copyStatus.textContent = copied ? `已复制抖音号 ${accountId}` : `抖音号：${accountId}`;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { copyStatus.textContent = ''; }, 5000);
  });
})();
