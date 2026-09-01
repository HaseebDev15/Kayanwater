let products = JSON.parse(localStorage.getItem('kayan-products') || '[]');
let orders = [
  { id: 'NS-1048', date: 'Aug 28, 2026', items: '3 items', total: '$186.00', status: 'In transit', tone: 'transit' },
  { id: 'NS-1042', date: 'Aug 19, 2026', items: '1 item', total: '$64.00', status: 'Processing', tone: 'processing' },
  { id: 'NS-1031', date: 'Aug 07, 2026', items: '4 items', total: '$292.00', status: 'Delivered', tone: 'delivered' },
  { id: 'NS-1026', date: 'Jul 30, 2026', items: '2 items', total: '$96.00', status: 'Delivered', tone: 'delivered' },
  { id: 'NS-1019', date: 'Jul 22, 2026', items: '1 item', total: '$112.00', status: 'Delivered', tone: 'delivered' }
];
let adminOrders = [orders[0], orders[1], { id: 'NS-1047', date: 'Aug 27, 2026', items: '6 items', total: '$438.00', status: 'Ready to ship', tone: 'processing' }];

const views = [...document.querySelectorAll('.page-view')];
const navItems = [...document.querySelectorAll('[data-view]')];
const breadcrumb = document.querySelector('#breadcrumb-current');
const toast = document.querySelector('#toast');
let toastTimer;
const authScreen = document.querySelector('#auth-screen');
const accountKey = 'northstar-account';
const sessionKey = 'northstar-customer-session';
const adminAuthScreen = document.querySelector('#admin-auth-screen');
const adminAccountsKey = 'northstar-admin-accounts';
const adminInviteKey = 'Saad@1234';
const companyKey = 'kayan-company-details';
const developerKey = 'kayan-developer-profile';
const developerAccessKey = 'HaseebDev';

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
});

function setAdminAuthMode(mode) {
  const creating = mode === 'create';
  document.querySelector('#admin-create-form').classList.toggle('hidden', !creating);
  document.querySelector('#admin-login-form').classList.toggle('hidden', creating);
  document.querySelector('#admin-auth-title').textContent = creating ? 'Create admin account.' : 'Admin login.';
  document.querySelector('#admin-auth-copy').textContent = creating ? 'Set up an administrator account to manage the Kayan Water and Fresh Juice portal.' : 'Log in with your administrator credentials to continue.';
  document.querySelector('#admin-auth-switch').innerHTML = creating ? 'Already an admin? <button type="button" id="show-admin-login">Log in</button>' : 'Need another admin account? <button type="button" id="show-admin-create">Create account</button>';
  document.querySelector('#admin-auth-error').textContent = '';
  document.querySelector('#admin-auth-error').classList.remove('visible');
  document.querySelector('#admin-auth-switch button').addEventListener('click', () => setAdminAuthMode(creating ? 'login' : 'create'));
}
function showAdminAuth() {
  const admins = JSON.parse(localStorage.getItem(adminAccountsKey) || '[]');
  setAdminAuthMode(admins.length ? 'login' : 'create');
  adminAuthScreen.classList.remove('hidden');
  document.body.classList.add('admin-auth-locked');
}
function closeAdminAuth() {
  adminAuthScreen.classList.add('hidden');
  document.body.classList.remove('admin-auth-locked');
}
function adminError(message) { const error = document.querySelector('#admin-auth-error'); error.textContent = message; error.classList.add('visible'); }
function unlockAdmin(name) {
  closeAdminAuth();
  goToView('admin');
  document.querySelector('.admin-banner h1').textContent = `Welcome, ${name.split(' ')[0]}.`;
}
document.querySelector('#admin-create-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#admin-create-name').value.trim();
  const email = document.querySelector('#admin-create-email').value.trim().toLowerCase();
  const password = document.querySelector('#admin-create-password').value;
  const inviteKey = document.querySelector('#admin-create-key').value.trim();
  if (password.length < 6) return adminError('Your password must be at least 6 characters.');
  if (inviteKey !== adminInviteKey) return adminError('That admin key is not valid. Ask your company owner for the correct key.');
  const admins = JSON.parse(localStorage.getItem(adminAccountsKey) || '[]');
  if (admins.some(admin => admin.email === email)) return adminError('An admin with this email already exists.');
  admins.push({ name, email, password });
  localStorage.setItem(adminAccountsKey, JSON.stringify(admins));
  document.querySelector('#admin-login-email').value = email;
  setAdminAuthMode('login');
  document.querySelector('#admin-login-password').focus();
  document.querySelector('#admin-auth-copy').textContent = 'Admin account created. Enter your password to open the control center.';
});
document.querySelector('#admin-login-form').addEventListener('submit', event => {
  event.preventDefault();
  const admins = JSON.parse(localStorage.getItem(adminAccountsKey) || '[]');
  const email = document.querySelector('#admin-login-email').value.trim().toLowerCase();
  const password = document.querySelector('#admin-login-password').value;
  const admin = admins.find(account => account.email === email && account.password === password);
  if (!admin) return adminError('Admin email or password is incorrect.');
  unlockAdmin(admin.name);
});
document.querySelector('#back-to-portal').addEventListener('click', closeAdminAuth);
document.querySelector('#back-to-visitor').addEventListener('click', () => {
  authScreen.classList.add('hidden');
  document.body.classList.remove('auth-locked');
  goToView('catalog');
});
document.querySelector('#logout-button').addEventListener('click', () => {
  sessionStorage.removeItem(sessionKey);
  closeAdminAuth();
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
  document.querySelector('#admin-products').innerHTML = products.map((product, index) => `<div class="admin-product-row"><span class="admin-product-thumb"><img src="${product.image}" alt="" /></span><span><strong>${product.name}</strong><small>${product.category} · ${product.price}</small></span><button class="product-edit" data-edit-product="${index}" aria-label="Edit ${product.name}">Edit</button><button class="product-delete" data-delete-product="${index}" aria-label="Delete ${product.name}">×</button></div>`).join('') || '<p class="admin-empty">No products added yet.</p>';
  document.querySelectorAll('[data-edit-product]').forEach(button => button.addEventListener('click', () => openProductModal(Number(button.dataset.editProduct))));
  document.querySelectorAll('[data-delete-product]').forEach(button => button.addEventListener('click', () => deleteProduct(Number(button.dataset.deleteProduct))));
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
function openProductModal(index = -1) {
  const form = document.querySelector('#product-form');
  const product = products[index];
  form.dataset.editingIndex = index;
  document.querySelector('#product-modal-title').textContent = product ? 'Edit product' : 'Add product';
  document.querySelector('#product-submit').innerHTML = product ? 'Save product <span>↗</span>' : 'Publish product <span>↗</span>';
  if (product) {
    document.querySelector('#new-product-name').value = product.name;
    document.querySelector('#new-product-category').value = product.category;
    document.querySelector('#new-product-price').value = product.price;
    document.querySelector('#new-product-image').value = product.image;
  } else form.reset();
  document.querySelector('#product-modal').classList.remove('hidden');
  document.querySelector('#new-product-name').focus();
}
function closeProductModal() { document.querySelector('#product-modal').classList.add('hidden'); document.querySelector('#product-form').reset(); document.querySelector('#product-form').dataset.editingIndex = '-1'; document.querySelector('#product-modal-title').textContent = 'Add product'; document.querySelector('#product-submit').innerHTML = 'Publish product <span>↗</span>'; }
function deleteProduct(index) {
  const product = products[index];
  if (!product || !window.confirm(`Delete ${product.name}?`)) return;
  products.splice(index, 1);
  localStorage.setItem('kayan-products', JSON.stringify(products));
  renderProducts(document.querySelector('#product-search').value);
  renderOrders();
  showToast(`${product.name} deleted`);
}
function renderCompany() {
  const company = JSON.parse(localStorage.getItem(companyKey) || 'null') || { name: 'Kayan Water and Fresh Juice', location: 'Nazir Pura, Sialkot', description: 'Clean drinking water and fresh juice, prepared locally with care for homes, shops, and businesses.' };
  document.querySelector('#company-view').innerHTML = `<div class="empty-company"><p class="eyebrow">Since 2023 · ${company.location}</p><h1>${company.name}</h1><p>${company.description}</p></div>`;
  document.querySelector('#company-name').value = company.name;
  document.querySelector('#company-location').value = company.location;
  document.querySelector('#company-description').value = company.description;
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function renderDeveloper() {
  const profile = JSON.parse(localStorage.getItem(developerKey) || 'null');
  if (!profile) return;
  const socialLinks = [['facebook', 'Facebook', profile.facebook], ['instagram', 'Developer Instagram', profile.instagram], ['linkedin', 'LinkedIn', profile.linkedin], ['website', 'Website', profile.website]].filter(([, , url]) => url).map(([icon, label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener"><img src="https://cdn.simpleicons.org/${icon}/438267" alt="" />${label} ↗</a>`).join('');
  const whatsappLink = profile.whatsapp ? `<a class="developer-whatsapp" href="https://wa.me/${escapeHtml(profile.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener"><img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" /> Contact Developer</a>` : '';
  document.querySelector('#developer-profile').innerHTML = `<img class="developer-picture" src="${escapeHtml(profile.picture)}" alt="${escapeHtml(profile.name)}" /><p class="eyebrow">${escapeHtml(profile.location)}</p><h1>${escapeHtml(profile.name)}</h1><p class="developer-subtitle">${escapeHtml(profile.subtitle || 'Son of Ghulam Haider')}</p><p>${escapeHtml(profile.description)}</p><div class="developer-socials">${whatsappLink}${socialLinks || ''}${whatsappLink || socialLinks ? '' : '<span>No social links added yet.</span>'}</div>`;
  document.querySelector('#developer-name').value = profile.name;
  document.querySelector('#developer-subtitle').value = profile.subtitle || 'Son of Ghulam Haider';
  document.querySelector('#developer-description').value = profile.description;
  document.querySelector('#developer-picture').value = profile.picture;
  document.querySelector('#developer-location').value = profile.location;
  document.querySelector('#developer-facebook').value = profile.facebook || '';
  document.querySelector('#developer-instagram').value = profile.instagram || '';
  document.querySelector('#developer-linkedin').value = profile.linkedin || '';
  document.querySelector('#developer-website').value = profile.website || '';
  document.querySelector('#developer-whatsapp').value = profile.whatsapp || '923059150231';
}
function openCompanyModal() { document.querySelector('#company-modal').classList.remove('hidden'); document.querySelector('#company-name').focus(); }
function closeCompanyModal() { document.querySelector('#company-modal').classList.add('hidden'); }
document.querySelector('#unlock-developer').addEventListener('click', () => {
  const key = document.querySelector('#developer-access-key').value;
  const error = document.querySelector('#developer-error');
  if (key !== developerAccessKey) {
    error.textContent = 'That developer key is not valid.';
    error.classList.add('visible');
    return;
  }
  error.classList.remove('visible');
  document.querySelector('#developer-lock').classList.add('hidden');
  document.querySelector('#developer-form').classList.remove('hidden');
});
function goToView(view) {
  const target = view === 'admin' ? 'admin' : view;
  views.forEach(section => section.classList.toggle('active', section.id === `${target}-view`));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === target));
  breadcrumb.textContent = target === 'admin' ? 'Admin portal' : target.charAt(0).toUpperCase() + target.slice(1);
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
navItems.forEach(item => item.addEventListener('click', () => item.dataset.view === 'admin' ? showAdminAuth() : goToView(item.dataset.view)));
document.querySelector('#open-login').addEventListener('click', openCustomerAuth);
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
document.querySelector('#close-account').addEventListener('click', () => {
  document.querySelector('#account-popover').classList.add('hidden');
  document.querySelector('#avatar-button').setAttribute('aria-expanded', 'false');
});
document.querySelector('#account-logout').addEventListener('click', () => {
  document.querySelector('#account-popover').classList.add('hidden');
  document.querySelector('#avatar-button').setAttribute('aria-expanded', 'false');
  document.querySelector('#logout-button').click();
});
document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
document.querySelector('#product-search').addEventListener('input', event => renderProducts(event.target.value));
document.querySelectorAll('.category[data-category]').forEach(button => button.addEventListener('click', () => { selectedCategory = button.dataset.category; button.parentElement.querySelectorAll('.category').forEach(item => item.classList.remove('active')); button.classList.add('active'); renderProducts(document.querySelector('#product-search').value); }));
document.querySelectorAll('.action-row').forEach(button => button.addEventListener('click', () => {
  if (button.id === 'add-product-action') return openProductModal();
  showToast(`${button.querySelector('strong').textContent} opened`);
}));
document.querySelector('#close-product-modal').addEventListener('click', closeProductModal);
document.querySelector('#product-modal').addEventListener('click', event => { if (event.target.id === 'product-modal') closeProductModal(); });
document.querySelector('#company-settings-action').addEventListener('click', openCompanyModal);
document.querySelector('#close-company-modal').addEventListener('click', closeCompanyModal);
document.querySelector('#company-modal').addEventListener('click', event => { if (event.target.id === 'company-modal') closeCompanyModal(); });
document.querySelector('#company-form').addEventListener('submit', event => {
  event.preventDefault();
  localStorage.setItem(companyKey, JSON.stringify({ name: document.querySelector('#company-name').value.trim(), location: document.querySelector('#company-location').value.trim(), description: document.querySelector('#company-description').value.trim() }));
  renderCompany();
  closeCompanyModal();
  showToast('Company details updated');
});
document.querySelector('#developer-form').addEventListener('submit', event => {
  event.preventDefault();
  localStorage.setItem(developerKey, JSON.stringify({ name: document.querySelector('#developer-name').value.trim(), subtitle: document.querySelector('#developer-subtitle').value.trim(), description: document.querySelector('#developer-description').value.trim(), picture: document.querySelector('#developer-picture').value.trim(), location: document.querySelector('#developer-location').value.trim(), facebook: document.querySelector('#developer-facebook').value.trim(), instagram: document.querySelector('#developer-instagram').value.trim(), linkedin: document.querySelector('#developer-linkedin').value.trim(), website: document.querySelector('#developer-website').value.trim(), whatsapp: document.querySelector('#developer-whatsapp').value.trim() }));
  renderDeveloper();
  showToast('Developer profile updated');
});
document.querySelector('#product-form').addEventListener('submit', event => {
  event.preventDefault();
  const product = { name: document.querySelector('#new-product-name').value.trim(), category: document.querySelector('#new-product-category').value, price: document.querySelector('#new-product-price').value.trim(), image: document.querySelector('#new-product-image').value.trim() };
  const editingIndex = Number(document.querySelector('#product-form').dataset.editingIndex);
  if (editingIndex >= 0) products[editingIndex] = product;
  else products = [product, ...products];
  localStorage.setItem('kayan-products', JSON.stringify(products));
  renderProducts(document.querySelector('#product-search').value);
  renderOrders();
  closeProductModal();
  showToast(`${product.name} published to the public Products page`);
});
renderOrders();
renderProducts();
goToView('catalog');
renderCompany();
renderDeveloper();
const savedAccount = JSON.parse(localStorage.getItem(accountKey) || 'null');
if (sessionStorage.getItem(sessionKey) === 'active' && savedAccount) unlockPortal(savedAccount.name);
