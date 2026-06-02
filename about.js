const modal = document.getElementById('pinModal');
const modalImage = document.getElementById('pinModalImage');
const modalTitle = document.getElementById('pinModalTitle');
const modalDescription = document.getElementById('pinModalDescription');
const modalMeta = document.getElementById('pinModalMeta');
const modalMedia = document.querySelector('.pin-modal-media');
const previousStepButton = document.getElementById('pinModalPrev');
const nextStepButton = document.getElementById('pinModalNext');
const closeButton = document.getElementById('pinModalClose');
const pinTriggers = Array.from(document.querySelectorAll('.pin-trigger'));
const storyButtons = Array.from(document.querySelectorAll('.story-highlight'));
const feedFilterButtons = Array.from(document.querySelectorAll('.about-feed-filter'));
const filterMenuButton = document.getElementById('aboutFilterMenuButton');
const filterMenu = document.getElementById('aboutFilterMenu');
const aboutContactToggle = document.getElementById('aboutContactToggle');
const aboutContactRow = document.getElementById('aboutContactRow');

const POST_IMAGE_SHUFFLE_MS = 2600;

let activeStoryCards = [];
let activeStoryLabel = '';
let activeStoryIndex = 0;
let activePostImages = [];
let activeImageIndex = 0;
let postImageShuffleId;

function closeFilterMenu() {
  if (!filterMenuButton || !filterMenu) {
    return;
  }

  filterMenu.classList.remove('is-open');
  filterMenuButton.setAttribute('aria-expanded', 'false');
}

function openFilterMenu() {
  if (!filterMenuButton || !filterMenu) {
    return;
  }

  filterMenu.classList.add('is-open');
  filterMenuButton.setAttribute('aria-expanded', 'true');
}

function applyStoryFrameShape(ratio) {
  if (!modalMedia || !ratio) {
    return;
  }

  const isSquare = ratio >= 0.88 && ratio <= 1.12;
  const isPortrait = ratio < 0.88;
  modalMedia.classList.toggle('is-square', isSquare);
  modalMedia.classList.toggle('is-portrait', isPortrait);
}

function updateStoryFrameShapeFromFirstImage() {
  if (!activePostImages.length) {
    return;
  }

  const baseImage = new Image();
  baseImage.addEventListener('load', () => {
    if (!baseImage.naturalWidth || !baseImage.naturalHeight) {
      return;
    }

    const ratio = baseImage.naturalWidth / baseImage.naturalHeight;
    applyStoryFrameShape(ratio);
  });
  baseImage.src = activePostImages[0];
}

function stopPostImageShuffle() {
  if (postImageShuffleId) {
    window.clearInterval(postImageShuffleId);
    postImageShuffleId = undefined;
  }
}

function startPostImageShuffle() {
  stopPostImageShuffle();

  if (!modal.classList.contains('is-open') || activePostImages.length < 2) {
    return;
  }

  postImageShuffleId = window.setInterval(() => {
    activeImageIndex = (activeImageIndex + 1) % activePostImages.length;
    renderModalCard({ preserveImageIndex: true, refreshShuffle: false });
  }, POST_IMAGE_SHUFFLE_MS);
}

function getPostImages(trigger) {
  const fallbackImage = trigger.dataset.image || 'photos/headshot_id.jpeg';
  const imageList = (trigger.dataset.images || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  if (imageList.length === 0) {
    imageList.push(fallbackImage);
  }

  return imageList;
}

function renderModalCard(options = {}) {
  const {
    preserveImageIndex = false,
    startFromEnd = false,
    refreshShuffle = true,
  } = options;
  const trigger = activeStoryCards[activeStoryIndex];
  if (!trigger) {
    return;
  }

  const title = trigger.dataset.title || 'Research Pin';
  const description = trigger.dataset.description || 'Add your description here.';

  activePostImages = getPostImages(trigger);

  if (!preserveImageIndex) {
    activeImageIndex = startFromEnd ? activePostImages.length - 1 : 0;
    updateStoryFrameShapeFromFirstImage();
  }

  if (activeImageIndex >= activePostImages.length) {
    activeImageIndex = 0;
  }

  if (activeImageIndex < 0) {
    activeImageIndex = activePostImages.length - 1;
  }

  const image = activePostImages[activeImageIndex];

  modalTitle.textContent = title;
  modalImage.src = image;
  modalImage.alt = title;
  modalImage.classList.toggle('is-crop-fit', activeImageIndex > 0);
  modalDescription.textContent = description;

  const hasStorySlides = activeStoryCards.length > 1;
  const hasImageSlides = activePostImages.length > 1;
  const canStep = hasStorySlides || hasImageSlides;

  if (hasStorySlides) {
    const photoMeta = hasImageSlides ? ` • Photo ${activeImageIndex + 1}/${activePostImages.length}` : '';
    modalMeta.textContent = `${activeStoryLabel} story • ${activeStoryIndex + 1}/${activeStoryCards.length}${photoMeta}`;
  } else if (hasImageSlides) {
    modalMeta.textContent = `Photo ${activeImageIndex + 1}/${activePostImages.length}`;
  } else {
    modalMeta.textContent = activeStoryLabel ? `${activeStoryLabel} story` : '';
  }

  if (canStep) {
    previousStepButton.disabled = false;
    nextStepButton.disabled = false;
  } else {
    previousStepButton.disabled = true;
    nextStepButton.disabled = true;
  }

  if (refreshShuffle) {
    startPostImageShuffle();
  }
}

function openModalFromCards(cards, index, label) {
  activeStoryCards = cards;
  activeStoryIndex = index;
  activeStoryLabel = label;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  renderModalCard();
}

function openModal(trigger) {
  openModalFromCards([trigger], 0, '');
}

function stepStory(delta) {
  const imageCandidate = activeImageIndex + delta;
  const hasImageSlides = activePostImages.length > 1;
  const hasStorySlides = activeStoryCards.length > 1;

  if (hasImageSlides && imageCandidate >= 0 && imageCandidate < activePostImages.length) {
    activeImageIndex = imageCandidate;
    renderModalCard({ preserveImageIndex: true });
    return;
  }

  if (hasImageSlides && !hasStorySlides) {
    activeImageIndex = (imageCandidate + activePostImages.length) % activePostImages.length;
    renderModalCard({ preserveImageIndex: true });
    return;
  }

  if (!hasStorySlides) {
    return;
  }

  const total = activeStoryCards.length;
  activeStoryIndex = (activeStoryIndex + delta + total) % total;
  renderModalCard({ startFromEnd: delta < 0 });
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopPostImageShuffle();
}

pinTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openModal(trigger));
});

storyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedStory = button.dataset.story || '';
    const storyCards = pinTriggers.filter((card) => {
      const categories = (card.dataset.category || '').split(/\s+/);
      return categories.includes(selectedStory);
    });

    if (storyCards.length === 0) {
      return;
    }

    const storyLabel = selectedStory.charAt(0).toUpperCase() + selectedStory.slice(1);
    openModalFromCards(storyCards, 0, storyLabel);
  });
});

feedFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter || 'all';

    feedFilterButtons.forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });

    pinTriggers.forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/);
      const shouldShow =
        selectedFilter === 'all' || categories.includes(selectedFilter);

      card.classList.toggle('is-hidden', !shouldShow);
      card.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    });

    if (filterMenuButton && filterMenu) {
      closeFilterMenu();
    }
  });
});

if (filterMenuButton && filterMenu) {
  closeFilterMenu();

  filterMenuButton.addEventListener('click', () => {
    const isOpen = filterMenu.classList.contains('is-open');
    if (isOpen) {
      closeFilterMenu();
    } else {
      openFilterMenu();
    }
  });
}

if (previousStepButton) {
  previousStepButton.addEventListener('click', () => stepStory(-1));
}

if (nextStepButton) {
  nextStepButton.addEventListener('click', () => stepStory(1));
}

closeButton.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('click', (event) => {
  if (!filterMenuButton || !filterMenu || !filterMenu.classList.contains('is-open')) {
    return;
  }

  if (!filterMenu.contains(event.target) && !filterMenuButton.contains(event.target)) {
    closeFilterMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
  }

  if (event.key === 'Escape' && filterMenuButton && filterMenu && filterMenu.classList.contains('is-open')) {
    closeFilterMenu();
  }

  if (event.key === 'ArrowLeft' && modal.classList.contains('is-open')) {
    stepStory(-1);
  }

  if (event.key === 'ArrowRight' && modal.classList.contains('is-open')) {
    stepStory(1);
  }
});

if (modalImage) {
  modalImage.addEventListener('load', () => {
    if (activePostImages.length === 0) {
      return;
    }

    if (activeImageIndex === 0 && modalImage.naturalWidth && modalImage.naturalHeight) {
      const ratio = modalImage.naturalWidth / modalImage.naturalHeight;
      applyStoryFrameShape(ratio);
    }
  });
}

if (aboutContactToggle && aboutContactRow) {
  function openAboutContactRow() {
    aboutContactRow.classList.add('is-open');
    aboutContactToggle.setAttribute('aria-expanded', 'true');
  }

  function closeAboutContactRow() {
    aboutContactRow.classList.remove('is-open');
    aboutContactToggle.setAttribute('aria-expanded', 'false');
  }

  aboutContactToggle.addEventListener('click', () => {
    const isOpen = aboutContactRow.classList.contains('is-open');
    if (isOpen) {
      closeAboutContactRow();
    } else {
      openAboutContactRow();
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!aboutContactRow.classList.contains('is-open')) {
      return;
    }

    if (!aboutContactToggle.contains(target) && !aboutContactRow.contains(target)) {
      closeAboutContactRow();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAboutContactRow();
    }
  });
}
