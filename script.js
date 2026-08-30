/* ============================================================
   GLOBAL NAV HEIGHT
   Several sticky elements on different pages (the contact banner's
   sticky photo, for one) need to sit exactly below the nav once
   "stuck," matching where they already sit in normal flow. Measuring
   the real height here — rather than guessing a fixed number — keeps
   that lined up across browsers/zoom/font-loading.
   ============================================================ */
const globalNav = document.querySelector('.nav');
if (globalNav) {
  const updateGlobalNavHeight = () => {
    document.documentElement.style.setProperty('--nav-h', globalNav.getBoundingClientRect().height + 'px');
  };
  updateGlobalNavHeight();
  window.addEventListener('resize', updateGlobalNavHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateGlobalNavHeight);
  }
}

/* ============================================================
   CATEGORY LIST — REAL MEASUREMENTS
   The pinned header stack's math depends on the nav bar's height (each
   header sticks just below it) and each header's own height (so the
   second and third headers stack cleanly below the first, and the
   panels start right where the full stack ends). Both real rendered
   sizes vary slightly by browser/OS/zoom/font-loading, so we measure
   them for real here instead of guessing fixed numbers — keeping
   everything in sync with what's actually on screen.
   ============================================================ */
document.querySelectorAll('.category-list').forEach((list) => {
  const nav = document.querySelector('.nav');
  const heads = Array.from(list.querySelectorAll('.category-row-head'));
  if (!nav || !heads.length) return;

  const updateMeasurements = () => {
    // Let each header size to its own content for a moment (so a category
    // name that happens to wrap isn't clipped by the fixed height), and
    // use the tallest one so every header in the stack matches.
    let maxHeadHeight = 0;
    heads.forEach((head) => {
      const previousHeight = head.style.height;
      head.style.height = 'auto';
      maxHeadHeight = Math.max(maxHeadHeight, head.getBoundingClientRect().height);
      head.style.height = previousHeight;
    });
    list.style.setProperty('--nav-h', nav.getBoundingClientRect().height + 'px');
    list.style.setProperty('--head-h', maxHeadHeight + 'px');
  };

  updateMeasurements();
  window.addEventListener('resize', updateMeasurements);
  // Fonts loading in after the initial layout can change text metrics
  // (and therefore header height), so re-measure once they're ready too.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateMeasurements);
  }
});


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
  '.collage-photo',
  '.contact-info', '.contact-form',
  '.page-hero h1', '.gallery-title', '.gallery-desc',
  '.closer-look > h2', '.closer-look-grid > div',
  '.book-heading', '.book-step'
];

// Grab every matching element on the page and tag it with the "reveal"
// class (which starts it invisible, per our CSS).
const items = document.querySelectorAll(selectors.join(','));
items.forEach(el => el.classList.add('reveal'));

// 2. Add a small STAGGER so grouped items (cards, posts) appear one
//    after another instead of all at once. We give each item in a
//    group a slightly longer delay.
const groups = ['.closer-look-grid', '.pricing-grid'];
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
   HERO PARALLAX
   As you scroll, nudge the hero photo DOWN by half the scroll
   distance. Because the page (and the wordmark) scroll up at full
   speed, the photo appears to move slower — so the "Rosie" text
   lifts away faster than the background, like Harlow.
   ============================================================ */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y <= window.innerHeight) {          // only while the hero is on screen
      heroBg.style.transform = 'translateY(' + (y * 0.5) + 'px)';
    }
  }, { passive: true });
}

/* The hero photos crossfade on a timer, so the background keeps updating. */
const heroSlides = document.querySelectorAll('.hero-slide');
if (heroSlides.length > 1) {
  let current = 0;
  setInterval(() => {
    heroSlides[current].classList.remove('is-active');
    current = (current + 1) % heroSlides.length; // wrap back to the first
    heroSlides[current].classList.add('is-active');
  }, 5000); // change photo every 5 seconds
}

/* ============================================================
   CONTACT BANNER PARALLAX
   Same drift as the homepage hero: the photo moves slower than the
   page around it while its section is in view. Unlike the hero (which
   sits at the very top of the page), this banner can be anywhere, so
   the drift is measured from its own position instead of raw scrollY.
   ============================================================ */
const contactBanner = document.querySelector('.contact-banner');
const contactBannerImg = contactBanner ? contactBanner.querySelector('img') : null;
if (contactBanner && contactBannerImg) {
  const updateContactParallax = () => {
    const rect = contactBanner.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return; // off-screen, skip
    const drift = (window.innerHeight - rect.top) * 0.5;
    contactBannerImg.style.transform = 'translateY(' + (-drift) + 'px)';
  };
  window.addEventListener('scroll', updateContactParallax, { passive: true });
  updateContactParallax();
}


/* ============================================================
   PINNED COLLAGE TEXT FADE
   Like Studio Reverie's homepage: the pinned heading doesn't just sit
   at full opacity until it's abruptly covered by the next section — it
   fades out over the final stretch of the pin, so it's gone right as
   the next page arrives.
   ============================================================ */
const collagePin = document.querySelector('.collage-pin');
const collageSticky = document.querySelector('.collage-sticky');
if (collagePin && collageSticky) {
  const updateCollageFade = () => {
    const rect = collagePin.getBoundingClientRect();
    const scrollRange = rect.height - window.innerHeight; // how far the pin lasts
    if (scrollRange <= 0) return;
    const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);
    // Fade continuously across the whole pin, growing lighter the further
    // you scroll, instead of holding at full opacity until near the end.
    collageSticky.style.opacity = 1 - progress;
  };
  window.addEventListener('scroll', updateCollageFade, { passive: true });
  updateCollageFade();
}


/* ============================================================
   PORTFOLIO SHOWCASE — FILM-STRIP COLUMN AUTOPLAY
   Like a strip of film tape running through a projector: each column
   holds a longer strip of photos than it shows at once. Once the
   section scrolls into view, the strips start rolling on their own —
   the outer columns' strips pull upward, the middle column's pulls the
   opposite way, downward — continuing at a steady pace even if you
   stop scrolling, until each strip runs out and locks in place.
   ============================================================ */
const showcaseGrid = document.querySelector('.portfolio-showcase-grid');
const showcaseCols = showcaseGrid ? Array.from(showcaseGrid.querySelectorAll('.showcase-col')) : [];
if (showcaseGrid && showcaseCols.length) {
  const GAP = 12;
  const VISIBLE_ROWS = 3; // photos shown at once per column
  const SPEED = 90;   // px per second the tape rolls
  let rowShift = 0;   // one photo's height + gap, i.e. one frame of "tape"
  let maxTravels = showcaseCols.map(() => 0); // each column's own strip length (columns can hold different photo counts)
  let maxTravel = 0;  // the longest column's strip length, used to drive the shared clock
  let pulled = 0;     // how far the tape has rolled so far
  let rafId = null;
  let lastTime = null;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const measureShowcase = () => {
    if (window.innerWidth <= 800) return; // mobile stacks everything statically instead
    const firstPhoto = showcaseCols[0].querySelector('.showcase-photo');
    if (!firstPhoto) return;
    const photoHeight = firstPhoto.getBoundingClientRect().height;
    rowShift = photoHeight + GAP;
    showcaseGrid.style.height = (photoHeight * VISIBLE_ROWS + GAP * (VISIBLE_ROWS - 1)) + 'px';
    maxTravels = showcaseCols.map((col) => Math.max(col.children.length - VISIBLE_ROWS, 0) * rowShift);
    maxTravel = Math.max(...maxTravels);
    if (reduceMotion) pulled = maxTravel; // skip straight to the resting frame
  };

  const applyShowcaseTransforms = () => {
    if (window.innerWidth <= 800 || !rowShift) return;
    showcaseCols.forEach((col, i) => {
      // Each column's own strip stops rolling once it runs out of extra
      // frames, even if the shared clock (driven by the longest column)
      // keeps going.
      const colTravel = maxTravels[i];
      const colPulled = Math.min(pulled, colTravel);
      // Middle column's strip starts fully wound up (hiding its extra
      // frames above) and rolls down toward 0. Outer columns start at 0
      // and roll up, revealing their extra frames below.
      const offset = i === 1 ? -(colTravel - colPulled) : -colPulled;
      col.style.transform = 'translateY(' + offset + 'px)';
    });
  };

  const tick = (time) => {
    if (lastTime === null) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    pulled = Math.min(pulled + SPEED * dt, maxTravel);
    applyShowcaseTransforms();
    rafId = pulled < maxTravel ? requestAnimationFrame(tick) : null;
  };

  measureShowcase();
  applyShowcaseTransforms();
  window.addEventListener('resize', () => { measureShowcase(); applyShowcaseTransforms(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measureShowcase(); applyShowcaseTransforms(); });
  }

  if (!reduceMotion) {
    const showcaseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && rafId === null && pulled < maxTravel) {
          lastTime = null;
          rafId = requestAnimationFrame(tick);
          showcaseObserver.unobserve(showcaseGrid); // only needs to start once
        }
      });
    }, { threshold: 0.1 });
    showcaseObserver.observe(showcaseGrid);
  }
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
   BOOKING FLOW (Step 1: pick session → Step 2: pick a real open time on
   Cal.com → Step 3: pay the deposit via Stripe, only unlocked once Cal.com
   confirms the time was actually reserved).

   The calendar is a plain iframe pointed at Cal.com's public booking page
   (not their JS embed SDK) — the SDK turned out to reliably break when
   switching between two calLinks on one page (it would leave a broken,
   invisible-sized floating duplicate behind no matter how the container
   was reset). A plain iframe just needs its src swapped, which Cal.com's
   booking pages support directly via the "?embed=true" query param.

   Even without the SDK, Cal.com's booking page still broadcasts its normal
   postMessage events (type names prefixed "CAL:") to the parent window —
   confirmed by logging window "message" events against a real iframe. We
   listen for the booking-confirmed one and only reveal the deposit button
   once it fires, so a customer can't reach the payment step without
   actually reserving a time first.

   IMPORTANT: reserving a time slot on Cal.com does not by itself stop
   someone else from taking it — only paying the deposit does, and Rosie
   confirming manually after seeing the Stripe payment is what finalizes
   things. To stop a slot from being double-booked while a deposit is
   pending, set both event types (mini-session, full-session) in Cal.com to
   "Requires confirmation" (Event type → Advanced → Requires confirmation).
   That keeps a reserved-but-unconfirmed slot hidden from other visitors
   until Rosie approves or rejects it.

   The deposit button just links straight to each session's Stripe Payment
   Link (set via data-stripe-link on the .session-card in index.html) — no
   JS payment integration needed, Stripe hosts the whole checkout page.

   SETUP NEEDED before this goes live:
   - In index.html, each .session-card's data-cal-link points at your real
     Cal.com username + event slug — double check these match your account.
   - In index.html, replace each .session-card's data-stripe-link with your
     real Stripe Payment Link for that session's deposit amount.
   - In Cal.com, set both event types to "Requires confirmation" (see above).
   ============================================================ */
const sessionCards = document.querySelectorAll('.session-card');
if (sessionCards.length) {
  const calendarStep = document.getElementById('book-step-calendar');
  const depositStep = document.getElementById('book-step-deposit');
  const calIframe = document.getElementById('cal-inline');
  let activeSession = null; // the session currently shown in the calendar iframe

  sessionCards.forEach(card => {
    card.addEventListener('click', () => {
      // Highlight the chosen card only.
      sessionCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');

      activeSession = card.dataset;
      calIframe.src = 'https://cal.com/' + activeSession.calLink + '?embed=true';

      depositStep.hidden = true; // stays hidden until a real booking is confirmed below
      calendarStep.hidden = false;
      calendarStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('message', (event) => {
    if (!activeSession || !String(event.origin).includes('cal.com')) return;
    const type = (event.data && (event.data.fullType || event.data.type)) || '';
    if (!/booking.*success/i.test(type)) return;

    document.getElementById('deposit-session-name').textContent = activeSession.sessionName;
    document.getElementById('deposit-amount').textContent = activeSession.deposit;
    document.getElementById('deposit-pay-button').href = activeSession.stripeLink;
    depositStep.hidden = false;
    depositStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop the browser's default page reload

    // Send the form data to FormSubmit, which emails it to Rosie and sends
    // the customer an automatic reply.
    const formData = new FormData(contactForm);
    try {
      const response = await fetch('https://formsubmit.co/ajax/hello@littlestoriesbyrosie.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();

      // FormSubmit returns success as the string "true".
      if (result.success === true || result.success === 'true') {
        // Success: swap the form for the thank-you message.
        contactForm.innerHTML =
          '<div class="form-thanks">' +
            '<p>Thank you!</p>' +
            '<p>We will be in touch with you shortly!</p>' +
          '</div>';
      } else {
        alert(result.message || 'Sorry, something went wrong sending your message. Please email hello@littlestoriesbyrosie.com instead.');
      }
    } catch (err) {
      alert('Sorry, something went wrong sending your message. Please email hello@littlestoriesbyrosie.com instead.');
    }
  });
}
