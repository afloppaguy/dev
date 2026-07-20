(() => {
  const root = document.querySelector("#project-root");
  if (!root) return;

  const escapeHtml = value => window.AfloppaSite?.escapeHtml(value) ?? String(value || "");

  function coverMarkup(cover) {
    if (!cover?.src) return "";
    if (cover.type === "video") {
      return `<video controls playsinline preload="metadata" aria-label="${escapeHtml(cover.alt || "Project cover")}">
        <source src="${escapeHtml(cover.src)}" type="video/mp4">
      </video>`;
    }
    return `<img src="${escapeHtml(cover.src)}" alt="${escapeHtml(cover.alt || "Project cover")}">`;
  }

  function mediaItem(item) {
    const title = escapeHtml(item.title || "Project media");
    if (item.type === "video") {
      return `<figure class="project-media-item" data-media-item>
        <video controls playsinline preload="metadata" ${item.poster ? `poster="${escapeHtml(item.poster)}"` : ""}>
          <source src="${escapeHtml(item.src)}" type="video/mp4">
        </video>
        <figcaption>${title}</figcaption>
      </figure>`;
    }
    return `<figure class="project-media-item" data-media-item>
      <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || item.title || "Project screenshot")}" loading="lazy">
      <figcaption>${title}</figcaption>
    </figure>`;
  }

  function bindFailures(section) {
    const checkEmpty = () => {
      if (!section.querySelector("[data-media-item]")) section.remove();
    };

    section.querySelectorAll("img, video").forEach(media => {
      media.addEventListener("error", () => {
        media.closest("[data-media-item]")?.remove();
        checkEmpty();
      }, { once: true });
    });
  }

  async function init() {
    const id = new URLSearchParams(location.search).get("id");

    try {
      const response = await fetch("data/projects.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load projects");
      const projects = await response.json();
      const project = projects.find(item => item.id === id);
      if (!project) throw new Error("Project not found");

      document.title = `${project.title} — afloppaguy`;
      document.querySelector('meta[name="description"]')?.setAttribute("content", project.summary);

      const media = (project.media || []).filter(item => item?.src);
      root.innerHTML = `
        <a class="back-to-work" href="work.html">← Back to work</a>

        <article class="project-header">
          <div class="project-cover" data-project-cover>${coverMarkup(project.cover)}</div>
          <div class="project-title-block">
            <h1>${escapeHtml(project.title)}</h1>
            <p class="project-intro">${escapeHtml(project.intro)}</p>
            <p class="project-note">${escapeHtml(project.status)}. ${escapeHtml(project.made)}</p>
          </div>
        </article>

        <section class="project-built">
          <h2>What I built</h2>
          <div class="built-list">
            ${(project.details || []).map(detail => `<p>${escapeHtml(detail)}</p>`).join("")}
          </div>
        </section>

        ${media.length ? `<section class="project-media-section" data-media-section>
          <h2>Media</h2>
          <div class="project-media-grid">
            ${media.map(mediaItem).join("")}
          </div>
        </section>` : ""}

        <section class="project-end">
          <p>Need something similar made for your game?</p>
          <a class="plain-button plain-button--filled" href="about.html#contact">Contact me</a>
        </section>
      `;

      const cover = root.querySelector("[data-project-cover]");
      cover?.querySelectorAll("img, video").forEach(mediaEl => {
        mediaEl.addEventListener("error", () => cover.remove(), { once: true });
      });

      const mediaSection = root.querySelector("[data-media-section]");
      if (mediaSection) bindFailures(mediaSection);
    } catch (error) {
      console.error(error);
      root.innerHTML = `
        <section class="missing-project">
          <h1>Project not found.</h1>
          <p>The link is wrong or the project data could not load.</p>
          <a class="plain-button plain-button--filled" href="work.html">Back to work</a>
        </section>`;
    }
  }

  init();
})();
