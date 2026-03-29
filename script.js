const filterButtons = document.querySelectorAll(".filters .pill");
const projectCards = document.querySelectorAll(".project-card");
const loadMoreProjects = document.getElementById("loadMoreProjects");
const initialProjectCount = 6;
let projectsExpanded = false;
let activeProjectFilter = "All";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const projectFallbackSrc = encodeURI(
  "Black White Dark Futuristic Error Page Website Error Page.png"
);
const projectFallbackAlt = "Project under construction";
const eventFallbackAlt = "Event media unavailable";

const isGithubProfileLink = (href) => {
  try {
    const url = new URL(href, window.location.href);
    if (url.hostname !== "github.com") return false;
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.length < 2;
  } catch (error) {
    return false;
  }
};

const applyEventMediaFallback = (img) => {
  if (!img || img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = projectFallbackSrc;
  img.alt = eventFallbackAlt;
  img.classList.add("event-fallback");
};

const isMissingGithubLink = (link) => {
  if (!link) return true;
  if (link.dataset.github === "false") return true;
  const rawHref = link.getAttribute("href");
  if (!rawHref) return true;
  const href = rawHref.trim();
  if (!href || href === "#" || href.toLowerCase() === "javascript:void(0)") {
    return true;
  }
  return isGithubProfileLink(href);
};

const setElementVisibility = (element, shouldShow, immediate = false) => {
  if (!element) return;

  if (prefersReducedMotion || immediate) {
    element.style.display = shouldShow ? "" : "none";
    element.classList.toggle("is-hidden", !shouldShow);
    return;
  }

  if (shouldShow) {
    if (element.style.display === "none") {
      element.style.display = "";
      element.classList.add("is-hidden");
      requestAnimationFrame(() => {
        element.classList.remove("is-hidden");
      });
    } else {
      element.classList.remove("is-hidden");
    }
    return;
  }

  if (element.style.display === "none") return;
  element.classList.add("is-hidden");
  const onTransitionEnd = (event) => {
    if (event.propertyName !== "opacity") return;
    element.removeEventListener("transitionend", onTransitionEnd);
    if (!element.classList.contains("is-hidden")) return;
    element.style.display = "none";
  };
  element.addEventListener("transitionend", onTransitionEnd);
};

const getProjectMatches = () =>
  Array.from(projectCards).filter(
    (card) =>
      activeProjectFilter === "All" || card.dataset.category === activeProjectFilter
  );

const updateProjectVisibility = (immediate = false) => {
  const matches = getProjectMatches();
  const visibleCount = projectsExpanded
    ? matches.length
    : Math.min(initialProjectCount, matches.length);
  const visibleSet = new Set(matches.slice(0, visibleCount));

  projectCards.forEach((card) => {
    setElementVisibility(card, visibleSet.has(card), immediate);
  });

  if (loadMoreProjects) {
    const canToggle = matches.length > initialProjectCount;
    loadMoreProjects.style.display = canToggle ? "inline-flex" : "none";
    loadMoreProjects.textContent = projectsExpanded ? "Load less" : "Load more";
    loadMoreProjects.setAttribute("aria-expanded", String(projectsExpanded));
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    activeProjectFilter = button.dataset.filter || "All";
    projectsExpanded = false;
    updateProjectVisibility();
  });
});

if (projectCards.length) {
  updateProjectVisibility(true);

  if (loadMoreProjects) {
    loadMoreProjects.addEventListener("click", () => {
      projectsExpanded = !projectsExpanded;
      updateProjectVisibility();
      if (!projectsExpanded) {
        const projectsSection = document.getElementById("projects");
        if (projectsSection) {
          projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }
}

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => observer.observe(item));

document.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (!target.closest(".event-cover, .event-images, .event-modal-track")) return;
    applyEventMediaFallback(target);
  },
  true
);

const navBar = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

const closeNav = () => {
  if (!navBar || !navToggle) return;
  if (!navBar.classList.contains("nav-open")) return;
  navBar.classList.remove("nav-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

if (navBar && navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navBar.classList.toggle("nav-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNav();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navBar.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeNav();
    }
  });
}

const certTrack = document.querySelector(".cert-track");
const certNavButtons = document.querySelectorAll(".cert-nav");

if (certTrack && certNavButtons.length) {
  const getScrollAmount = () => certTrack.clientWidth * 0.8;

  const updateNavState = () => {
    const maxScroll = certTrack.scrollWidth - certTrack.clientWidth - 1;
    certNavButtons.forEach((button) => {
      const isPrev = button.dataset.direction === "prev";
      button.disabled = isPrev
        ? certTrack.scrollLeft <= 0
        : certTrack.scrollLeft >= maxScroll;
    });
  };

  certNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction === "prev" ? -1 : 1;
      certTrack.scrollBy({
        left: getScrollAmount() * direction,
        behavior: "smooth",
      });
    });
  });

  certTrack.addEventListener("scroll", updateNavState);
  window.addEventListener("resize", updateNavState);
  updateNavState();
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxContent = document.querySelector(".lightbox-content");
const defaultLightboxLabel =
  lightboxContent?.getAttribute("aria-label") || "Preview";
const certImages = document.querySelectorAll(".cert-image");

const setLightboxLabel = (label) => {
  if (!lightboxContent) return;
  lightboxContent.setAttribute("aria-label", label);
};

const openLightbox = (src, alt, options = {}) => {
  if (!lightbox || !lightboxImage) return;
  const { label = defaultLightboxLabel, mode } = options;
  setLightboxLabel(label);
  if (mode === "project-fallback") {
    lightbox.classList.add("project-fallback");
  } else {
    lightbox.classList.remove("project-fallback");
  }
  lightboxImage.src = src;
  lightboxImage.alt = alt || "Certificate preview";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.classList.remove("project-fallback");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.classList.remove("lightbox-open");
  setLightboxLabel(defaultLightboxLabel);
};

if (lightbox && lightboxImage && certImages.length) {
  certImages.forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      if (!image) return;
      const fullSrc = button.dataset.full || image.src;
      openLightbox(fullSrc, image.alt);
    });
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

const openProjectFallback = () => {
  openLightbox(projectFallbackSrc, projectFallbackAlt, {
    label: "Project preview",
    mode: "project-fallback",
  });
};

const setupProjectFallbacks = () => {
  if (!projectCards.length) return;

  projectCards.forEach((card) => {
    const githubLink = card.querySelector(".project-github");
    if (!isMissingGithubLink(githubLink)) return;
    card.classList.add("no-github");
  });
};

setupProjectFallbacks();

const pdfLightbox = document.getElementById("pdfLightbox");
const pdfFrame = document.getElementById("pdfFrame");
const pdfShell = document.querySelector(".pdf-shell");
const docFallback = document.getElementById("docFallback");
const pdfClose = document.querySelector(".pdf-lightbox-close");
const pdfTitle = document.getElementById("pdfTitle");
const pdfOpenLink = document.getElementById("pdfOpenLink");
const pdfType = document.getElementById("pdfType");
const cvPreviewButton = document.getElementById("cvPreview");
const blogGrid = document.getElementById("blogGrid");
const loadMoreBlogs = document.getElementById("loadMoreBlogs");
const blogCards = document.querySelectorAll(".blog-card");
const blogPreviewButtons = document.querySelectorAll(".blog-preview");
const noteCards = document.querySelectorAll(".note-card");
const notePreviewButtons = document.querySelectorAll(".note-preview");
const initialBlogCount = 6;
const defaultPdfType = pdfType ? pdfType.textContent : "PDF";
const docFallbackText = docFallback ? docFallback.querySelector("p") : null;
const docFallbackDefault = docFallbackText ? docFallbackText.textContent : "";

const getPdfLabel = (src, title) => {
  if (title && title.trim()) return title.trim();
  if (!src) return "Document Preview";
  const fileName = decodeURIComponent(src.split("/").pop() || "");
  return fileName || "Document Preview";
};

const buildPdfViewerSrc = (src) => {
  if (!src) return "";
  const viewerFlags = "toolbar=0&navpanes=0&scrollbar=0";
  return src.includes("#") ? `${src}&${viewerFlags}` : `${src}#${viewerFlags}`;
};

const getFileExtension = (src) => {
  if (!src) return "";
  const cleanSrc = src.split("#")[0].split("?")[0];
  const parts = cleanSrc.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
};

const officeExtensions = new Set(["ppt", "pptx", "doc", "docx", "xls", "xlsx"]);

const isPrivateIpHost = (hostname) => {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part > 255)) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
};

const isLocalHostName = (hostname) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "[::1]" ||
  hostname === "::1" ||
  hostname.endsWith(".local");

const isPublicHost = (hostname) =>
  !isLocalHostName(hostname) && !isPrivateIpHost(hostname);

const canUseOfficeViewer = () => {
  const { protocol, hostname } = window.location;
  const isHttp = protocol === "http:" || protocol === "https:";
  return isHttp && isPublicHost(hostname);
};

const buildOfficeViewerSrc = (src) => {
  if (!src) return "";
  if (!canUseOfficeViewer()) return src;
  const absolute = new URL(src, window.location.href).href;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    absolute
  )}`;
};

const officePreviewFallback =
  "PowerPoint previews require a public URL. Please use Download or Open file.";

const getPreviewConfig = (src) => {
  const ext = getFileExtension(src);
  const typeLabel = ext ? ext.toUpperCase() : "DOC";

  if (ext === "pdf") {
    return {
      typeLabel: "PDF",
      viewerSrc: buildPdfViewerSrc(src),
      openLabel: "Open PDF",
      openHref: src,
    };
  }

  if (officeExtensions.has(ext)) {
    const officeReady = canUseOfficeViewer();
    const officeViewer = officeReady ? buildOfficeViewerSrc(src) : "";
    return {
      typeLabel,
      viewerSrc: officeViewer,
      openLabel: officeReady ? "Open in Office" : "Open file",
      openHref: officeReady ? officeViewer : src,
      fallbackMessage: officeReady ? "" : officePreviewFallback,
    };
  }

  return {
    typeLabel,
    viewerSrc: src,
    openLabel: "Open file",
    openHref: src,
  };
};

const openPdfLightbox = (src, title, options = {}) => {
  if (!pdfLightbox || !pdfFrame) return;
  const label = getPdfLabel(src, title);
  const typeLabel = options.typeLabel || defaultPdfType;
  const viewerSrc = options.viewerSrc || buildPdfViewerSrc(src);
  const openLabel =
    options.openLabel ||
    options.downloadLabel ||
    (options.download ? "Download file" : "Open file");
  const openHref = options.openHref || src;
  const fallbackMessage = options.fallbackMessage || "";
  const showFallback = Boolean(fallbackMessage);

  if (pdfShell) {
    pdfShell.classList.toggle("is-hidden", showFallback);
  }
  if (docFallback) {
    docFallback.classList.toggle("show", showFallback);
    if (docFallbackText) {
      docFallbackText.textContent = showFallback
        ? fallbackMessage
        : docFallbackDefault;
    }
  }

  pdfFrame.src = showFallback ? "" : viewerSrc;
  pdfFrame.title = label;
  if (pdfTitle) {
    pdfTitle.textContent = label;
  }
  if (pdfType) {
    pdfType.textContent = typeLabel;
  }
  if (pdfOpenLink) {
    pdfOpenLink.href = openHref;
    pdfOpenLink.textContent = openLabel;
    if (options.download) {
      pdfOpenLink.setAttribute("download", "");
    } else {
      pdfOpenLink.removeAttribute("download");
    }
  }
  pdfLightbox.classList.add("open");
  pdfLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("pdf-open");
};

const openDocumentPreview = (src, title) => {
  openPdfLightbox(src, title, getPreviewConfig(src));
};

const closePdfLightbox = () => {
  if (!pdfLightbox || !pdfFrame) return;
  pdfLightbox.classList.remove("open");
  pdfLightbox.setAttribute("aria-hidden", "true");
  pdfFrame.src = "";
  document.body.classList.remove("pdf-open");
  if (pdfOpenLink) {
    pdfOpenLink.textContent = "Open file";
    pdfOpenLink.removeAttribute("download");
  }
  if (pdfType) {
    pdfType.textContent = defaultPdfType;
  }
  if (pdfShell) {
    pdfShell.classList.remove("is-hidden");
  }
  if (docFallback) {
    docFallback.classList.remove("show");
  }
  if (docFallbackText) {
    docFallbackText.textContent = docFallbackDefault;
  }
};

if (cvPreviewButton) {
  cvPreviewButton.addEventListener("click", () => {
    const src = cvPreviewButton.dataset.pdf;
    if (!src) return;
    openPdfLightbox(src, "Curriculum Vitae", {
      download: true,
      downloadLabel: "Download CV",
    });
  });
}

if (pdfLightbox && pdfFrame) {
  if (blogPreviewButtons.length) {
    blogPreviewButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const card = button.closest(".blog-card");
        if (!card || !card.dataset.pdf) return;
        const title = card.querySelector("h4")?.textContent;
        openPdfLightbox(card.dataset.pdf, title);
      });
    });
  }

  if (blogCards.length) {
    blogCards.forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("a") || event.target.closest("button")) {
          return;
        }
        if (!card.dataset.pdf) return;
        const title = card.querySelector("h4")?.textContent;
        openPdfLightbox(card.dataset.pdf, title);
      });
    });
  }

  pdfLightbox.addEventListener("click", (event) => {
    if (event.target === pdfLightbox) {
      closePdfLightbox();
    }
  });

  if (pdfClose) {
    pdfClose.addEventListener("click", closePdfLightbox);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePdfLightbox();
    }
  });
}

if (notePreviewButtons.length) {
  notePreviewButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const card = button.closest(".note-card");
      if (!card || !card.dataset.file) return;
      const title = card.querySelector("h4")?.textContent || "Document Preview";
      openDocumentPreview(card.dataset.file, title);
    });
  });

  noteCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a") || event.target.closest("button")) {
        return;
      }
      if (!card.dataset.file) return;
      const title = card.querySelector("h4")?.textContent || "Document Preview";
      openDocumentPreview(card.dataset.file, title);
    });
  });
}

if (blogCards.length) {
  let visibleBlogCount = Math.min(initialBlogCount, blogCards.length);
  let blogsExpanded = false;

  const updateBlogVisibility = (immediate = false) => {
    blogCards.forEach((card, index) => {
      setElementVisibility(card, index < visibleBlogCount, immediate);
    });

    if (loadMoreBlogs) {
      const canToggle = blogCards.length > initialBlogCount;
      loadMoreBlogs.style.display = canToggle ? "inline-flex" : "none";
      loadMoreBlogs.textContent = blogsExpanded ? "Load less" : "Load more";
      loadMoreBlogs.setAttribute("aria-expanded", String(blogsExpanded));
    }
  };

  updateBlogVisibility(true);

  if (loadMoreBlogs) {
    loadMoreBlogs.addEventListener("click", () => {
      blogsExpanded = !blogsExpanded;
      visibleBlogCount = blogsExpanded
        ? blogCards.length
        : Math.min(initialBlogCount, blogCards.length);
      updateBlogVisibility();
      if (!blogsExpanded && blogGrid) {
        blogGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

const eventGrid = document.getElementById("eventGrid");
const loadMoreEvents = document.getElementById("loadMoreEvents");
const eventCards = document.querySelectorAll(".event-card");
const eventModal = document.getElementById("eventModal");
const eventModalTrack = document.getElementById("eventModalTrack");
const eventModalClose = document.querySelector(".event-modal-close");
const eventModalNav = document.querySelectorAll(".event-modal-nav");
const eventModalTitle = document.getElementById("eventModalTitle");
const eventModalText = document.getElementById("eventModalText");
const eventModalTag = document.getElementById("eventModalTag");
const eventModalYear = document.getElementById("eventModalYear");
let eventVideoObserver = null;
let eventVideoSoundEnabled = false;
const initialEventCount = 2;

const buildEventSlides = (mediaItems) => {
  if (!eventModalTrack) return;
  eventModalTrack.innerHTML = "";
  mediaItems.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "event-modal-slide";
    const clone = item.cloneNode(true);
    if (clone.removeAttribute) {
      clone.removeAttribute("loading");
    }
    slide.appendChild(clone);
    eventModalTrack.appendChild(slide);
  });
};

const setupEventVideoAutoplay = () => {
  if (!eventModalTrack || !("IntersectionObserver" in window)) return;
  if (eventVideoObserver) {
    eventVideoObserver.disconnect();
    eventVideoObserver = null;
  }

  const videos = Array.from(eventModalTrack.querySelectorAll("video"));
  if (!videos.length) return;

  videos.forEach((video) => {
    video.muted = !eventVideoSoundEnabled;
    video.playsInline = true;
    video.preload = "metadata";

    if (video.dataset.eventsBound !== "true") {
      video.addEventListener("pointerdown", () => {
        enableEventVideoSound(video);
      });

      video.addEventListener("play", () => {
        video.dataset.userPaused = "false";
      });

      video.addEventListener("pause", () => {
        if (video.dataset.systemPause !== "true") {
          video.dataset.userPaused = "true";
        }
      });

      video.dataset.eventsBound = "true";
    }
  });

  eventVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.muted = !eventVideoSoundEnabled;
          if (video.dataset.userPaused !== "true") {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {});
            }
          }
        } else {
          video.dataset.systemPause = "true";
          video.pause();
          video.dataset.systemPause = "false";
        }
      });
    },
    { root: eventModalTrack, threshold: 0.6 }
  );

  videos.forEach((video) => eventVideoObserver.observe(video));
};

const enableEventVideoSound = (video) => {
  eventVideoSoundEnabled = true;
  if (!video) return;
  video.muted = false;
  video.volume = 1;
};

const updateEventNav = () => {
  if (!eventModalTrack || !eventModalNav.length) return;
  const maxScroll = eventModalTrack.scrollWidth - eventModalTrack.clientWidth - 1;
  eventModalNav.forEach((button) => {
    const isPrev = button.dataset.direction === "prev";
    button.disabled = isPrev
      ? eventModalTrack.scrollLeft <= 0
      : eventModalTrack.scrollLeft >= maxScroll;
  });
};

const openEventModal = (card) => {
  if (!eventModal || !eventModalTrack) return;
  const title = card.querySelector("h3")?.textContent || "Event";
  const text = card.querySelector(".event-details p")?.textContent || "";
  const tag = card.querySelector(".event-meta .tag")?.textContent || "";
  const year = card.querySelector(".event-meta .year")?.textContent || "";
  const mediaItems = card.querySelectorAll(".event-images img, .event-images video");

  if (eventModalTitle) eventModalTitle.textContent = title;
  if (eventModalText) eventModalText.textContent = text;
  if (eventModalTag) eventModalTag.textContent = tag;
  if (eventModalYear) eventModalYear.textContent = year;

  buildEventSlides(mediaItems);
  eventModalTrack.scrollLeft = 0;
  updateEventNav();
  setupEventVideoAutoplay();

  eventModal.classList.add("open");
  eventModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("event-modal-open");
};

const closeEventModal = () => {
  if (!eventModal || !eventModalTrack) return;
  const videos = eventModalTrack.querySelectorAll("video");
  videos.forEach((video) => {
    video.pause();
  });
  if (eventVideoObserver) {
    eventVideoObserver.disconnect();
    eventVideoObserver = null;
  }
  eventModal.classList.remove("open");
  eventModal.setAttribute("aria-hidden", "true");
  eventModalTrack.innerHTML = "";
  document.body.classList.remove("event-modal-open");
};

if (eventCards.length) {
  let visibleEventCount = Math.min(initialEventCount, eventCards.length);
  let eventsExpanded = false;

  const updateEventVisibility = (immediate = false) => {
    eventCards.forEach((card, index) => {
      setElementVisibility(card, index < visibleEventCount, immediate);
    });

    if (loadMoreEvents) {
      const canToggle = eventCards.length > initialEventCount;
      loadMoreEvents.style.display = canToggle ? "inline-flex" : "none";
      loadMoreEvents.textContent = eventsExpanded ? "Load less" : "Load more";
      loadMoreEvents.setAttribute("aria-expanded", String(eventsExpanded));
    }
  };

  updateEventVisibility(true);

  if (loadMoreEvents) {
    loadMoreEvents.addEventListener("click", () => {
      eventsExpanded = !eventsExpanded;
      visibleEventCount = eventsExpanded
        ? eventCards.length
        : Math.min(initialEventCount, eventCards.length);
      updateEventVisibility();
      if (!eventsExpanded && eventGrid) {
        eventGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

if (eventCards.length && eventModal) {
  eventCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a") || event.target.closest("button")) {
        return;
      }
      openEventModal(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEventModal(card);
      }
    });
  });

  eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) {
      closeEventModal();
    }
  });

  if (eventModalClose) {
    eventModalClose.addEventListener("click", closeEventModal);
  }

  if (eventModalTrack && eventModalNav.length) {
    eventModalNav.forEach((button) => {
      button.addEventListener("click", () => {
        const direction = button.dataset.direction === "prev" ? -1 : 1;
        eventModalTrack.scrollBy({
          left: eventModalTrack.clientWidth * direction,
          behavior: "smooth",
        });
      });
    });

    eventModalTrack.addEventListener("scroll", updateEventNav);
    window.addEventListener("resize", updateEventNav);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEventModal();
    }
  });
}

const photoGrid = document.getElementById("photoGrid");
const photoGridWrap = document.getElementById("photoGridWrap");
const loadMorePhotos = document.getElementById("loadMorePhotos");
const photoItems = photoGrid
  ? Array.from(photoGrid.querySelectorAll(".pin-item"))
  : [];
const initialPhotoCount = 12;

if (photoItems.length) {
  let visibleCount = Math.min(initialPhotoCount, photoItems.length);
  let isExpanded = false;

  const updatePhotoVisibility = (immediate = false) => {
    photoItems.forEach((item, index) => {
      setElementVisibility(item, index < visibleCount, immediate);
    });

    const hasHidden = visibleCount < photoItems.length;
    if (loadMorePhotos) {
      loadMorePhotos.style.display = photoItems.length > initialPhotoCount ? "inline-flex" : "none";
      loadMorePhotos.textContent = isExpanded ? "Load less" : "Load more";
      loadMorePhotos.setAttribute("aria-expanded", String(isExpanded));
    }
    if (photoGridWrap) {
      photoGridWrap.classList.toggle("expanded", !hasHidden);
    }
  };

  updatePhotoVisibility(true);

  if (loadMorePhotos) {
    loadMorePhotos.addEventListener("click", () => {
      isExpanded = !isExpanded;
      visibleCount = isExpanded ? photoItems.length : Math.min(initialPhotoCount, photoItems.length);
      updatePhotoVisibility();
      if (!isExpanded && photoGridWrap) {
        photoGridWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

const githubSection = document.querySelector(".github-commits");
const githubYearTabs = document.getElementById("githubYearTabs");
const githubGrid = document.getElementById("githubGrid");
const githubMonths = document.getElementById("githubMonths");
const githubSummary = document.getElementById("githubSummary");

const setGithubStatus = (message) => {
  if (!githubGrid) return;
  githubGrid.innerHTML = "";
  if (githubMonths) {
    githubMonths.innerHTML = "";
  }
  const status = document.createElement("div");
  status.className = "github-status";
  status.textContent = message;
  githubGrid.appendChild(status);
};

const formatGithubTotal = (count, year) => {
  if (typeof count !== "number") return `Contributions in ${year}`;
  const formatted = count.toLocaleString();
  const label = count === 1 ? "contribution" : "contributions";
  return `${formatted} ${label} in ${year}`;
};

const renderGithubGrid = (contributions, year) => {
  if (!githubGrid) return;
  const map = new Map();
  (contributions || []).forEach((item) => {
    if (item && item.date) {
      map.set(item.date, item);
    }
  });

  const weeks = [];
  let week = new Array(7).fill(null);
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));

  for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    const dayIndex = date.getUTCDay();
    const key = date.toISOString().slice(0, 10);
    const item = map.get(key) || { date: key, count: 0, level: 0 };
    week[dayIndex] = item;

    if (dayIndex === 6) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
  }

  if (week.some((day) => day !== null)) {
    weeks.push(week);
  }

  githubGrid.innerHTML = "";
  renderGithubMonths(weeks);
  weeks.forEach((weekDays) => {
    const weekEl = document.createElement("div");
    weekEl.className = "github-week";

    weekDays.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "github-day";
      if (!day) {
        cell.classList.add("is-empty");
      } else {
        const level = Number(day.level || 0);
        cell.dataset.level = String(level);
        const count = Number(day.count || 0);
        cell.title = `${count} contribution${count === 1 ? "" : "s"} on ${day.date}`;
      }
      weekEl.appendChild(cell);
    });

    githubGrid.appendChild(weekEl);
  });
};

const renderGithubMonths = (weeks) => {
  if (!githubMonths) return;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  githubMonths.innerHTML = "";

  weeks.forEach((weekDays) => {
    let label = "";
    for (const day of weekDays) {
      if (!day || !day.date) continue;
      const date = new Date(`${day.date}T00:00:00Z`);
      if (date.getUTCDate() === 1) {
        label = monthNames[date.getUTCMonth()];
        break;
      }
    }

    const cell = document.createElement("div");
    cell.className = "github-month-cell";
    if (label) {
      const span = document.createElement("span");
      span.className = "github-month-label";
      span.textContent = label;
      cell.appendChild(span);
    }
    githubMonths.appendChild(cell);
  });
};

const initGithubDashboard = async () => {
  if (!githubSection || !githubYearTabs || !githubGrid) return;
  const githubUser = githubSection.dataset.githubUser;
  if (!githubUser) {
    setGithubStatus("GitHub profile is not linked for this portfolio.");
    return;
  }

  const baseUrl = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(githubUser)}`;
  setGithubStatus("Loading contributions...");

  try {
    const response = await fetch(baseUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error("Failed to fetch contributions.");
    }
    const data = await response.json();
    const totals = data.total || {};
    const years = Object.keys(totals)
      .filter((key) => /^\d{4}$/.test(key))
      .sort((a, b) => Number(b) - Number(a));

    if (!years.length) {
      setGithubStatus("No contribution data available.");
      return;
    }

    const activeYear = years[0];
    githubYearTabs.innerHTML = "";
    years.forEach((year) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pill";
      button.dataset.year = year;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(year === activeYear));
      button.textContent = year;
      githubYearTabs.appendChild(button);
    });

    const updateActiveTab = (year) => {
      githubYearTabs.querySelectorAll("button").forEach((button) => {
        const isActive = button.dataset.year === String(year);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });
    };

    const loadYear = async (year) => {
      updateActiveTab(year);
      setGithubStatus("Loading contributions...");

      const yearResponse = await fetch(`${baseUrl}?y=${year}`, {
        headers: { Accept: "application/json" },
      });
      if (!yearResponse.ok) {
        throw new Error("Failed to fetch year contributions.");
      }
      const yearData = await yearResponse.json();
      const contributions = yearData.contributions || [];
      const totalCount =
        typeof totals[year] === "number"
          ? totals[year]
          : contributions.reduce((sum, item) => sum + (item.count || 0), 0);
      if (githubSummary) {
        githubSummary.textContent = formatGithubTotal(totalCount, year);
      }
      renderGithubGrid(contributions, Number(year));
    };

    githubYearTabs.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      const year = target.dataset.year;
      if (!year) return;
      loadYear(year).catch(() => {
        setGithubStatus("Unable to load contributions.");
      });
    });

    await loadYear(activeYear);
  } catch (error) {
    setGithubStatus("Unable to load GitHub contributions.");
  }
};

initGithubDashboard();

