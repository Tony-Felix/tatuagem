let isAutoRotating = true;
let autoSpeed = 0.2;

window.addEventListener("load", () => {
  const carrossel = document.querySelector(".carrossel-track"); // antigo: .carrossel
  const items = [...document.querySelectorAll(".carrossel-item")];
  const btn = document.getElementById("toggleDirection");
  const controlsDiv = document.querySelector(".carrossel-controls");
  const prevArrow = document.getElementById("prevArrow");
  const nextArrow = document.getElementById("nextArrow");

  let arrowsActive = false;
  let arrowTimeout;
  let rotateY = 0;
  let startX;
  let isDragging = false;

  // =============  CRIA O CARROSSEL ================
  function createCarrossel() {
    const total = items.length;
    const angle = 360 / total;
    const tz = Math.round(
      (parseInt(getComputedStyle(carrossel).width) / 2) /
      Math.tan(Math.PI / total)
    );

    items.forEach((item, i) => {
      const degrees = angle * i;
      item.style.setProperty("--rotatey", `${degrees}deg`);
      item.style.setProperty("--tz", `${tz}px`);
    });
  }

  // ROTAÇÃO AUTOMATICA
  function autoRotate() {
    if (isAutoRotating && !isDragging) {
      rotateY -= autoSpeed; // usa autoSpeed para permitir inverter direção
      carrossel.style.setProperty("--rotatey", `${rotateY}deg`);
    }
    requestAnimationFrame(autoRotate);
  }

  // ============= FUNÇÕES DE CLICK E ARRASTE ================
  function onMouseDown(e) {
    isAutoRotating = false;
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    carrossel.style.cursor = "grabbing";
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    rotateY += delta * 0.3; // sensibilidade
    carrossel.style.setProperty("--rotatey", `${rotateY}deg`);
    startX = e.clientX;
    hasMoved = true;
    items.forEach(it => it.classList.remove("active"));
  }

  function onMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    carrossel.style.cursor = "grab";

    if (!hasMoved) return;

    // centraliza item mais próximo
    const total = items.length;
    const anglePerItem = 360 / total;

    let normalizedRotate = ((rotateY % 360) + 360) % 360;
    let activeIndex = Math.round(normalizedRotate / anglePerItem) % total;
    activeIndex = (total - activeIndex) % total;

    const itemAngle = anglePerItem * activeIndex;
    let delta = -itemAngle - rotateY;
    delta = ((delta + 180) % 360) - 180;

    const duration = 500;
    const start = performance.now();
    const initialRotate = rotateY;

    function animate(time) {
      const t = Math.min((time - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      rotateY = initialRotate + delta * eased;
      carrossel.style.setProperty("--rotatey", `${rotateY}deg`);
      if (t < 1) requestAnimationFrame(animate);
      else items.forEach((it, i) => it.classList.toggle("active", i === activeIndex));
    }
    requestAnimationFrame(animate);
  }

  // CENTRALIZA A IMAGEM CLICADA
  items.forEach((item, i) => {
    item.addEventListener("click", () => {
      isAutoRotating = false;

      items.forEach(it => it.classList.remove("active"));

      const total = items.length;
      const angle = 360 / total;
      const itemAngle = angle * i;

      let delta = -itemAngle - rotateY;
      delta = ((delta + 180) % 360) - 180;

      const duration = 500;
      const start = performance.now();
      const initialRotate = rotateY;

      function animate(time) {
        const t = Math.min((time - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        rotateY = initialRotate + delta * eased;
        carrossel.style.setProperty("--rotatey", `${rotateY}deg`);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          item.classList.add("active");
          arrowsActive = true;
        }
      }
      requestAnimationFrame(animate);
    });
  });

  // =============== BOTÃO PARA INVERTER DIREÇÃO OU INICIAR GIRO ================
  if (controlsDiv) {
    if (autoSpeed < 0) {
      controlsDiv.classList.add("active-backward");
    } else {
      controlsDiv.classList.add("active-forward");
    }
  }

  if (btn) {
    btn.addEventListener("click", () => {
      if (controlsDiv) controlsDiv.classList.remove("active-forward", "active-backward");
      arrowsActive = false;
      if (prevArrow) prevArrow.style.display = "none";
      if (nextArrow) nextArrow.style.display = "none";

      // Inverte direção do carrossel
      autoSpeed = -autoSpeed;

      if (controlsDiv) {
        controlsDiv.classList.add(autoSpeed > 0 ? "active-forward" : "active-backward");
      }

      // APLICA ROTAÇÃO
      items.forEach(it => it.classList.remove("active"));
      if (!isAutoRotating) isAutoRotating = true;
    });
  }

  // ================== CRIA SETAS DO CARROSSEL ====================
  function resetArrowTimeout() {
    clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => {
      if (prevArrow) prevArrow.style.display = "none";
      if (nextArrow) nextArrow.style.display = "none";
    }, 3000);
  }

  // Evento para mostrar/ocultar setas com base na posição do mouse
  document.addEventListener("mousemove", function mouseMoveArrow(e) {
    if (!arrowsActive) return;

    const mid = window.innerWidth / 2; // metade da tela

    if (e.clientX < mid) {
      if (prevArrow) prevArrow.style.display = "block";
      if (nextArrow) nextArrow.style.display = "none";
    } else {
      if (nextArrow) nextArrow.style.display = "block";
      if (prevArrow) prevArrow.style.display = "none";
    }

    resetArrowTimeout();
  });

  // Clique nas laterais da tela
  document.addEventListener("click", (e) => {
    if (!arrowsActive) return;

    // se o clique for dentro do carrossel, ignora
    if (carrossel.contains(e.target)) return;

    const mid = window.innerWidth / 2;
    const currentIndex = items.findIndex(it => it.classList.contains("active"));

    if (e.clientX < mid) {
      // lado esquerdo → próxima imagem
      const newIndex = (currentIndex + 1) % items.length;
      items[newIndex].click();
    } else {
      // lado direito → imagem anterior
      const newIndex = (currentIndex - 1 + items.length) % items.length;
      items[newIndex].click();
    }

    resetArrowTimeout();
  });


  // ============================== EVENTOS ============================
  if (carrossel) carrossel.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // inicialização
  createCarrossel();
  autoRotate();

  window.addEventListener("resize", createCarrossel);
});
