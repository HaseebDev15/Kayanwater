let products = JSON.parse(localStorage.getItem('kayan-products') || '[]');
let orders = [
  { id: 'NS-1048', date: 'Aug 28, 2026', items: '3 items', total: '$186.00', status: 'In transit', tone: 'transit' },
  { id: 'NS-1042', date: 'Aug 19, 2026', items: '1 item', total: '$64.00', status: 'Processing', tone: 'processing' },
  { id: 'NS-1031', date: 'Aug 07, 2026', items: '4 items', total: '$292.00', status: 'Delivered', tone: 'delivered' },
  { id: 'NS-1026', date: 'Jul 30, 2026', items: '2 items', total: '$96.00', status: 'Delivered', tone: 'delivered' },
  { id: 'NS-1019', date: 'Jul 22, 2026', items: '1 item', total: '$112.00', status: 'Delivered', tone: 'delivered' }
];
const views = [...document.querySelectorAll('.page-view')];
const navItems = [...document.querySelectorAll('[data-view]')];
const breadcrumb = document.querySelector('#breadcrumb-current');
const toast = document.querySelector('#toast');
let toastTimer;
const authScreen = document.querySelector('#auth-screen');
const accountKey = 'northstar-account';
const sessionKey = 'northstar-customer-session';
const themeKey = 'kayan-theme';

function setTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  localStorage.setItem(themeKey, theme);
  document.querySelectorAll('.theme-button').forEach(button => {
    const isSelected = button.dataset.theme === theme;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

setTheme(localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light');

function setAuthMode(mode) {
  const creating = mode === 'create';
  document.querySelector('#create-form').classList.toggle('hidden', !creating);
  document.querySelector('#login-form').classList.toggle('hidden', creating);
  document.querySelector('#auth-title').textContent = creating ? 'Create your account.' : 'Welcome back.';
  document.querySelector('#auth-eyebrow').textContent = creating ? 'Welcome to Kayan Water' : 'Customer login';
  document.querySelector('#auth-copy').textContent = creating ? 'Join Kayan Water and Fresh Juice to browse your products, place orders, and track deliveries.' : 'Login to see your Kayan products, orders, and company workspace.';
  document.querySelector('#auth-switch').innerHTML = creating ? 'Already have a Kayan account? <button type="button" id="show-login">Log in</button>' : 'New to Kayan? <button type="button" id="show-create">Create an account</button>';
  document.querySelector('#auth-error').textContent = '';
  document.querySelector('#auth-error').classList.remove('visible');
  document.querySelector('#auth-switch button').addEventListener('click', () => setAuthMode(creating ? 'login' : 'create'));
}
function unlockPortal(name) {
  sessionStorage.setItem(sessionKey, 'active');
  authScreen.classList.add('hidden');
  document.body.classList.remove('auth-locked');
  const firstName = name.split(' ')[0];
  const heading = document.querySelector('#overview-view h1');
  if (heading) heading.textContent = `Good morning, ${firstName}.`;
  document.querySelector('.profile strong').textContent = name;
  document.querySelector('.avatar').textContent = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  document.querySelector('#logout-button').classList.remove('hidden');
  goToView('catalog');
}
function authError(message) { const error = document.querySelector('#auth-error'); error.textContent = message; error.classList.add('visible'); }

if (localStorage.getItem(accountKey)) setAuthMode('login');
function openCustomerAuth() {
  setAuthMode(localStorage.getItem(accountKey) ? 'login' : 'create');
  authScreen.classList.remove('hidden');
  document.body.classList.add('auth-locked');
}
document.querySelector('#create-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#create-name').value.trim();
  const email = document.querySelector('#create-email').value.trim().toLowerCase();
  const password = document.querySelector('#create-password').value;
  if (password.length < 6) return authError('Your password must be at least 6 characters.');
  const existingAccount = JSON.parse(localStorage.getItem(accountKey) || 'null');
  if (existingAccount && existingAccount.email === email) return authError('An account with this email already exists. Please log in.');
  localStorage.setItem(accountKey, JSON.stringify({ name, email, password }));
  document.querySelector('#login-email').value = email;
  setAuthMode('login');
  document.querySelector('#login-password').focus();
  document.querySelector('#auth-copy').textContent = 'Your account is ready. Enter your password to continue to the portal.';
});
document.querySelector('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  const account = JSON.parse(localStorage.getItem(accountKey) || 'null');
  const email = document.querySelector('#login-email').value.trim().toLowerCase();
  const password = document.querySelector('#login-password').value;
  if (!account || account.email !== email || account.password !== password) return authError('Email or password is incorrect.');
  unlockPortal(account.name);
});document.querySelector('#back-to-visitor').addEventListener('click', () => {
  authScreen.classList.add('hidden');
  document.body.classList.remove('auth-locked');
  goToView('catalog');
});
document.querySelector('#logout-button').addEventListener('click', () => {
  sessionStorage.removeItem(sessionKey);
  document.querySelector('#logout-button').classList.add('hidden');
  goToView('catalog');
});
document.querySelectorAll('.password-toggle').forEach(button => button.addEventListener('click', () => {
  const input = document.querySelector(`#${button.dataset.password}`);
  const isVisible = input.type === 'text';
  input.type = isVisible ? 'password' : 'text';
  button.textContent = isVisible ? 'Show' : 'Hide';
  button.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
}));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}
function orderMarkup(order, compact = false) {
  if (compact) return `<div class="order-row"><div class="order-main"><span class="order-icon">↗</span><div class="order-info"><strong>${order.id}</strong><small>${order.date} · ${order.items}</small></div></div><span class="status ${order.tone}">${order.status}</span></div>`;
  return `<div class="table-row"><span><strong>${order.id}</strong></span><span>${order.date}</span><span>${order.items}</span><span>${order.total}</span><span class="status ${order.tone}">${order.status}</span><button aria-label="Open ${order.id}">→</button></div>`;
}
function renderOrders() {
  document.querySelector('#overview-orders').innerHTML = orders.slice(0, 3).map(order => orderMarkup(order, true)).join('');
  document.querySelector('#orders-table').innerHTML = orders.map(order => orderMarkup(order)).join('');
}
function createOrder(product) {
  const message = `Hello Kayan Water and Fresh Juice, I want to order: ${product.name} (${product.price}).`;
  window.open(`https://wa.me/923066172891?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  showToast(`${product.name} order opened in WhatsApp`);
}
let selectedCategory = 'all';
function renderProducts(filter = '') {
  const filtered = products.filter(product => (selectedCategory === 'all' || product.category === selectedCategory) && (product.name.toLowerCase().includes(filter.toLowerCase()) || product.category.toLowerCase().includes(filter.toLowerCase())));
  document.querySelector('#product-grid').innerHTML = filtered.map(product => `<article class="product-card"><img class="product-image" src="${product.image}" alt="${product.name}" /><div class="product-details"><small>${product.category}</small><strong>${product.name}</strong><span>${product.price}</span></div><button class="product-add" data-add="${product.name}" aria-label="Order ${product.name} on WhatsApp">+</button></article>`).join('') || '<div class="empty-state"><strong>Products coming soon</strong><p>Your catalog is ready. Add your product information here when you are ready.</p></div>';
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => createOrder(products.find(product => product.name === button.dataset.add))));
}
function goToView(view) {
  const target = view;
  views.forEach(section => section.classList.toggle('active', section.id === `${target}-view`));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === target));
  breadcrumb.textContent = target.charAt(0).toUpperCase() + target.slice(1);
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
navItems.forEach(item => item.addEventListener('click', () => goToView(item.dataset.view)));
document.querySelector('#help-button').addEventListener('click', () => {
  const popover = document.querySelector('#help-popover');
  const isOpen = !popover.classList.toggle('hidden');
  document.querySelector('#help-button').setAttribute('aria-expanded', String(isOpen));
});
document.querySelector('#close-help').addEventListener('click', () => {
  document.querySelector('#help-popover').classList.add('hidden');
  document.querySelector('#help-button').setAttribute('aria-expanded', 'false');
});
document.querySelector('#avatar-button').addEventListener('click', () => {
  const popover = document.querySelector('#account-popover');
  const isOpen = !popover.classList.toggle('hidden');
  document.querySelector('#avatar-button').setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#account-menu-name').textContent = 'Visitor';
});
document.querySelectorAll('[data-account-action]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.accountAction;
  document.querySelector('#account-popover').classList.add('hidden');
  document.querySelector('#avatar-button').setAttribute('aria-expanded', 'false');
  if (action === 'support') window.open('https://wa.me/923066172891?text=Hello%20Kayan%20Water%20and%20Fresh%20Juice', '_blank', 'noopener');
}));
document.querySelectorAll('.theme-button').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
document.querySelector('#close-account').addEventListener('click', () => {
  document.querySelector('#account-popover').classList.add('hidden');
  document.querySelector('#avatar-button').setAttribute('aria-expanded', 'false');
});
document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
document.querySelector('#product-search').addEventListener('input', event => renderProducts(event.target.value));
document.querySelectorAll('.category[data-category]').forEach(button => button.addEventListener('click', () => { selectedCategory = button.dataset.category; button.parentElement.querySelectorAll('.category').forEach(item => item.classList.remove('active')); button.classList.add('active'); renderProducts(document.querySelector('#product-search').value); }));
renderOrders();
renderProducts();
goToView('catalog');
const savedAccount = JSON.parse(localStorage.getItem(accountKey) || 'null');
if (sessionStorage.getItem(sessionKey) === 'active' && savedAccount) unlockPortal(savedAccount.name);
