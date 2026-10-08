/* Delegated actions: markup says data-action="name" data-*; code registers handlers once. No inline JS anywhere. */
(() => {
  const registry = {};
  FE.actions = {
    register(name, fn) { registry[name] = fn; },
    run(name, el, ev) { return registry[name]?.(el, ev, { ...el.dataset }); }
  };
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    if (el.tagName === 'A' && !el.getAttribute('href')) ev.preventDefault();
    FE.actions.run(el.dataset.action, el, ev);
  });
})();
