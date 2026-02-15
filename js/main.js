(function() {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function getEffectiveTheme() {
    return root.getAttribute('data-theme');
  }

  function updateToggleButton(theme) {
    themeToggle.setAttribute('data-active', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  updateToggleButton(getEffectiveTheme());

  themeToggle.addEventListener('click', function() {
    const current = getEffectiveTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateToggleButton(next);
  });

  // Mobile nav toggle
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', function() {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  function closeNav() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  // Close mobile nav on link click or outside click
  links.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', function(e) {
    if (links.classList.contains('open') && !e.target.closest('.nav')) {
      closeNav();
    }
  });

  // IntersectionObserver for phase reveal
  const phases = document.querySelectorAll('.phase');
  const phaseObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        phaseObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  phases.forEach(function(phase, index) {
    phase.style.transitionDelay = (index * 0.05) + 's';
    phaseObserver.observe(phase);
  });

  // Shield rating generation
  const shieldPath = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
  let clipCounter = 0;
  document.querySelectorAll('.skill-shields').forEach(function(container) {
    const rating = parseFloat(container.getAttribute('data-rating')) || 0;
    const colorClass = container.getAttribute('data-color') || 'ochre';
    const displayRating = rating % 1 === 0.5 ? rating.toFixed(1) : rating.toFixed(0);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      let state = 'empty';
      if (i <= rating) state = 'full';
      else if (i - 0.5 <= rating) state = 'half';
      if (state === 'half') {
        const clipId = 'shalf-' + (clipCounter++);
        html += '<span class="skill-shield" data-state="half">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<defs><clipPath id="' + clipId + '">' +
          '<rect x="0" y="0" width="12" height="24"/></clipPath></defs>' +
          '<path class="shield-bg" d="' + shieldPath + '"/>' +
          '<path class="shield-fill ' + colorClass + '" d="' + shieldPath + '" clip-path="url(#' + clipId + ')"/>' +
          '</svg></span>';
      } else {
        html += '<span class="skill-shield" data-state="' + state + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path class="shield-bg" d="' + shieldPath + '"/>' +
          '<path class="shield-fill ' + colorClass + '" d="' + shieldPath + '"/>' +
          '</svg></span>';
      }
    }
    html += '<span class="skill-rating-text" aria-hidden="true">' + displayRating + '/5</span>';
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', 'Rating: ' + displayRating + ' out of 5');
    container.innerHTML = html;
  });

  // Stagger-reveal skill shields
  const skillCategories = document.querySelectorAll('.skills-category');
  const shieldObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const shields = entry.target.querySelectorAll('.skill-shield');
        shields.forEach(function(shield, i) {
          shield.style.transitionDelay = (i * 0.04) + 's';
        });
        entry.target.classList.add('shields-visible');
        shieldObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  skillCategories.forEach(function(cat) {
    shieldObserver.observe(cat);
  });

  // Active nav link on scroll + scroll-to-top (merged)
  const navAnchors = document.querySelectorAll('.nav-links a');
  const scrollTopBtn = document.getElementById('scrollTop');

  let sectionRects = [];
  function cacheSectionRects() {
    sectionRects = Array.from(phases).map(function(section) {
      return {
        id: section.getAttribute('id'),
        top: section.offsetTop,
        height: section.offsetHeight,
        el: section
      };
    });
  }
  cacheSectionRects();
  window.addEventListener('resize', cacheSectionRects, { passive: true });

  function onScroll() {
    const sy = window.scrollY;

    // Active nav
    let activeId = null;
    const atBottom = (window.innerHeight + sy) >= (document.body.scrollHeight - 2);
    if (atBottom) {
      activeId = sectionRects[sectionRects.length - 1].id;
    } else {
      const offset = sy + 120;
      for (let i = 0; i < sectionRects.length; i++) {
        if (offset >= sectionRects[i].top && offset < sectionRects[i].top + sectionRects[i].height) {
          activeId = sectionRects[i].id;
          break;
        }
      }
    }
    navAnchors.forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
    });
    sectionRects.forEach(function(rect) {
      rect.el.classList.toggle('phase-active', rect.id === activeId);
    });

    // Scroll-to-top
    if (sy > 600) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  let scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        onScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  onScroll();

  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
