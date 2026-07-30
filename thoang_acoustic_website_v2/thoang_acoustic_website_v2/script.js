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
