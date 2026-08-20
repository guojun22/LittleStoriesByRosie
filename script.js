/* ============================================================
   SCROLL ANIMATIONS
   This makes elements gently fade in as you scroll down the page.
   It's your first bit of JavaScript — read the comments to see
   how it works.
   ============================================================ */

// 1. Decide WHICH elements should animate.
//    We list the parts of each section we want to fade in.
const selectors = [
  '.about-text', '.about-photo',
  '.info-photo', '.pricing-label', '.price-col', '.info-cta',
  '.pf-item',
  '.journal > .eyebrow', '.journal > h2', '.post',
  '.contact-info', '.contact-form'
];

// Grab every matching element on the page and tag it with the "reveal"
// class (which starts it invisible, per our CSS).
const items = document.querySelectorAll(selectors.join(','));
items.forEach(el => el.classList.add('reveal'));

// 2. Add a small STAGGER so grouped items (cards, posts) appear one
//    after another instead of all at once. We give each item in a
//    group a slightly longer delay.
const groups = ['.portfolio-grid', '.posts'];
groups.forEach(groupSelector => {
  const group = document.querySelector(groupSelector);
  if (!group) return;
  const children = group.querySelectorAll('.reveal');
  children.forEach((child, index) => {
    child.style.transitionDelay = (index * 0.12) + 's';
  });
});

// 3. Watch the page as the visitor scrolls. An "IntersectionObserver"
//    is a built-in browser tool that tells us when an element enters
//    the screen. When it does, we add the "is-visible" class — which
//    triggers the fade-in from our CSS.
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // animate once, then stop watching
    }
  });
}, {
  threshold: 0.15 // trigger when ~15% of the element is visible
});

// Start watching every element we tagged.
items.forEach(el => observer.observe(el));


/* ============================================================
   HERO SLIDESHOW
   Slowly crossfades through the hero photos. Only the slide with
   the "is-active" class is visible; we move that class along the
   list on a timer.
   ============================================================ */
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 1) {
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length; // wrap back to the first
    slides[current].classList.add('is-active');
  }, 5000); // change photo every 5 seconds
}


/* ============================================================
   GALLERY CAROUSEL ARROWS (only runs on gallery pages)
   Clicking the arrows scrolls the photo strip left or right.
   ============================================================ */
const track = document.querySelector('.gallery-track');
if (track) {
  const prevBtn = document.querySelector('.arrow.prev');
  const nextBtn = document.querySelector('.arrow.next');
  const step = () => track.clientWidth * 0.8; // scroll ~80% of the visible width

  if (prevBtn) prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });
}


/* ============================================================
   CONTACT FORM — show a "Thank you" message after submitting.
   For now this just swaps the form for a confirmation message.
   When we connect a form service (Formspree), we'll first send
   the data, then show this same message.
   ============================================================ */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // stop the browser's default page reload
    contactForm.innerHTML =
      '<div class="form-thanks">' +
        '<p>Thank you!</p>' +
        '<p>We will be in touch with you shortly!</p>' +
      '</div>';
  });
}
