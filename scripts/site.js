(() => {
  const PROJECTS_URL = "data/projects.json";
  const SOUND_KEY = "afloppaguy-sound";
  const toast = document.querySelector("[data-toast]");

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1700);
  }

  function mediaMarkup(cover, className = "") {
    if (!cover?.src) return "";
    const src = escapeHtml(cover.src);
    const alt = escapeHtml(cover.alt || "Project preview");

    if (cover.type === "video") {
      return `<div class="${className} media-box" data-cover-video>
        <video muted loop playsinline preload="metadata" aria-label="${alt}">
          <source src="${src}" type="video/mp4">
        </video>
      </div>`;
    }

    return `<div class="${className} media-box">
      <img src="${src}" alt="${alt}" loading="lazy">
    </div>`;
  }

  function bindMediaFailures(root = document) {
    root.querySelectorAll("img").forEach(image => {
      image.addEventListener("error", () => image.closest("[data-media-item], .media-box")?.remove(), { once: true });
    });

    root.querySelectorAll("video").forEach(video => {
      video.addEventListener("error", () => video.closest("[data-media-item], .media-box")?.remove(), { once: true });
    });
  }

  function bindCoverVideos(root = document) {
    root.querySelectorAll("[data-cover-video]").forEach(frame => {
      const video = frame.querySelector("video");
      if (!video) return;
      frame.addEventListener("mouseenter", () => video.play().catch(() => {}));
      frame.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  async function loadProjects() {
    const response = await fetch(PROJECTS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load projects (${response.status})`);
    return response.json();
  }

  async function renderHome() {
    const root = document.querySelector("#featured-work");
    if (!root) return;

    try {
      const projects = await loadProjects();
      const featured = projects.filter(project => project.featured).slice(0, 3);
      root.innerHTML = featured.map(project => `
        <article class="featured-row">
          <a class="featured-media-link" href="project.html?id=${encodeURIComponent(project.id)}" aria-label="Open ${escapeHtml(project.title)}">
            ${mediaMarkup(project.cover, "featured-row-media")}
          </a>
          <div class="featured-row-copy">
            <h3><a href="project.html?id=${encodeURIComponent(project.id)}">${escapeHtml(project.title)}</a></h3>
            <p>${escapeHtml(project.summary)}</p>
            <a class="project-link" href="project.html?id=${encodeURIComponent(project.id)}">View project →</a>
          </div>
        </article>
      `).join("");
      bindMediaFailures(root);
      bindCoverVideos(root);
    } catch (error) {
      console.error(error);
      root.innerHTML = `<p class="load-error">The work section could not load. Open the site through GitHub Pages or a local server.</p>`;
    }
  }

  async function renderWork() {
    const root = document.querySelector("#work-groups");
    if (!root) return;

    try {
      const projects = await loadProjects();
      const groupOrder = ["Games", "Systems", "Tools", "UI and effects"];
      root.innerHTML = groupOrder.map(group => {
        const items = projects.filter(project => project.group === group);
        if (!items.length) return "";
        const layout = group === "Games" ? "game-list" : "work-card-grid";
        return `<section class="work-group">
          <h2>${escapeHtml(group)}</h2>
          <div class="${layout}">
            ${items.map(project => `
              <article class="work-card ${group === "Games" ? "work-card--wide" : ""}">
                <a class="work-card-media-link" href="project.html?id=${encodeURIComponent(project.id)}" aria-label="Open ${escapeHtml(project.title)}">
                  ${mediaMarkup(project.cover, "work-card-media")}
                </a>
                <div class="work-card-copy">
                  <h3><a href="project.html?id=${encodeURIComponent(project.id)}">${escapeHtml(project.title)}</a></h3>
                  <p>${escapeHtml(project.summary)}</p>
                  <a class="project-link" href="project.html?id=${encodeURIComponent(project.id)}">View project →</a>
                </div>
              </article>
            `).join("")}
          </div>
        </section>`;
      }).join("");
      bindMediaFailures(root);
      bindCoverVideos(root);
    } catch (error) {
      console.error(error);
      root.innerHTML = `<p class="load-error">The project list could not load. Open the site through GitHub Pages or a local server.</p>`;
    }
  }

  function setupCopyButtons() {
    document.querySelectorAll("[data-copy-discord]").forEach(button => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText("afloppaguy");
          showToast("Copied: afloppaguy");
        } catch {
          showToast("Discord: afloppaguy");
        }
      });
    });
  }

  function setupSound() {
    const buttons = document.querySelectorAll("[data-sound-toggle]");
    if (!buttons.length) return;

    const sounds = {
      hover: new Audio("assets/audio/hover.wav"),
      click: new Audio("assets/audio/click.wav")
    };
    sounds.hover.volume = 0.13;
    sounds.click.volume = 0.18;

    let enabled = localStorage.getItem(SOUND_KEY) === "on";

    const updateButtons = () => {
      buttons.forEach(button => {
        button.textContent = enabled ? "Sound on" : "Sound off";
        button.setAttribute("aria-pressed", String(enabled));
      });
    };

    const play = name => {
      if (!enabled) return;
      const source = sounds[name];
      if (!source) return;
      const sound = source.cloneNode();
      sound.volume = source.volume;
      sound.play().catch(() => {});
    };

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        enabled = !enabled;
        localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
        updateButtons();
        if (enabled) play("click");
      });
    });

    document.addEventListener("pointerover", event => {
      if (!enabled) return;
      const target = event.target.closest("a, button");
      if (!target || target.dataset.sounded === "yes") return;
      target.dataset.sounded = "yes";
      play("hover");
    });

    document.addEventListener("pointerout", event => {
      const target = event.target.closest("a, button");
      if (target) target.dataset.sounded = "no";
    });

    document.addEventListener("click", event => {
      if (event.target.closest("a, button") && !event.target.closest("[data-sound-toggle]")) play("click");
    });

    updateButtons();
  }

  document.querySelectorAll("[data-year]").forEach(node => node.textContent = new Date().getFullYear());
  setupCopyButtons();
  setupSound();
  renderHome();
  renderWork();

  window.AfloppaSite = { escapeHtml, mediaMarkup, bindMediaFailures, showToast };
})();
