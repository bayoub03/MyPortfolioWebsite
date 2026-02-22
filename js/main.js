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
    var open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.classList.toggle('nav-open', open);
  });

  function closeNav() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
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

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
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
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(cacheSectionRects, 200);
  }, { passive: true });

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
