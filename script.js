const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
const langButtons = document.querySelectorAll('.lang-btn');
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

function closeMobileNavMenu() {
  if (!nav) return;
  nav.classList.remove('open');
  if (menu) menu.setAttribute('aria-expanded', 'false');
}

if (nav) {
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', closeMobileNavMenu);
  });
}

const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
let currentLanguage = requestedLanguage === 'en' || (requestedLanguage !== 'vi' && document.documentElement.lang === 'en') ? 'en' : 'vi';
document.documentElement.lang = currentLanguage;
function applyLanguage(nextLang = null) {
  currentLanguage = nextLang || (currentLanguage === 'vi' ? 'en' : 'vi');
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-vi][data-en]').forEach(el => {
    el.textContent = el.dataset[currentLanguage] || el.textContent;
  });
  langButtons.forEach(btn => { btn.textContent = currentLanguage === 'vi' ? 'EN' : 'VI'; });
  if (typeof renderMenu === 'function') renderMenu();
  if (typeof renderGallery === 'function') renderGallery();
  if (typeof renderCocktails === 'function') renderCocktails();
  if (typeof renderCalendar === 'function') renderCalendar();
}
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const nextLanguage = btn.textContent.trim() === 'EN' ? 'en' : 'vi';
    window.location.assign(nextLanguage === 'en' ? 'https://www.thoangacoustic.com/en/' : 'https://www.thoangacoustic.com/');
  });
});

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
let galleryData = Array.isArray(window.THOANG_GALLERY) ? window.THOANG_GALLERY : [];
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

function loadPageDataScript(src, globalName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      const data = window[globalName];
      if (!Array.isArray(data)) {
        reject(new Error(`Invalid data in ${src}`));
        return;
      }
      resolve(data);
    };
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadWhenNear(element, load) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    load();
  }, { rootMargin: '500px 0px' });
  observer.observe(element);
}

if (galleryGrid) {
  loadWhenNear(galleryGrid, () => {
    loadPageDataScript('./gallery-data.js', 'THOANG_GALLERY')
      .then(data => {
        galleryData = data;
        renderGallery();
      })
      .catch(error => console.warn('Unable to load gallery data.', error));
  });
}


// Editable event calendar
let eventData = Array.isArray(window.THOANG_EVENTS) ? window.THOANG_EVENTS : [];
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
let cocktailsDataRequested = false;
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
const calendarWeekdays = document.querySelector('.calendar-weekdays');
const sharedScript = document.querySelector('script[src*="script.js"]');
const eventDataPath = sharedScript ? new URL('./events-data.js', sharedScript.src).href : './events-data.js';

let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedCalendarDate = '';

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
    const response = await fetch('./cocktails-data.js', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load cocktail data: ${response.status}`);
    const source = await response.text();
    const match = source.match(/window\.THOANG_COCKTAILS\s*=\s*(\[[\s\S]*\])\s*;/);
    if (!match) throw new Error('Invalid cocktail data format.');
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) throw new Error('Cocktail data must be an array.');
    cocktailsDataRequested = true;
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
  if (document.visibilityState === 'visible' && cocktailsDataRequested) {
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
      <img src="${item.image || 'assets/cocktail-1.jpg'}" alt="${cocktailName(item).replaceAll('"','&quot;')}" loading="lazy" decoding="async">
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

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function renderEventList(events) {
  if (!eventList || !eventCount || !emptyEvents) return;
  eventList.innerHTML = '';
  const sorted = [...events]
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3);
  eventCount.textContent = String(sorted.length);
  emptyEvents.hidden = sorted.length > 0;

  const todayStr = localDateKey();
  sorted.forEach(item => {
    const isToday = item.date === todayStr;
    const article = document.createElement('article');
    article.className = 'event-item' + (isToday ? ' event-item--today' : '');
    article.innerHTML = `
      ${isToday ? '<span class="event-today-badge">TONIGHT</span>' : ''}
      <img src="${item.poster || 'assets/event.jpg'}" alt="${eventTitle(item).replaceAll('"','&quot;')}" loading="lazy" decoding="async">
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
      selectedCalendarDate = item.date;
      renderCalendar();
    });
    eventList.appendChild(article);
  });
}

function renderCalendar() {
  const locale = activeLanguage() === 'en' ? 'en-GB' : 'vi-VN';
  const today = new Date(); today.setHours(0,0,0,0);
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthLabel = new Intl.DateTimeFormat(locale, {month:'long', year:'numeric'}).format(monthStart);
  if (calendarMonth) calendarMonth.textContent = monthLabel;

  if (calendarWeekdays) {
    const mondayFirst = [1, 2, 3, 4, 5, 6, 0];
    calendarWeekdays.innerHTML = mondayFirst.map(day =>
      `<span>${new Intl.DateTimeFormat(locale, {weekday:'short'}).format(new Date(2024, 0, 7 + day))}</span>`
    ).join('');
  }

  if (calendarGrid) {
    calendarGrid.innerHTML = '';
    const offset = (monthStart.getDay() + 6) % 7;
    const cellCount = Math.ceil((offset + monthEnd.getDate()) / 7) * 7;
    const eventsByDate = new Map();
    eventData.forEach(item => {
      if (!eventsByDate.has(item.date)) eventsByDate.set(item.date, []);
      eventsByDate.get(item.date).push(item);
    });
    const todayKey = localDateKey(today);

    for (let index = 0; index < cellCount; index += 1) {
      const date = new Date(year, month, index - offset + 1);
      const dateKey = localDateKey(date);
      const inMonth = date.getMonth() === month;
      const dayEvents = eventsByDate.get(dateKey) || [];
      const isSelected = selectedCalendarDate ? dateKey === selectedCalendarDate : dateKey === todayKey;
      const day = document.createElement('button');
      day.type = 'button';
      day.className = `calendar-day${inMonth ? '' : ' outside'}${dayEvents.length ? ' has-event' : ''}${isSelected ? ' selected' : ''}`;
      day.disabled = !inMonth;
      day.setAttribute('role', 'gridcell');
      day.setAttribute('aria-pressed', String(isSelected));
      day.setAttribute('aria-label', `${new Intl.DateTimeFormat(locale, {dateStyle:'full'}).format(date)}${dayEvents.length ? `, ${dayEvents.map(eventTitle).join(', ')}` : ''}`);
      day.innerHTML = `<span class="calendar-date">${date.getDate()}</span>${dayEvents.length ? `<span class="calendar-dot"></span><span class="calendar-event-title">${eventTitle(dayEvents[0])}</span>` : ''}`;
      day.addEventListener('click', () => {
        selectedCalendarDate = dateKey;
        renderCalendar();
      });
      calendarGrid.appendChild(day);
    }
  }

  const upcomingEvents = [...eventData]
    .filter(item => {
      const d = new Date(`${item.date}T00:00:00`);
      return !Number.isNaN(d.getTime()) && d >= today;
    })
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3);
  const selectedEvents = selectedCalendarDate
    ? eventData.filter(item => item.date === selectedCalendarDate)
    : upcomingEvents;
  renderEventList(selectedEvents);
}

if (calendarPrev) {
  calendarPrev.addEventListener('click', () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    selectedCalendarDate = '';
    renderCalendar();
  });
}
if (calendarNext) {
  calendarNext.addEventListener('click', () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    selectedCalendarDate = '';
    renderCalendar();
  });
}

if (cocktailsCards) {
  renderCocktails();
  loadWhenNear(cocktailsCards, () => {
    cocktailsDataRequested = true;
    refreshCocktailsData();
    window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshCocktailsData();
    }, 60000);
  });
}
if (eventList) {
  renderCalendar();
  loadWhenNear(eventList, () => {
    loadPageDataScript(eventDataPath, 'THOANG_EVENTS')
      .then(data => {
        eventData = data;
        renderCalendar();
      })
      .catch(error => {
        console.warn('Unable to load event data.', error);
        renderCalendar();
      });
  });
}

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

if (requestedLanguage === 'en') {
  applyLanguage('en');
}
