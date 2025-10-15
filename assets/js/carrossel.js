window.addEventListener("load", () => {
  if (window.innerWidth < 768) {
    return;
  }

  let isAutoRotating = true;
  let autoSpeed = 0.2;

  // ===========================
  // INJETANDO O TEMPLATE
  // ===========================
  const iniciarSection = document.getElementById("entreEmContato");
  const template = document.getElementById("carrosselTemplate");

  if (iniciarSection && template) {
    const section = template.content.querySelector("section");
    iniciarSection.insertAdjacentElement("afterend", section);
  }

  // ===========================
  // SELEÇÃO DE ELEMENTOS DO CARROSSEL
  // ===========================
  const carrossel = document.querySelector(".carrossel-track");
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
  let hasMoved = false;

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

  // ROTAÇÃO AUTOMÁTICA
  function autoRotate() {
    if (isAutoRotating && !isDragging) {
      rotateY -= autoSpeed;
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
    rotateY += delta * 0.3;
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

  // BOTÃO DE INVERSÃO
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

      autoSpeed = -autoSpeed;

      if (controlsDiv) {
        controlsDiv.classList.add(autoSpeed > 0 ? "active-forward" : "active-backward");
      }

      items.forEach(it => it.classList.remove("active"));
      if (!isAutoRotating) isAutoRotating = true;
    });
  }

  // SETAS
  function resetArrowTimeout() {
    clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => {
      if (prevArrow) prevArrow.style.display = "none";
      if (nextArrow) nextArrow.style.display = "none";
    }, 3000);
  }

  document.addEventListener("mousemove", function mouseMoveArrow(e) {
    if (!arrowsActive) return;

    const mid = window.innerWidth / 2;
    if (e.clientX < mid) {
      if (prevArrow) prevArrow.style.display = "block";
      if (nextArrow) nextArrow.style.display = "none";
    } else {
      if (nextArrow) nextArrow.style.display = "block";
      if (prevArrow) prevArrow.style.display = "none";
    }

    resetArrowTimeout();
  });

  document.addEventListener("click", (e) => {
    if (!arrowsActive) return;
    if (carrossel.contains(e.target)) return;

    const mid = window.innerWidth / 2;
    const currentIndex = items.findIndex(it => it.classList.contains("active"));

    if (e.clientX < mid) {
      const newIndex = (currentIndex + 1) % items.length;
      items[newIndex].click();
    } else {
      const newIndex = (currentIndex - 1 + items.length) % items.length;
      items[newIndex].click();
    }

    resetArrowTimeout();
  });

  // EVENTOS
  if (carrossel) carrossel.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // INICIALIZAÇÃO
  createCarrossel();
  autoRotate();
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(createCarrossel, 200);
  });
});
