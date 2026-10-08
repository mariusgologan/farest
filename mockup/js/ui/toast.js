FE.toast = (msg, kind = 'ok') => {
  const el = document.createElement('div');
  el.className = 'toast acrylic thick e-4';
  el.dataset.kind = kind;
  el.setAttribute('role', 'status');
  el.textContent = msg;
  FE.$('#toasts').append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), FE.config.overlay.exitMs); }, FE.config.toastMs);
};
