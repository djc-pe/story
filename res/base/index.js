document.querySelectorAll('.djc-tutorial-tabs').forEach(tabs => {
  const links = tabs.querySelectorAll('.djc-tab');
  const panels = tabs.querySelectorAll('.djc-tab-panel');

  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();

      links.forEach(item => {
        item.setAttribute('aria-selected', 'false');
      });

      panels.forEach(panel => {
        panel.classList.remove('is-active');
      });

      link.setAttribute('aria-selected', 'true');

      const panel = tabs.querySelector(link.getAttribute('href'));

      if (panel) {
        panel.classList.add('is-active');
      }
    });
  });
});