const contactToggle = document.getElementById('newsContactToggle');
const contactRow = document.getElementById('newsContactRow');

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
