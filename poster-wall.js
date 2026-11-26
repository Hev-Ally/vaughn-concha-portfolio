const wall = document.querySelector('#poster-wall');

if (wall) {
  const files = ['adobo.jpg', 'lebuddah.jpg', 'oil price hike.jpg', 'pax silica.jpg'];
  const sources = files.map((file) => `./assets/posters/${encodeURIComponent(file)}`);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const posters = [];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function layout(poster) {
    const width = wall.clientWidth || window.innerWidth;
    const posterWidth = Math.min(330, width * (width < 600 ? .42 : .25));
    const perspective = 1100;
    const scale = (.54 + poster.depth * .54) * (perspective / (perspective - poster.z));

    poster.width = posterWidth;
    poster.height = posterWidth * poster.ratio;
    poster.element.style.width = `${poster.width}px`;
    poster.element.style.height = `${poster.height}px`;
    poster.scale = scale;
    poster.renderWidth = poster.width * scale;
    poster.renderHeight = poster.height * scale;
  }

  function choosePosition(poster, width) {
    const minCenter = poster.renderWidth / 2;
    const maxCenter = Math.max(minCenter, width - poster.renderWidth / 2);
    const nearby = posters.filter((other) => other !== poster
      && poster.y < other.y + other.renderHeight
      && poster.y + poster.renderHeight > other.y);
    let bestCenter = minCenter + Math.random() * (maxCenter - minCenter);
    let bestClearance = -Infinity;

    for (let attempt = 0; attempt < 14; attempt += 1) {
      const center = minCenter + Math.random() * (maxCenter - minCenter);
      const clearance = nearby.reduce((minimum, other) => {
        const otherCenter = other.x + other.width / 2;
        const gap = Math.abs(center - otherCenter) - (poster.renderWidth + other.renderWidth) / 2;
        return Math.min(minimum, gap);
      }, Infinity);

      if (clearance > bestClearance) {
        bestCenter = center;
        bestClearance = clearance;
      }
    }

    poster.x = bestCenter - poster.width / 2;
  }

  function place(poster, time = 0) {
    const width = wall.clientWidth || window.innerWidth;
    const height = wall.clientHeight || window.innerHeight;
    const visualLeft = poster.x + (poster.width - poster.renderWidth) / 2;
    const driftLimit = Math.min(visualLeft, Math.max(0, width - poster.renderWidth - visualLeft));
    const drift = Math.min(poster.drift, driftLimit);
    const x = poster.x + Math.sin(time * .00018 + poster.phase) * drift;
    const floatY = Math.sin(time * .00012 + poster.phase) * (reducedMotion ? 3 : 9);
    const fadeIn = reducedMotion ? 1 : clamp((height - poster.y) / (poster.renderHeight * .22), 0, 1);
    const fadeOut = reducedMotion ? 1 : clamp((poster.y + poster.renderHeight) / (poster.renderHeight * .22), 0, 1);

    poster.element.style.opacity = String(poster.opacity * fadeIn * fadeOut);
    const transformY = poster.y + floatY - (poster.height - poster.renderHeight) / 2;
    poster.element.style.transform = `translate3d(${x}px, ${transformY}px, ${poster.z}px) scale(${poster.scale}) rotateY(${poster.rotateY}deg) rotateZ(${poster.rotateZ}deg)`;
  }

  sources.forEach((source, index) => {
    const element = document.createElement('div');
    const image = document.createElement('img');
    const depth = .38 + (.58 * ((index * 3) % files.length)) / (files.length - 1);
    const poster = {
      element,
      index,
      depth,
      z: Math.round(depth * 180),
      rotateY: (index % 2 ? -1 : 1) * (3 + depth * 4),
      rotateZ: (index % 2 ? -1 : 1) * depth * 1.5,
      ratio: 1.42,
      speed: (50 + depth * 32) * (reducedMotion ? .5 : 1),
      drift: (12 + depth * 8) * (reducedMotion ? .2 : 1),
      phase: index * 1.73,
      opacity: .3 + depth * .28,
      y: 0,
      x: 0,
      width: 0,
      height: 0,
      renderWidth: 0,
      renderHeight: 0,
      scale: 1,
    };

    element.className = 'wall-poster';
    element.setAttribute('aria-hidden', 'true');
    element.style.zIndex = String(Math.round(depth * 10));
    image.alt = '';
    image.draggable = false;
    image.decoding = 'async';
    image.loading = 'eager';
    image.addEventListener('load', () => {
      if (image.naturalWidth && image.naturalHeight) {
        poster.ratio = image.naturalHeight / image.naturalWidth;
        layout(poster);
        choosePosition(poster, wall.clientWidth || window.innerWidth);
        place(poster);
      }
    }, { once: true });
    element.append(image);
    poster.image = image;
    posters.push(poster);
    wall.append(element);
    image.src = source;
  });

  function reset(poster, height) {
    const width = wall.clientWidth || window.innerWidth;
    poster.y = height - poster.renderHeight * .2
      + poster.index * poster.renderHeight * .55
      + (Math.random() - .5) * height * .12;
    choosePosition(poster, width);
  }

  function updateLayout() {
    const height = wall.clientHeight || window.innerHeight;
    const width = wall.clientWidth || window.innerWidth;
    posters.forEach(layout);
    posters.forEach((poster) => {
      if (reducedMotion) {
        poster.y = height * (.2 + (poster.index % 2) * .38);
      } else {
        poster.y = height - poster.renderHeight * .2
          + poster.index * poster.renderHeight * .55
          + (Math.random() - .5) * height * .12;
      }
      choosePosition(poster, width);
      place(poster);
    });
  }

  updateLayout();

  let frame = 0;
  let lastTime = 0;

  function animate(time) {
    const delta = Math.min(40, lastTime ? time - lastTime : 0) / 1000;
    const height = wall.clientHeight || window.innerHeight;
    lastTime = time;

    posters.forEach((poster) => {
      if (!poster.image.complete || !poster.image.naturalWidth) return;
      poster.y -= poster.speed * delta;
      if (poster.y + poster.renderHeight < -8) reset(poster, height);
      place(poster, time);
    });

    if (!document.hidden) frame = window.requestAnimationFrame(animate);
  }

  function start() {
    if (frame || document.hidden) return;
    lastTime = 0;
    frame = window.requestAnimationFrame(animate);
  }

  window.addEventListener('resize', updateLayout, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else {
      start();
    }
  });
  start();
}
