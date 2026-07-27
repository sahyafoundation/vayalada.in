  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  const links = document.querySelectorAll('.navlinks')[0];
  if (links) { menu.innerHTML = links.innerHTML; }
  toggle.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') menu.style.display = 'none';
  });

  // Layered Mouse Parallax & Ambient Spotlight for Hero Section
  const heroSection = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-art');
  const heroSpotlight = heroSection ? heroSection.querySelector('.hero-spotlight') : null;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSection && isFinePointer && !isReducedMotion) {
    const backMtn = heroArt ? heroArt.querySelector('.mountain-back') : null;
    const midMtn = heroArt ? heroArt.querySelector('.mountain-mid') : null;
    const frontMtn = heroArt ? heroArt.querySelector('.mountain-front') : null;
    const badgeCard = heroArt ? heroArt.querySelector('.badge-count') : null;
    const heroSeal = heroArt ? heroArt.querySelector('.hero-seal') : null;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let spotTargetX = 0, spotTargetY = 0;
    let spotCurrentX = 0, spotCurrentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      if (heroSpotlight) {
        spotTargetX = e.clientX - rect.left;
        spotTargetY = e.clientY - rect.top;
        heroSpotlight.style.opacity = '0.04';
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (heroSpotlight) {
        heroSpotlight.style.opacity = '0';
      }
    });

    function updateHeroMotion() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      // Layer 1 — Background Mountains: opposite cursor, max H: 4px, V: 2px
      if (backMtn) backMtn.style.transform = `translate3d(${currentX * -4}px, ${currentY * -2}px, 0)`;

      // Layer 2 — Middle Mountains: max H: 6px, V: 3px
      if (midMtn) midMtn.style.transform = `translate3d(${currentX * -6}px, ${currentY * -3}px, 0)`;

      // Layer 3 — Foreground Elements: max H: 8px, V: 4px
      if (frontMtn) frontMtn.style.transform = `translate3d(${currentX * -8}px, ${currentY * -4}px, 0)`;

      // Floating "48 hrs" card: stronger response, max H: 8px, V: 8px
      if (badgeCard) {
        badgeCard.style.setProperty('--px', `${currentX * -8}px`);
        badgeCard.style.setProperty('--py', `${currentY * -8}px`);
      }

      // Poster seal card
      if (heroSeal) {
        heroSeal.style.setProperty('--sx', `${currentX * -6}px`);
        heroSeal.style.setProperty('--sy', `${currentY * -4}px`);
      }

      // Ambient Spotlight lerp
      if (heroSpotlight) {
        spotCurrentX += (spotTargetX - spotCurrentX) * 0.08;
        spotCurrentY += (spotTargetY - spotCurrentY) * 0.08;
        heroSpotlight.style.setProperty('--sx', `${spotCurrentX.toFixed(1)}px`);
        heroSpotlight.style.setProperty('--sy', `${spotCurrentY.toFixed(1)}px`);
      }

      requestAnimationFrame(updateHeroMotion);
    }
    requestAnimationFrame(updateHeroMotion);
  }

  // Smooth scroll handler for CTA & anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // IntersectionObserver Scroll Reveal for #about-bioblitz
  const bioblitzSec = document.getElementById('about-bioblitz');
  if (bioblitzSec) {
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bioblitz-reveal');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      observer.observe(bioblitzSec);
    } else {
      bioblitzSec.classList.add('bioblitz-reveal');
    }
  }

  // ---------- REACH MAP ----------
  const reachMapEl = document.getElementById('reachMap');
  if (reachMapEl && window.L) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rootCss = getComputedStyle(document.documentElement);
    const themeColor = (name, fallback) => (rootCss.getPropertyValue(name).trim() || fallback);

    const DEST = { lat: 11.50668, lng: 75.86606 };

    const routes = [
      { key: 'kozhikode',    file: 'geo/route_from_kozhikode.geojson',    color: themeColor('--forest', '#3C5B44') },
      { key: 'koyilandy',    file: 'geo/route_from_koyilandy.geojson',    color: themeColor('--laterite', '#A44A2E') },
      { key: 'thamarassery', file: 'geo/route_from_thamarassery.geojson', color: themeColor('--paddy', '#C4972B') },
    ];

    const map = L.map(reachMapEl, {
      zoomControl: false,
      zoomAnimation: !prefersReducedMotion,
      fadeAnimation: !prefersReducedMotion,
      markerZoomAnimation: !prefersReducedMotion,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    }).addTo(map);

    const laterite = themeColor('--laterite', '#A44A2E');
    const lateriteDark = themeColor('--laterite-dark', '#8A3C25');
    const paper = themeColor('--paper', '#FFFEFA');

    const destIcon = L.divIcon({
      className: 'reach-pin',
      html: `<svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true"><path d="M13 1C6.4 1 1.5 6.1 1.5 12.4c0 8.6 10 19.4 10.4 19.9.3.3.9.3 1.2 0 .4-.5 10.4-11.3 10.4-19.9C24.5 6.1 19.6 1 13 1Z" fill="${laterite}" stroke="${lateriteDark}" stroke-width="1"/><circle cx="13" cy="12.5" r="4.2" fill="${paper}"/></svg>`,
      iconSize: [26, 34],
      iconAnchor: [13, 32],
    });

    const destMarker = L.marker([DEST.lat, DEST.lng], {
      icon: destIcon,
      alt: 'Vayalada trailhead',
    }).addTo(map);

    destMarker.bindTooltip('Vayalada', {
      permanent: true,
      direction: 'right',
      offset: [8, -18],
      className: 'reach-pin-label',
    }).openTooltip();

    destMarker.bindPopup('<strong>Vayalada trailhead</strong>All three routes converge here.');

    // ---- distance helper: haversine over the raw GeoJSON coordinates ----
    const toRad = deg => deg * Math.PI / 180;
    const haversineKm = (a, b) => {
      const R = 6371;
      const dLat = toRad(b[1] - a[1]);
      const dLng = toRad(b[0] - a[0]);
      const lat1 = toRad(a[1]);
      const lat2 = toRad(b[1]);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
    };
    const lineLengthKm = coords => {
      let total = 0;
      for (let i = 1; i < coords.length; i++) total += haversineKm(coords[i - 1], coords[i]);
      return total;
    };

    const allBoundsLayers = [];
    let initialBounds = null;

    const loaders = routes.map(route =>
      fetch(route.file)
        .then(res => res.json())
        .then(geojson => {
          const layer = L.geoJSON(geojson, {
            style: { color: route.color, weight: 4, opacity: 0.85, lineCap: 'round' },
          }).addTo(map);

          allBoundsLayers.push(layer);

          const coords = geojson.geometry.coordinates;
          const km = lineLengthKm(coords);
          const distEl = document.getElementById(`dist-${route.key}`);
          if (distEl) distEl.textContent = `${km.toFixed(1)} km`;

          const start = coords[0];
          const dirEl = document.getElementById(`dir-${route.key}`);
          if (dirEl) {
            dirEl.href = `https://www.google.com/maps/dir/?api=1&origin=${start[1]},${start[0]}&destination=${DEST.lat},${DEST.lng}&travelmode=driving`;
          }

          const checkbox = document.getElementById(`route-${route.key}`);
          if (checkbox) {
            checkbox.addEventListener('change', () => {
              if (checkbox.checked) {
                layer.addTo(map);
              } else {
                map.removeLayer(layer);
              }
            });
          }
        })
        .catch(err => console.warn(`Reach map: couldn't load ${route.file}`, err))
    );

    Promise.all(loaders).then(() => {
      if (allBoundsLayers.length) {
        const group = L.featureGroup(allBoundsLayers);
        initialBounds = group.getBounds().pad(0.05);
        map.fitBounds(initialBounds, { animate: !prefersReducedMotion });
      } else {
        map.setView([DEST.lat, DEST.lng], 11);
      }
    });

    // ---- custom control bar: zoom in / zoom out / reset ----
    const ZoomResetControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const bar = L.DomUtil.create('div', 'reach-map-ctrl leaflet-control');

        const zoomInBtn = L.DomUtil.create('button', '', bar);
        zoomInBtn.type = 'button';
        zoomInBtn.setAttribute('aria-label', 'Zoom in');
        zoomInBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

        const zoomOutBtn = L.DomUtil.create('button', '', bar);
        zoomOutBtn.type = 'button';
        zoomOutBtn.setAttribute('aria-label', 'Zoom out');
        zoomOutBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>';

        const resetBtn = L.DomUtil.create('button', '', bar);
        resetBtn.type = 'button';
        resetBtn.setAttribute('aria-label', 'Reset view');
        resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>';

        L.DomEvent.disableClickPropagation(bar);
        L.DomEvent.on(zoomInBtn, 'click', () => map.zoomIn());
        L.DomEvent.on(zoomOutBtn, 'click', () => map.zoomOut());
        L.DomEvent.on(resetBtn, 'click', () => {
          if (initialBounds) map.fitBounds(initialBounds, { animate: !prefersReducedMotion });
        });

        return bar;
      },
    });
    map.addControl(new ZoomResetControl());

    // ---- "my location" control (best-effort, silent on failure) ----
    const LocateControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const btn = L.DomUtil.create('button', 'reach-map-locate leaflet-control');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Show my location');
        btn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';

        L.DomEvent.disableClickPropagation(btn);
        L.DomEvent.on(btn, 'click', () => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;
              L.marker([latitude, longitude], { alt: 'Your location' })
                .addTo(map)
                .bindPopup('You are here')
                .openPopup();
              map.setView([latitude, longitude], 13, { animate: !prefersReducedMotion });
            },
            () => { /* silent failure — permission denied or unavailable */ },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });

        return btn;
      },
    });
    map.addControl(new LocateControl());

    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
  }

  // ---------- PARTNER LOGO FALLBACK HANDLER ----------
  window.handlePartnerLogoError = function(img) {
    const card = img.closest('.partner-card');
    if (card) {
      card.classList.add('text-only');
    }
  };

  // ---------- VIEWPORT SCROLL ENTRANCE ANIMATIONS ----------
  document.addEventListener('DOMContentLoaded', () => {
    const animElements = document.querySelectorAll('.animate-on-scroll');
    if (animElements.length === 0) return;

    // Stagger animation delays within card grids
    const containers = document.querySelectorAll('.committee-card-grid, .partner-card-grid');
    containers.forEach(container => {
      const cards = container.querySelectorAll('.animate-on-scroll');
      cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 80}ms`;
      });
    });

    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      animElements.forEach(el => observer.observe(el));
    } else {
      animElements.forEach(el => el.classList.add('is-visible'));
    }
  });
