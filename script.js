const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
const lang = document.querySelector('.lang-btn');
const form = document.querySelector('#bookingForm');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
});

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

let currentLanguage = 'vi';
lang.addEventListener('click', () => {
  currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-vi][data-en]').forEach(el => {
    el.textContent = el.dataset[currentLanguage];
  });
  lang.textContent = currentLanguage === 'vi' ? 'EN' : 'VI';
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
const calendarGrid = document.querySelector('#calendarGrid');
const calendarMonth = document.querySelector('#calendarMonth');
const calendarPrev = document.querySelector('#calendarPrev');
const calendarNext = document.querySelector('#calendarNext');
const eventList = document.querySelector('#eventList');
const eventCount = document.querySelector('#eventCount');
const emptyEvents = document.querySelector('#emptyEvents');

let calendarCursor = (() => {
  const next = eventData
    .map(item => new Date(`${item.date}T00:00:00`))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)
    .find(date => date >= new Date(new Date().setHours(0,0,0,0)));
  return next || new Date();
})();

function activeLanguage() {
  return document.documentElement.lang === 'en' ? 'en' : 'vi';
}


// Editable food and drinks menu
const menuData = Array.isArray(window.THOANG_MENU) ? window.THOANG_MENU : [];
const menuGrid = document.querySelector('#menuGrid');
const menuFilter = document.querySelector('#menuFilter');
const menuEmpty = document.querySelector('#menuEmpty');
let selectedMenuCategory = 'all';

function menuName(item) {
  return activeLanguage() === 'en' ? (item.nameEn || item.nameVi) : (item.nameVi || item.nameEn);
}
function menuDescription(item) {
  return activeLanguage() === 'en' ? (item.descriptionEn || item.descriptionVi || '') : (item.descriptionVi || item.descriptionEn || '');
}
function menuCategory(item) {
  return activeLanguage() === 'en' ? (item.categoryEn || item.categoryVi || '') : (item.categoryVi || item.categoryEn || '');
}
function menuCategoryKey(item) {
  return (item.categoryEn || item.categoryVi || 'Other').trim().toLowerCase();
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
if (menuGrid) renderMenu();

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
  eventList.innerHTML = '';
  const sorted = [...events].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
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

function renderCalendar(selectedDate = '') {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const locale = activeLanguage() === 'en' ? 'en-GB' : 'vi-VN';
  calendarMonth.textContent = new Intl.DateTimeFormat(locale, {month:'long', year:'numeric'}).format(calendarCursor);
  calendarGrid.innerHTML = '';

  const first = new Date(year, month, 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayIndex);

  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    const dateKey = [
      day.getFullYear(),
      String(day.getMonth()+1).padStart(2,'0'),
      String(day.getDate()).padStart(2,'0')
    ].join('-');
    const dayEvents = eventData.filter(item => item.date === dateKey);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    if (day.getMonth() !== month) button.classList.add('outside');
    if (dayEvents.length) button.classList.add('has-event');
    if (dateKey === selectedDate) button.classList.add('selected');
    button.innerHTML = `<span class="calendar-date">${day.getDate()}</span>` +
      (dayEvents.length ? `<span class="calendar-event-title">${eventTitle(dayEvents[0])}${dayEvents.length > 1 ? ` +${dayEvents.length-1}` : ''}</span><span class="calendar-dot"></span>` : '');
    if (dayEvents.length) {
      button.setAttribute('aria-label', `${dateKey}: ${dayEvents.map(eventTitle).join(', ')}`);
      button.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
        button.classList.add('selected');
        renderEventList(dayEvents);
      });
    }
    calendarGrid.appendChild(button);
  }

  const monthEvents = eventData.filter(item => {
    const d = new Date(`${item.date}T00:00:00`);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  renderEventList(selectedDate ? eventData.filter(item => item.date === selectedDate) : monthEvents);
}

if (calendarGrid) {
  calendarPrev.addEventListener('click', () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth()-1, 1);
    renderCalendar();
  });
  calendarNext.addEventListener('click', () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth()+1, 1);
    renderCalendar();
  });
  renderCalendar();
}

// Re-render event labels when language changes.
if (lang) {
  lang.addEventListener('click', () => {
    window.setTimeout(() => { renderCalendar(); renderMenu(); renderGallery(); }, 0);
  });
}

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
