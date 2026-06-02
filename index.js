const deck = document.querySelector('.news-deck');
const cards = Array.from(document.querySelectorAll('.news-track .news-card'));
const contactToggle = document.getElementById('homeContactToggle');
const contactRow = document.getElementById('homeContactRow');
const cornerGreeter = document.querySelector('.corner-greeter');

if (deck && cards.length > 0) {
  let centerIndex = 0;
  let intervalId;
  let autoDirection = 'next';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyDeckState() {
    const total = cards.length;

    cards.forEach((card, index) => {
      card.classList.remove('is-center', 'is-left', 'is-right', 'is-back');

      const delta = (index - centerIndex + total) % total;

      if (delta === 0) {
        card.classList.add('is-center');
      } else if (delta === 1) {
        card.classList.add('is-right');
      } else if (delta === total - 1) {
        card.classList.add('is-left');
      } else {
        card.classList.add('is-back');
      }
    });
  }

  function shuffleForward() {
    centerIndex = (centerIndex + 1) % cards.length;
    applyDeckState();
  }

  function shuffleBackward() {
    centerIndex = (centerIndex - 1 + cards.length) % cards.length;
    applyDeckState();
  }

  function moveDeck(direction) {
    if (direction === 'prev') {
      shuffleBackward();
    } else {
      shuffleForward();
    }
  }

  function runAutoStep() {
    moveDeck(autoDirection);
  }

  function stopAutoShuffle() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  function startAutoShuffle() {
    if (window.innerWidth <= 700 || reducedMotion.matches || cards.length < 2) {
      stopAutoShuffle();
      return;
    }

    stopAutoShuffle();
    intervalId = window.setInterval(runAutoStep, 2600);
  }

  function getDirectionFromMouse(event) {
    const rect = deck.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    return event.clientX < midpoint ? 'prev' : 'next';
  }

  applyDeckState();
  startAutoShuffle();

  deck.addEventListener('click', (event) => {
    if (window.innerWidth <= 700 || cards.length < 2) {
      return;
    }

    const direction = getDirectionFromMouse(event);
    autoDirection = direction;
    moveDeck(direction);
    startAutoShuffle();
  });

  deck.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      autoDirection = 'prev';
      moveDeck('prev');
      startAutoShuffle();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      autoDirection = 'next';
      moveDeck('next');
      startAutoShuffle();
    }
  });

  window.addEventListener('resize', startAutoShuffle);
  reducedMotion.addEventListener('change', startAutoShuffle);
}

if (contactToggle && contactRow) {
  function openContactRow() {
    contactRow.classList.add('is-open');
    contactToggle.setAttribute('aria-expanded', 'true');
  }

  function closeContactRow() {
    contactRow.classList.remove('is-open');
    contactToggle.setAttribute('aria-expanded', 'false');
  }

  contactToggle.addEventListener('click', () => {
    const isOpen = contactRow.classList.contains('is-open');
    if (isOpen) {
      closeContactRow();
    } else {
      openContactRow();
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!contactRow.classList.contains('is-open')) {
      return;
    }

    if (!contactToggle.contains(target) && !contactRow.contains(target)) {
      closeContactRow();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeContactRow();
    }
  });
}

if (cornerGreeter) {
  function updateGreeterVisibility() {
    const shouldHide = window.scrollY > 24;
    cornerGreeter.classList.toggle('is-hidden', shouldHide);
  }

  updateGreeterVisibility();
  window.addEventListener('scroll', updateGreeterVisibility, { passive: true });
}
