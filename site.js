const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

document.querySelector('#current-year').textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  formStatus.textContent = 'Thank you! Your inquiry is ready to send.';
  contactForm.reset();
});
