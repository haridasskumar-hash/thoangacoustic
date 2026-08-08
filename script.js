const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
const lang = document.querySelector('.lang-btn');
const form = document.querySelector('#bookingForm');

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  });
}

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

if (nav) {
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

let currentLanguage = document.documentElement.lang === 'en' ? 'en' : 'vi';
function applyLanguage(nextLang = null) {
  currentLanguage = nextLang || (currentLanguage === 'vi' ? 'en' : 'vi');
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-vi][data-en]').forEach(el => {
    el.textContent = el.dataset[currentLanguage] || el.textContent;
  });
  if (lang) lang.textContent = currentLanguage === 'vi' ? 'EN' : 'VI';
  if (typeof renderMenu === 'function') renderMenu();
  if (typeof renderGallery === 'function') renderGallery();
  if (typeof renderCocktails === 'function') renderCocktails();
  if (typeof renderCalendar === 'function') renderCalendar();
}
if (lang) {
  lang.addEventListener('click', () => {
    applyLanguage();
    window.setTimeout(refreshLocalizedContent, 0);
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));



// Editable image gallery
const galleryData = Array.isArray(window.THOANG_GALLERY) ? window.THOANG_GALLERY : [];
const galleryGrid = document.querySelector('#galleryGrid');
const galleryEmpty = document.querySelector('#galleryEmpty');
const galleryLightbox = document.querySelector('#galleryLightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCaption = document.querySelector('#lightboxCaption');
const lightboxClose = document.querySelector('#lightboxClose');
const lightboxPrev = document.querySelector('#lightboxPrev');
const lightboxNext = document.querySelector('#lightboxNext');
let galleryIndex = 0;

function galleryCaption(item) {
  return activeLanguage() === 'en'
    ? (item.captionEn || item.captionVi || '')
    : (item.captionVi || item.captionEn || '');
}

function showGalleryImage(index) {
  if (!galleryData.length) return;
  galleryIndex = (index + galleryData.length) % galleryData.length;
  const item = galleryData[galleryIndex];
  lightboxImage.src = item.image;
  lightboxImage.alt = galleryCaption(item) || (activeLanguage() === 'en' ? 'Thoáng Acoustic gallery image' : 'Hình ảnh Thoáng Acoustic');
  lightboxCaption.textContent = galleryCaption(item);
  galleryLightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeGalleryLightbox() {
  galleryLightbox.hidden = true;
  document.body.style.overflow = '';
}

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';
  galleryEmpty.hidden = galleryData.length > 0;
  galleryData.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    const sizeClass = ['tall','wide'].includes(item.size) ? item.size : '';
    if (sizeClass) button.classList.add(sizeClass);
    const caption = galleryCaption(item);
    button.setAttribute('aria-label', caption || `${activeLanguage() === 'en' ? 'Open gallery image' : 'Mở hình ảnh'} ${index + 1}`);
    button.innerHTML = `<figure><img src="${item.image}" alt="${caption.replaceAll('"','&quot;')}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
    button.addEventListener('click', () => showGalleryImage(index));
    galleryGrid.appendChild(button);
  });
}

if (galleryGrid) {
  renderGallery();
  lightboxClose.addEventListener('click', closeGalleryLightbox);
  lightboxPrev.addEventListener('click', () => showGalleryImage(galleryIndex - 1));
  lightboxNext.addEventListener('click', () => showGalleryImage(galleryIndex + 1));
  galleryLightbox.addEventListener('click', event => {
    if (event.target === galleryLightbox) closeGalleryLightbox();
  });
  document.addEventListener('keydown', event => {
    if (galleryLightbox.hidden) return;
    if (event.key === 'Escape') closeGalleryLightbox();
    if (event.key === 'ArrowLeft') showGalleryImage(galleryIndex - 1);
    if (event.key === 'ArrowRight') showGalleryImage(galleryIndex + 1);
  });
}


// Editable event calendar
const eventData = Array.isArray(window.THOANG_EVENTS) ? window.THOANG_EVENTS : [];
const COCKTAILS_STORAGE_KEY = 'thoang-cocktails-sync';
const COCKTAILS_SYNC_EVENT = 'thoang-cocktails-data-updated';

function loadStoredCocktails() {
  try {
    if (!window.localStorage) return null;
    const stored = window.localStorage.getItem(COCKTAILS_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Unable to load stored cocktails.', error);
    return null;
  }
}

function applyCocktailsData(parsedData) {
  if (!Array.isArray(parsedData)) return false;
  cocktailsData = parsedData;
  window.THOANG_COCKTAILS = parsedData;
  try {
    if (window.localStorage) {
      window.localStorage.setItem(COCKTAILS_STORAGE_KEY, JSON.stringify(parsedData));
    }
  } catch (error) {
    console.warn('Unable to save cocktails to local storage.', error);
  }
  if (typeof renderCocktails === 'function') renderCocktails();
  return true;
}

let cocktailsData = Array.isArray(window.THOANG_COCKTAILS) ? window.THOANG_COCKTAILS : (loadStoredCocktails() || []);
if (Array.isArray(cocktailsData) && cocktailsData.length) {
  window.THOANG_COCKTAILS = cocktailsData;
}
const cocktailsCards = document.querySelector('#cocktailsCards');
const calendarGrid = document.querySelector('#calendarGrid');
const calendarMonth = document.querySelector('#calendarMonth');
const calendarPrev = document.querySelector('#calendarPrev');
const calendarNext = document.querySelector('#calendarNext');
const eventList = document.querySelector('#eventList');
const eventCount = document.querySelector('#eventCount');
const emptyEvents = document.querySelector('#emptyEvents');

let calendarCursor = (() => {
  const parsed = eventData
    .map(item => new Date(`${item.date}T00:00:00`))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  const next = parsed.find(date => date >= new Date(new Date().setHours(0,0,0,0)));
  const base = next || parsed[parsed.length - 1] || new Date();
  return new Date(base.getFullYear(), base.getMonth(), 1);
})();

function activeLanguage() {
  return document.documentElement.lang === 'en' ? 'en' : 'vi';
}


// Editable food and drinks menu
const fallbackMenuData = [
  {
    id: 'signature-cocktail',
    categoryVi: 'Cocktail',
    categoryEn: 'Cocktails',
    nameVi: 'Signature Cocktail',
    nameEn: 'Signature Cocktail',
    descriptionVi: 'Một lựa chọn đặc trưng được pha tại quầy bar của Thoáng.',
    descriptionEn: 'A signature creation mixed at the Thoáng bar.',
    price: 'Liên hệ',
    image: 'assets/cocktail-3.jpg',
    available: true
  },
  {
    id: 'light-cocktail',
    categoryVi: 'Cocktail',
    categoryEn: 'Cocktails',
    nameVi: 'Nhẹ & Tinh Tế',
    nameEn: 'Light & Elegant',
    descriptionVi: 'Hương vị nhẹ nhàng cho một buổi tối thư thái.',
    descriptionEn: 'A lighter choice for a relaxed evening.',
    price: 'Liên hệ',
    image: 'assets/cocktail-2.jpg',
    available: true
  },
  {
    id: 'golden-whisper',
    categoryVi: 'Signature Cocktail',
    categoryEn: 'Signature Cocktail',
    nameVi: 'Golden Whisper',
    nameEn: 'Golden Whisper',
    descriptionVi: 'Ingredients: Jose Cuervo, Tangerine, Lime, Coconut Foam\nTaste Profile: Bright, Citrusy, Silky',
    descriptionEn: 'Ingredients: Jose Cuervo, Tangerine, Lime, Coconut Foam\nTaste Profile: Bright, Citrusy, Silky',
    price: '215,000',
    image: 'assets/cocktail-1.jpg',
    available: false
  }
];
window.THOANG_MENU = Array.isArray(window.THOANG_MENU) && window.THOANG_MENU.length ? window.THOANG_MENU : fallbackMenuData;
let menuData = Array.isArray(window.THOANG_MENU) ? window.THOANG_MENU : fallbackMenuData;
const menuGrid = document.querySelector('#menuGrid');
const menuFilter = document.querySelector('#menuFilter');
const menuEmpty = document.querySelector('#menuEmpty');
let selectedMenuCategory = 'all';

async function loadMenuData() {
  if (Array.isArray(window.THOANG_MENU) && window.THOANG_MENU.length) {
    menuData = window.THOANG_MENU;
    return menuData;
  }

  try {
    const response = await fetch('menu-data.js', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load menu data: ${response.status}`);

    const source = await response.text();
    const result = new Function(`${source}\nreturn window.THOANG_MENU;`)();

    if (Array.isArray(result)) {
      menuData = result;
      window.THOANG_MENU = result;
      return menuData;
    }
  } catch (error) {
    console.warn('Unable to load menu data dynamically.', error);
  }

  return [];
}

async function initMenu() {
  menuData = await loadMenuData();
  if (menuGrid) renderMenu();
}

function refreshLocalizedContent() {
  if (typeof renderMenu === 'function') renderMenu();
  if (typeof renderGallery === 'function') renderGallery();
  if (typeof renderCocktails === 'function') renderCocktails();
  if (typeof renderCalendar === 'function') renderCalendar();
}

function menuName(item) {
  return activeLanguage() === 'en' ? (item.nameEn || item.nameVi) : (item.nameVi || item.nameEn);
}
function menuDescription(item) {
  return activeLanguage() === 'en' ? (item.descriptionEn || item.descriptionVi || '') : (item.descriptionVi || item.descriptionEn || '');
}
function menuCategoryDisplay(item, language) {
  const categoryEn = String(item.categoryEn || '').trim();
  const categoryVi = String(item.categoryVi || '').trim();
  if (!categoryEn && !categoryVi) return language === 'en' ? 'Other' : 'Khác';
  if (language === 'en') return categoryEn || categoryVi;
  return categoryVi || categoryEn;
}
function menuCategory(item) {
  return menuCategoryDisplay(item, activeLanguage());
}
function menuCategoryKey(item) {
  const categoryEn = String(item.categoryEn || '').trim();
  const categoryVi = String(item.categoryVi || '').trim();
  if (!categoryEn && !categoryVi) return 'other';

  const values = [categoryEn, categoryVi]
    .filter(Boolean)
    .map(value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());

  if (!values.length) return 'other';
  if (values.length === 1) return values[0].replace(/\s+/g, '-');

  const [first, second] = values;
  if (first === second) return first.replace(/\s+/g, '-');
  if (first.startsWith(second) || second.startsWith(first)) {
    return (first.length >= second.length ? first : second).replace(/\s+/g, '-');
  }
  return first.replace(/\s+/g, '-');
}
function renderMenuFilters() {
  if (!menuFilter) return;
  const categories = [];
  menuData.forEach(item => {
    const key = menuCategoryKey(item);
    if (!categories.some(category => category.key === key)) categories.push({key, item});
  });
  menuFilter.innerHTML = '';
  const all = document.createElement('button');
  all.type = 'button'; all.dataset.category = 'all';
  all.textContent = activeLanguage() === 'en' ? 'All' : 'Tất cả';
  if (selectedMenuCategory === 'all') all.classList.add('active');
  menuFilter.appendChild(all);
  categories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.category = category.key;
    button.textContent = menuCategory(category.item);
    if (selectedMenuCategory === category.key) button.classList.add('active');
    menuFilter.appendChild(button);
  });
  menuFilter.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    selectedMenuCategory = button.dataset.category;
    renderMenu();
  }));
}
function renderMenu() {
  if (!menuGrid) return;
  renderMenuFilters();
  const items = selectedMenuCategory === 'all' ? menuData : menuData.filter(item => menuCategoryKey(item) === selectedMenuCategory);
  menuGrid.innerHTML = '';
  menuEmpty.hidden = items.length > 0;
  items.forEach(item => {
    const article = document.createElement('article');
    article.className = 'menu-item reveal visible';
    const unavailable = item.available === false ? `<span class="menu-unavailable">${activeLanguage() === 'en' ? 'Unavailable' : 'Tạm hết'}</span>` : '';
    article.innerHTML = `
      <div class="menu-item-media"><img src="${item.image || 'assets/cocktail-1.jpg'}" alt="${menuName(item).replaceAll('"','&quot;')}">${unavailable}</div>
      <div class="menu-item-copy">
        <p class="menu-category-label">${menuCategory(item)}</p>
        <div class="menu-item-meta"><h3>${menuName(item)}</h3><span class="menu-price">${item.price || ''}</span></div>
        <p class="menu-item-description">${menuDescription(item)}</p>
      </div>`;
    menuGrid.appendChild(article);
  });
}
if (menuGrid) initMenu();

function cocktailName(item) {
  return activeLanguage() === 'en' ? (item.nameEn || item.nameVi) : (item.nameVi || item.nameEn);
}

function cocktailDescription(item) {
  return activeLanguage() === 'en' ? (item.descriptionEn || item.descriptionVi || '') : (item.descriptionVi || item.descriptionEn || '');
}

async function refreshCocktailsData() {
  const storedCocktails = loadStoredCocktails();
  if (storedCocktails && JSON.stringify(storedCocktails) !== JSON.stringify(cocktailsData)) {
    applyCocktailsData(storedCocktails);
    return;
  }

  try {
    const response = await fetch('./cocktails-data.js?' + Date.now(), { cache: 'no-store' });
    if (!response.ok) return;
    const source = await response.text();
    const match = source.match(/window\.THOANG_COCKTAILS\s*=\s*(\[[\s\S]*\])\s*;/);
    if (!match) return;
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) return;
    if (JSON.stringify(parsed) !== JSON.stringify(cocktailsData)) {
      applyCocktailsData(parsed);
    }
  } catch (error) {
    console.warn('Unable to refresh cocktail data.', error);
  }
}

window.addEventListener('storage', event => {
  if (event.key === COCKTAILS_STORAGE_KEY && event.newValue) {
    try {
      applyCocktailsData(JSON.parse(event.newValue));
    } catch (error) {
      console.warn('Unable to apply stored cocktail data.', error);
    }
  }
});

window.addEventListener(COCKTAILS_SYNC_EVENT, event => {
  const payload = event.detail;
  if (Array.isArray(payload)) {
    applyCocktailsData(payload);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    refreshCocktailsData();
  }
});

function renderCocktails() {
  if (!cocktailsCards) return;
  cocktailsCards.innerHTML = '';
  const items = cocktailsData.slice(0, 3);
  items.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = 'card reveal visible';
    article.innerHTML = `
      <img src="${item.image || 'assets/cocktail-1.jpg'}" alt="${cocktailName(item).replaceAll('"','&quot;')}">
      <div class="card-overlay"></div>
      <div class="card-text"><span>${String(index + 1).padStart(2, '0')}</span><h3>${cocktailName(item)}</h3></div>`;
    cocktailsCards.appendChild(article);
  });
}

function eventTitle(item) {
  return activeLanguage() === 'en' ? (item.titleEn || item.titleVi) : (item.titleVi || item.titleEn);
}

function eventDescription(item) {
  return activeLanguage() === 'en'
    ? (item.descriptionEn || item.descriptionVi || '')
    : (item.descriptionVi || item.descriptionEn || '');
}

function formatEventDate(item) {
  const locale = activeLanguage() === 'en' ? 'en-GB' : 'vi-VN';
  const date = new Date(`${item.date}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {weekday:'short', day:'2-digit', month:'short', year:'numeric'}).format(date);
}

function renderEventList(events) {
  if (!eventList || !eventCount || !emptyEvents) return;
  eventList.innerHTML = '';
  const sorted = [...events]
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3);
  eventCount.textContent = String(sorted.length);
  emptyEvents.hidden = sorted.length > 0;

  sorted.forEach(item => {
    const article = document.createElement('article');
    article.className = 'event-item';
    article.innerHTML = `
      <img src="${item.poster || 'assets/event.jpg'}" alt="${eventTitle(item).replaceAll('"','&quot;')}">
      <div>
        <p class="event-date-label">${formatEventDate(item)} • ${item.time}${item.endTime ? `–${item.endTime}` : ''}</p>
        <h4>${eventTitle(item)}</h4>
        <p>${item.artists || ''}</p>
        <p>${eventDescription(item)}</p>
        <a class="event-book" href="tel:${item.bookingPhone || '+84523038686'}">${activeLanguage() === 'en' ? 'Book a table →' : 'Đặt bàn →'}</a>
      </div>`;
    article.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      const eventDate = new Date(`${item.date}T00:00:00`);
      calendarCursor = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);
      renderCalendar(item.date);
    });
    eventList.appendChild(article);
  });
}

function renderCalendar() {
  const upcomingEvents = [...eventData]
    .filter(item => !Number.isNaN(new Date(`${item.date}T00:00:00`).getTime()))
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3);
  renderEventList(upcomingEvents);
}

if (cocktailsCards) {
  renderCocktails();
  refreshCocktailsData();
  window.setInterval(refreshCocktailsData, 5000);
}
renderCalendar();

if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent('Reservation request - Thoáng Acoustic');
    const body = encodeURIComponent(
`Name: ${data.get('name')}
Phone: ${data.get('phone')}
Date: ${data.get('date')}
Time: ${data.get('time')}
Guests: ${data.get('guests')}
Notes: ${data.get('notes') || '-'}`
    );
    window.location.href = `mailto:thoangacoustic@gmail.com?subject=${subject}&body=${body}`;
  });
}
