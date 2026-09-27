document.documentElement.classList.add('js');

const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');
const backTop = document.getElementById('backTop');
const scrollBar = document.getElementById('scrollBar');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setHeaderState() {
  const scrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', scrolled);
  backTop.classList.toggle('show', window.scrollY > 600);
}

function setMenu(open) {
  mobileNav.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();

navToggle.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
mobileClose.addEventListener('click', () => setMenu(false));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const heroMedia = document.querySelector('.hero-media');
const heroInner = document.querySelector('.hero-inner');
const heroCue = document.querySelector('.hero-cue');

let activeSlide = 0;
if (heroSlides.length > 1 && !reduceMotion) {
  setInterval(() => {
    activeSlide = (activeSlide + 1) % heroSlides.length;
    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeSlide);
      if (i === activeSlide) {
        slide.style.animation = 'none';
        void slide.offsetWidth;
        slide.style.animation = '';
      }
    });
  }, 6500);
}

let ticking = false;

function onScrollFrame() {
  const y = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = `${docHeight > 0 ? Math.min((y / docHeight) * 100, 100) : 0}%`;

  if (!reduceMotion && heroMedia && y < window.innerHeight * 1.2) {
    const shift = Math.min(y * 0.26, 120);
    heroMedia.style.transform = `translate3d(0, ${shift}px, 0)`;
    heroInner.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
    heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
  }

  if (heroCue) heroCue.style.opacity = y > 120 ? '0' : '1';
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(onScrollFrame);
}, { passive: true });

onScrollFrame();

function splitWords(node) {
  const words = [];
  Array.from(node.childNodes).forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      child.textContent.split(/(\s+)/).forEach(part => {
        if (!part.trim()) return;
        const mask = document.createElement('span');
        mask.className = 'w-mask';
        const word = document.createElement('span');
        word.className = 'w';
        word.textContent = part;
        mask.appendChild(word);
        node.insertBefore(mask, child);
        words.push(word);
      });
      node.removeChild(child);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      words.push(...splitWords(child));
    }
  });
  return words;
}

document.querySelectorAll('[data-reveal-words]').forEach(heading => {
  const words = splitWords(heading);
  words.forEach((word, i) => word.style.setProperty('--d', `${0.15 + i * 0.055}s`));
  heading.classList.add('reveal-words');
  requestAnimationFrame(() => {
    void heading.offsetWidth;
    heading.classList.add('in');
  });
});

document.querySelectorAll('[data-reveal]').forEach(el => {
  el.classList.add('fade-up');
  el.style.setProperty('--d', el.dataset.delay || '0s');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
});

document.querySelectorAll('[data-stagger]').forEach(group => {
  Array.from(group.children).forEach((child, i) => {
    if (child.classList.contains('reveal')) {
      child.style.setProperty('--d', `${i * 0.07}s`);
    } else {
      child.classList.add('reveal');
      child.style.setProperty('--d', `${i * 0.07}s`);
    }
  });
});

if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
}

const searchTabs = document.querySelectorAll('.search-tab');
const searchType = document.getElementById('searchType');
const searchForm = document.getElementById('searchForm');

const tabOptions = {
  Plot: ['Residential Plot', 'Agricultural land', 'Any type'],
  Home: ['Independent House', 'Apartment', 'Villa', 'Any type'],
  Commercial: ['Commercial Space', 'Any type']
};

searchTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    searchTabs.forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    const options = tabOptions[tab.dataset.type];
    const current = searchType.value;
    searchType.innerHTML = options
      .map(option => `<option${option === current ? ' selected' : ''}>${option}</option>`)
      .join('');
  });
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const location = document.getElementById('searchCity').value.trim();
  const budget = document.getElementById('searchBudget').value;
  const type = searchType.value;
  const query = [location, type, budget].filter(Boolean).join(' — ');
  document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
  const lead = document.getElementById('emptyState');
  lead.textContent = `Matching listings for: ${query}. An advisor will confirm availability within 4 working hours.`;
  lead.hidden = false;
});

const listingGrid = document.getElementById('listingGrid');
const cards = Array.from(listingGrid.querySelectorAll('.listing-card'));
const filterButtons = document.querySelectorAll('#listingFilters .filter-btn');
const sortSelect = document.getElementById('sortListings');
const emptyState = document.getElementById('emptyState');
let activeFilter = 'all';

function applyFilter() {
  let visible = 0;
  cards.forEach(card => {
    const show = activeFilter === 'all' || card.dataset.category === activeFilter;
    card.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });
  if (visible === 0) {
    emptyState.textContent = 'No listings match this filter yet. Call us and we will find one for you.';
  }
  emptyState.hidden = visible !== 0;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    applyFilter();
  });
});

sortSelect.addEventListener('change', () => {
  const mode = sortSelect.value;
  const sorted = [...cards].sort((a, b) => {
    if (mode === 'low') return Number(a.dataset.price) - Number(b.dataset.price);
    if (mode === 'high') return Number(b.dataset.price) - Number(a.dataset.price);
    return Number(b.dataset.featured) - Number(a.dataset.featured);
  });
  sorted.forEach(card => listingGrid.appendChild(card));
  applyFilter();
});

document.querySelectorAll('.fav-btn').forEach(button => {
  button.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!pressed));
  });
});

const faqItems = document.querySelectorAll('#faqList .faq-item');

faqItems.forEach(item => {
  const button = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');
  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = '0px';
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

const track = document.getElementById('testimonialTrack');
const slides = track.children.length;
const slideDots = document.getElementById('sliderDots');
let slide = 0;
let slideTimer;

for (let i = 0; i < slides; i += 1) {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Go to review ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  slideDots.appendChild(dot);
}

function goToSlide(index) {
  slide = (index + slides) % slides;
  track.style.transform = `translateX(-${slide * 100}%)`;
  Array.from(slideDots.children).forEach((dot, i) => dot.classList.toggle('active', i === slide));
  restartSlideTimer();
}

const slideProgress = document.getElementById('slideProgress').parentElement;

function restartSlideTimer() {
  clearInterval(slideTimer);
  if (reduceMotion) return;
  slideProgress.classList.remove('run');
  void slideProgress.offsetWidth;
  slideProgress.classList.add('run');
  slideTimer = setInterval(() => goToSlide(slide + 1), 6000);
}

document.getElementById('slideNext').addEventListener('click', () => goToSlide(slide + 1));
document.getElementById('slidePrev').addEventListener('click', () => goToSlide(slide - 1));
goToSlide(0);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counterObserver.unobserve(el);
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1600;
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      el.textContent = Math.round(target * eased).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

const enquiryForm = document.getElementById('enquiryForm');
const formSuccess = document.getElementById('formSuccess');
const validators = {
  fName: value => (value.trim().length >= 2 ? '' : 'Please enter your name'),
  fPhone: value => (/^[6-9]\d{9}$/.test(value.replace(/\D/g, '').slice(-10)) ? '' : 'Enter a valid 10-digit mobile number'),
  fEmail: value => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? '' : 'Enter a valid email address')
};

function validateField(id) {
  const input = document.getElementById(id);
  const message = validators[id](input.value);
  const error = document.querySelector(`.error[data-for="${id}"]`);
  error.textContent = message;
  error.classList.toggle('show', Boolean(message));
  input.classList.toggle('invalid', Boolean(message));
  return !message;
}

Object.keys(validators).forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('blur', () => validateField(id));
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) validateField(id);
  });
});

enquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  const results = Object.keys(validators).map(validateField);
  if (results.includes(false)) {
    enquiryForm.querySelector('.invalid').focus();
    return;
  }
  enquiryForm.hidden = true;
  formSuccess.hidden = false;
});

document.getElementById('resetForm').addEventListener('click', () => {
  enquiryForm.reset();
  enquiryForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  enquiryForm.querySelectorAll('.error').forEach(el => el.classList.remove('show'));
  formSuccess.hidden = true;
  enquiryForm.hidden = false;
  document.getElementById('fName').focus();
});
