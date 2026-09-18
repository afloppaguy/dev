const ownerTime = document.querySelector('#ownerTime');
const header = document.querySelector('#siteHeader');
const viewMore = document.querySelector('#viewMore');
const extraWork = [...document.querySelectorAll('.work-extra')];
const musicToggle = document.querySelector('#musicToggle');
const audio = document.querySelector('#portfolioAudio');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const projectViewer = document.querySelector('#projectViewer');
const projectViewerTitle = document.querySelector('#projectViewerTitle');
const projectViewerVideo = document.querySelector('#projectViewerVideo');
const projectViewerImage = document.querySelector('#projectViewerImage');
const projectViewerSwitcher = document.querySelector('#projectViewerSwitcher');
const projectViewerClose = document.querySelector('#projectViewerClose');
let musicStarted = false;
let viewerAudioState = null;

const projectMedia = {
  'flag-memory': {
    title: 'Flag Memory [Full Game]',
    items: [
      { type: 'video', label: 'Round', src: 'assets/projects/flag-memory-round.mp4' },
      { type: 'video', label: 'Podium Reveal', src: 'assets/projects/flag-memory-podium.mp4' },
    ],
  },
  'katana-beats': {
    title: 'Katana Beats',
    items: [{ type: 'video', label: 'Video', src: 'assets/projects/katana-beats.mp4' }],
  },
  'gem-cutting': {
    title: 'Gem Cutting Mechanic',
    items: [{ type: 'video', label: 'Video', src: 'assets/projects/gem-cutting.mp4' }],
  },
  'seedpack-reveal': {
    title: 'Seedpack Reveal',
    items: [{ type: 'video', label: 'Video', src: 'assets/projects/seedpack-reveal.mp4' }],
  },
  'dialogue-system': {
    title: 'Dialogue System',
    items: [{ type: 'video', label: 'Video', src: 'assets/projects/dialogue-system.mp4' }],
  },
  'quest-board': {
    title: 'Quest Board + Quest System',
    items: [{ type: 'video', label: 'Video', src: 'assets/projects/quest-board.mp4' }],
  },
};

if (header) {
  const sentinel = document.createElement('span');
  sentinel.className = 'header-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(sentinel);

  const headerObserver = new IntersectionObserver(([entry]) => {
    header.style.background = entry.isIntersecting ? 'rgba(255,255,255,.97)' : 'rgba(255,255,255,.985)';
  });
  headerObserver.observe(sentinel);
}

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Stockholm',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function updateOwnerTime() {
  if (ownerTime) ownerTime.textContent = timeFormatter.format(new Date());
}
updateOwnerTime();
window.setInterval(updateOwnerTime, 15000);

if (viewMore && extraWork.length) {
  viewMore.addEventListener('click', () => {
    const expanded = viewMore.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    viewMore.setAttribute('aria-expanded', String(next));
    const label = viewMore.querySelector('span');
    if (label) label.textContent = next ? 'Show fewer projects' : 'View more projects';

    for (const item of extraWork) {
      if (next) {
        item.hidden = false;
        item.classList.remove('revealed');
        requestAnimationFrame(() => item.classList.add('revealed'));
      } else {
        const preview = item.querySelector('video');
        if (preview) preview.pause();
        item.hidden = true;
        item.classList.remove('revealed');
      }
    }
  });
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      button.classList.add('copied');
      const state = button.querySelector('.contact-state');
      if (state) state.textContent = 'Copied';
      window.setTimeout(() => {
        button.classList.remove('copied');
        if (state) state.textContent = 'Copy';
      }, 1400);
    } catch {
      window.prompt('Copy this username:', value);
    }
  });
}

function syncMusicUI() {
  if (!audio || !musicToggle) return;
  const audible = !audio.paused && !audio.muted;
  const playing = !audio.paused;
  musicToggle.classList.toggle('is-playing', playing);
  musicToggle.classList.toggle('is-muted', playing && audio.muted);
  musicToggle.setAttribute('aria-pressed', String(audible));

  if (audio.paused) {
    musicToggle.setAttribute('aria-label', 'Play music');
    musicToggle.title = 'Play music';
  } else if (audio.muted) {
    musicToggle.setAttribute('aria-label', 'Unmute music');
    musicToggle.title = 'Unmute music';
  } else {
    musicToggle.setAttribute('aria-label', 'Mute music');
    musicToggle.title = 'Mute music';
  }
}

async function tryAutoplay() {
  if (!audio) return false;
  audio.volume = 0.32;
  audio.muted = false;
  try {
    await audio.play();
    musicStarted = true;
    syncMusicUI();
    return true;
  } catch {
    syncMusicUI();
    return false;
  }
}

if (audio && musicToggle) {
  audio.volume = 0.32;
  syncMusicUI();

  tryAutoplay().then((started) => {
    if (started) return;
    const unlock = async () => {
      const ok = await tryAutoplay();
      if (ok) {
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
        window.removeEventListener('touchstart', unlock, true);
      }
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchstart', unlock, true);
  });

  musicToggle.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (audio.paused) {
      await tryAutoplay();
    } else {
      audio.muted = !audio.muted;
      syncMusicUI();
    }
  });

  audio.addEventListener('play', () => {
    musicStarted = true;
    syncMusicUI();
  });
  audio.addEventListener('pause', syncMusicUI);
  audio.addEventListener('volumechange', syncMusicUI);
}

function pausePortfolioAudioForViewer() {
  if (!audio || viewerAudioState) return;
  viewerAudioState = {
    wasPlaying: !audio.paused,
    wasMuted: audio.muted,
    volume: audio.volume,
  };
  if (!audio.paused) audio.pause();
}

async function restorePortfolioAudioAfterViewer() {
  if (!audio || !viewerAudioState) return;
  const state = viewerAudioState;
  viewerAudioState = null;
  audio.muted = state.wasMuted;
  audio.volume = state.volume;
  if (state.wasPlaying) {
    try {
      await audio.play();
    } catch {
      // The music button remains available if the browser declines playback.
    }
  }
  syncMusicUI();
}

function showViewerItem(project, itemIndex) {
  if (!projectViewerVideo || !projectViewerImage || !projectViewerSwitcher) return;
  const item = project.items[itemIndex];
  if (!item) return;

  for (const button of projectViewerSwitcher.querySelectorAll('button')) {
    const selected = Number(button.dataset.mediaIndex) === itemIndex;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }

  projectViewerVideo.pause();
  projectViewerVideo.removeAttribute('src');
  projectViewerVideo.load();
  projectViewerVideo.hidden = true;
  projectViewerImage.hidden = true;

  if (item.type === 'image') {
    projectViewerImage.src = item.src;
    projectViewerImage.alt = item.alt || project.title;
    projectViewerImage.hidden = false;
    return;
  }

  projectViewerVideo.src = item.src;
  projectViewerVideo.hidden = false;
  projectViewerVideo.muted = false;
  projectViewerVideo.volume = 1;
  projectViewerVideo.load();
  projectViewerVideo.play().catch(() => {
    // Native controls are visible so the viewer can start playback manually.
  });
}

function openProjectViewer(projectKey) {
  if (!projectViewer || !projectViewerTitle || !projectViewerSwitcher) return;
  const project = projectMedia[projectKey];
  if (!project) return;

  pausePortfolioAudioForViewer();
  projectViewerTitle.textContent = project.title;
  projectViewerSwitcher.replaceChildren();

  if (project.items.length > 1) {
    project.items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;
      button.dataset.mediaIndex = String(index);
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.addEventListener('click', () => showViewerItem(project, index));
      projectViewerSwitcher.append(button);
    });
    projectViewerSwitcher.hidden = false;
  } else {
    projectViewerSwitcher.hidden = true;
  }

  if (!projectViewer.open) projectViewer.showModal();
  showViewerItem(project, 0);
}

function closeProjectViewer() {
  if (!projectViewer || !projectViewer.open) return;
  projectViewer.close();
}

for (const button of document.querySelectorAll('[data-project-media]')) {
  button.addEventListener('click', () => openProjectViewer(button.dataset.projectMedia));
}

if (projectViewerClose) projectViewerClose.addEventListener('click', closeProjectViewer);

if (projectViewer) {
  projectViewer.addEventListener('click', (event) => {
    if (event.target === projectViewer) closeProjectViewer();
  });
  projectViewer.addEventListener('close', () => {
    if (projectViewerVideo) {
      projectViewerVideo.pause();
      projectViewerVideo.removeAttribute('src');
      projectViewerVideo.load();
    }
    restorePortfolioAudioAfterViewer();
  });
}

const previewVideos = [...document.querySelectorAll('.work-thumb video')];
if (previewVideos.length && !reducedMotion) {
  previewVideos.forEach((video) => {
    const button = video.closest('.work-media-button');
    if (!button) return;
    const playPreview = () => video.play().catch(() => {});
    const stopPreview = () => {
      video.pause();
      video.currentTime = 0;
    };
    button.addEventListener('mouseenter', playPreview);
    button.addEventListener('mouseleave', stopPreview);
    button.addEventListener('focus', playPreview);
    button.addEventListener('blur', stopPreview);
  });
}

if (!reducedMotion) {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.style.animationPlayState = 'running';
    }
  }, { threshold: .12 });
  revealEls.forEach((el) => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatStat(value) {
  if (!Number.isFinite(value)) return '';
  return value >= 100000 ? compactFormat.format(value) : numberFormat.format(value);
}

async function fetchJson(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

async function hydrateRobloxGame(row) {
  const placeId = row.dataset.placeId;
  const stats = row.querySelector('.game-stats');
  if (!placeId || !stats) return;

  try {
    const universe = await fetchJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    if (!universe?.universeId) return;

    const response = await fetchJson(`https://games.roblox.com/v1/games?universeIds=${universe.universeId}`);
    const game = response?.data?.[0];
    if (!game) return;

    const playing = stats.querySelector('[data-stat="playing"]');
    const visits = stats.querySelector('[data-stat="visits"]');
    if (playing) playing.textContent = formatStat(game.playing);
    if (visits) visits.textContent = formatStat(game.visits);
    if (playing?.textContent && visits?.textContent) stats.hidden = false;
  } catch {
    // GitHub Pages stays clean if Roblox blocks cross-origin requests or an endpoint changes.
  }
}

document.querySelectorAll('[data-roblox-game]').forEach((row) => hydrateRobloxGame(row));
