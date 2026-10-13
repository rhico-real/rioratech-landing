(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const networkField = document.getElementById('network-field');
  const activityCard = document.getElementById('activity-card');
  if (networkField && window.VANTA?.NET && window.THREE) {
    try {
      window.VANTA.NET({
        el: networkField,
        THREE: window.THREE,
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0xf07404,
        backgroundColor: 0xfdfdfb,
        backgroundAlpha: 0,
        points: 10,
        maxDistance: 20,
        spacing: 15,
        showDots: false
      });
    } catch (error) {
      // If the animation library is unavailable, the hero stays clean and readable.
    }
  }

  const activityEntries = [
    { date: '2026-10-07', dateLabel: '07 OCT 2026', title: 'Mapped the approval flow', summary: 'Outlined roles, review steps, and handoffs for a sample operations platform.', status: 'PLANNING' },
    { date: '2026-10-06', dateLabel: '06 OCT 2026', title: 'Refined the dashboard layout', summary: 'Grouped sample daily metrics so the next action is easy to find.', status: 'DESIGN' },
    { date: '2026-10-05', dateLabel: '05 OCT 2026', title: 'Connected notification states', summary: 'Sketched how a team could track new requests, progress, and follow-ups.', status: 'PROTOTYPE' },
    { date: '2026-10-02', dateLabel: '02 OCT 2026', title: 'Reviewed account permissions', summary: 'Listed sample access rules for a workspace with different team roles.', status: 'IN REVIEW' }
  ];
  if (activityCard) {
    const activityPanel = activityCard.closest('.hero-activity');
    const activityFields = {
      date: document.getElementById('activity-date'),
      count: document.getElementById('activity-count'),
      title: document.getElementById('activity-title'),
      summary: document.getElementById('activity-summary'),
      status: document.getElementById('activity-status')
    };
    const activityNext = document.getElementById('activity-next');
    let activityIndex = 0;
    let activityTransition;
    const showNextActivity = () => {
      if (document.hidden) return;
      let nextIndex = activityIndex;
      while (nextIndex === activityIndex) nextIndex = Math.floor(Math.random() * activityEntries.length);
      window.clearTimeout(activityTransition);
      activityCard.classList.add('is-changing');
      activityTransition = window.setTimeout(() => {
        activityIndex = nextIndex;
        const entry = activityEntries[activityIndex];
        activityFields.date.dateTime = entry.date;
        activityFields.date.textContent = entry.dateLabel;
        activityFields.count.textContent = `${String(activityIndex + 1).padStart(2, '0')} / 04`;
        activityFields.title.textContent = entry.title;
        activityFields.summary.textContent = entry.summary;
        activityFields.status.textContent = entry.status;
        requestAnimationFrame(() => activityCard.classList.remove('is-changing'));
      }, 280);
    };
    activityNext?.addEventListener('click', showNextActivity);
    const holdActivity = () => {
      window.clearTimeout(activityTransition);
      activityCard.classList.remove('is-changing');
    };
    activityPanel?.addEventListener('pointerenter', holdActivity);
    activityPanel?.addEventListener('focusin', holdActivity);
    if (!reducedMotion) {
      window.setInterval(() => {
        const pointerIsOverPanel = activityPanel?.matches(':hover');
        const focusIsInPanel = activityPanel?.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
        if (!pointerIsOverPanel && !focusIsInPanel) showNextActivity();
      }, 3200);
    }
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navLinks?.classList.toggle('is-open', open);
  });
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
    navLinks.classList.remove('is-open');
  }));

  const track = document.getElementById('solution-track');
  const slides = [...(track?.querySelectorAll('.project-slide') || [])];
  const projectType = document.getElementById('project-type');
  const projectTitle = document.getElementById('project-title');
  const projectSummary = document.getElementById('project-summary');
  const projectTags = document.getElementById('project-tags');
  let activeIndex = -1;
  let frame = 0;
  let settleTimer;
  let dragState = null;
  let suppressClickUntil = 0;
  let coverflowInView = false;

  const syncVideoPlayback = () => {
    const selected = slides[activeIndex];
    const canPlay = coverflowInView && !document.hidden && Boolean(selected);
    slides.forEach((slide) => {
      const video = slide.querySelector('video');
      if (!video) return;
      if (canPlay && slide === selected) {
        video.muted = true;
        video.playsInline = true;
        if (video.paused) video.play().catch(() => {});
      } else video.pause();
    });
  };

  const updateCoverFlow = () => {
    frame = 0;
    if (!track || !slides.length) return;
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const delta = rect.left + rect.width / 2 - center;
      const progress = delta / Math.max(rect.width, 1);
      const distance = Math.abs(delta);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
      slide.style.setProperty('--rotation', `${Math.max(-1, Math.min(1, progress)) * -42}deg`);
      slide.style.setProperty('--shift', `${Math.max(-1, Math.min(1, progress)) * -22}px`);
      slide.style.setProperty('--cover-scale', `${Math.max(.76, 1 - Math.min(Math.abs(progress), 1) * .22)}`);
    });
    if (nearestIndex !== activeIndex) {
      activeIndex = nearestIndex;
      slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeIndex));
      const selected = slides[activeIndex];
      if (projectType) projectType.textContent = selected.dataset.type || '';
      if (projectTitle) projectTitle.textContent = selected.dataset.title || '';
      if (projectSummary) projectSummary.textContent = selected.dataset.description || '';
      if (projectTags) {
        projectTags.replaceChildren(...(selected.dataset.tags || '').split('|').filter(Boolean).map((tag) => {
          const item = document.createElement('li');
          item.textContent = tag;
          return item;
        }));
      }
      syncVideoPlayback();
    }
  };
  const requestCoverFlowUpdate = () => {
    if (!frame) frame = requestAnimationFrame(updateCoverFlow);
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(syncVideoPlayback, 140);
  };
  if (track && slides.length) {
    const previewViewport = track.closest('.coverflow-viewport') || track;
    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        coverflowInView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncVideoPlayback();
      }, { threshold: [0, 0.15] });
      visibilityObserver.observe(previewViewport);
    } else {
      const updateVisibility = () => {
        const bounds = previewViewport.getBoundingClientRect();
        coverflowInView = bounds.top < window.innerHeight && bounds.bottom > 0;
        syncVideoPlayback();
      };
      window.addEventListener('scroll', updateVisibility, { passive: true });
      window.addEventListener('resize', updateVisibility, { passive: true });
      updateVisibility();
    }
    document.addEventListener('visibilitychange', syncVideoPlayback);
    track.addEventListener('scroll', requestCoverFlowUpdate, { passive: true });
    window.addEventListener('resize', requestCoverFlowUpdate, { passive: true });
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragState = { pointerId: event.pointerId, startX: event.clientX, startScroll: track.scrollLeft, moved: false };
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener('pointermove', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const delta = event.clientX - dragState.startX;
      if (Math.abs(delta) > 4) dragState.moved = true;
      if (dragState.moved) {
        event.preventDefault();
        track.scrollLeft = dragState.startScroll - delta;
      }
    });
    const finishDrag = (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      if (dragState.moved) suppressClickUntil = performance.now() + 250;
      dragState = null;
    };
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const nextIndex = Math.max(0, Math.min(slides.length - 1, activeIndex + (event.key === 'ArrowRight' ? 1 : -1)));
        slides[nextIndex].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    track.querySelectorAll('.project-slide').forEach((slide, index) => {
      slide.addEventListener('click', () => {
        if (performance.now() < suppressClickUntil) return;
        if (index !== activeIndex) slide.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      });
    });
    document.querySelectorAll('.coverflow-control').forEach((button) => button.addEventListener('click', () => {
      const direction = button.dataset.direction === 'next' ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(slides.length - 1, activeIndex + direction));
      slides[nextIndex].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }));
    requestAnimationFrame(() => {
      const initialSlide = slides[Math.floor(slides.length / 2)];
      if (!initialSlide) return requestCoverFlowUpdate();
      const trackRect = track.getBoundingClientRect();
      const slideRect = initialSlide.getBoundingClientRect();
      const scrollBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft += slideRect.left + slideRect.width / 2 - (trackRect.left + trackRect.width / 2);
      track.style.scrollBehavior = scrollBehavior;
      requestCoverFlowUpdate();
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
