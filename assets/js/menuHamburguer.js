document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector('.hamburger');
  const leftMenu = document.querySelector('.nav-left .nav-list');
  const rightMenu = document.querySelector('.nav-right');

  if (!hamburger || !leftMenu || !rightMenu) return;

  let clickLocked = false; // previne cliques duplicados

  hamburger.addEventListener('click', (e) => {
    if (clickLocked) return;
    clickLocked = true;

    e.stopPropagation();
    console.log("Hambúrguer clicado!");
    hamburger.classList.toggle('active');
    leftMenu.classList.toggle('active');
    rightMenu.classList.toggle('active');

    setTimeout(() => clickLocked = false, 100);
  });
});
