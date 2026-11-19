(() => {
  "use strict";

  const JAKARTA_CENTER = [-6.1944, 106.8229];
  const DEFAULT_ZOOM = 13;

  const PRESET_LOCATIONS = [
    {
      id: "ui-salemba",
      name: "Universitas Indonesia Salemba",
      shortName: "UI Salemba",
      category: "kampus",
      categoryLabel: "Kampus",
      area: "Jl. Salemba Raya, Jakarta Pusat",
      lat: -6.1938,
      lng: 106.8492
    },
    {
      id: "atma-jaya",
      name: "Universitas Atma Jaya",
      shortName: "Atma Jaya Semanggi",
      category: "kampus",
      categoryLabel: "Kampus",
      area: "Jl. Jend. Sudirman, Semanggi",
      lat: -6.2194,
      lng: 106.8147
    },
    {
      id: "trisakti",
      name: "Universitas Trisakti",
      shortName: "Universitas Trisakti",
      category: "kampus",
      categoryLabel: "Kampus",
      area: "Jl. Kyai Tapa, Grogol",
      lat: -6.1681,
      lng: 106.7890
    },
    {
      id: "gambir",
      name: "Stasiun Gambir",
      shortName: "Stasiun Gambir",
      category: "stasiun",
      categoryLabel: "Stasiun",
      area: "Medan Merdeka Timur, Gambir",
      lat: -6.1767,
      lng: 106.8306
    },
    {
      id: "mrt-bundaran-hi",
      name: "Stasiun MRT Bundaran HI",
      shortName: "MRT Bundaran HI",
      category: "stasiun",
      categoryLabel: "Stasiun",
      area: "Jl. M.H. Thamrin, Jakarta Pusat",
      lat: -6.1931,
      lng: 106.8230
    },
    {
      id: "stasiun-sudirman",
      name: "Stasiun KRL Sudirman",
      shortName: "Stasiun Sudirman",
      category: "stasiun",
      categoryLabel: "Stasiun",
      area: "Dukuh Atas, Tanah Abang",
      lat: -6.2024,
      lng: 106.8235
    },
    {
      id: "grand-indonesia",
      name: "Grand Indonesia",
      shortName: "Grand Indonesia",
      category: "belanja",
      categoryLabel: "Pusat Belanja",
      area: "Jl. M.H. Thamrin No.1, Menteng",
      lat: -6.1952,
      lng: 106.8206
    },
    {
      id: "plaza-senayan",
      name: "Plaza Senayan",
      shortName: "Plaza Senayan",
      category: "belanja",
      categoryLabel: "Pusat Belanja",
      area: "Jl. Asia Afrika, Gelora",
      lat: -6.2253,
      lng: 106.7991
    },
    {
      id: "sarinah",
      name: "Sarinah Thamrin",
      shortName: "Sarinah Thamrin",
      category: "belanja",
      categoryLabel: "Pusat Belanja",
      area: "Jl. M.H. Thamrin No.11, Gondangdia",
      lat: -6.1873,
      lng: 106.8239
    },
    {
      id: "sabang",
      name: "Kuliner Jalan Sabang",
      shortName: "Kuliner Sabang",
      category: "kuliner",
      categoryLabel: "Kuliner",
      area: "Jl. H. Agus Salim, Kebon Sirih",
      lat: -6.1843,
      lng: 106.8247
    },
    {
      id: "blok-m",
      name: "Blok M Square (Little Tokyo)",
      shortName: "Blok M Little Tokyo",
      category: "kuliner",
      categoryLabel: "Kuliner",
      area: "Jl. Melawai, Kebayoran Baru",
      lat: -6.2443,
      lng: 106.7999
    },
    {
      id: "pecenongan",
      name: "Kuliner Malam Pecenongan",
      shortName: "Kuliner Pecenongan",
      category: "kuliner",
      categoryLabel: "Kuliner",
      area: "Jl. Pecenongan, Gambir",
      lat: -6.1647,
      lng: 106.8256
    }
  ];

  const CATEGORY_NAMES = {
    all: "Semua",
    kampus: "Kampus",
    stasiun: "Stasiun",
    belanja: "Pusat Belanja",
    kuliner: "Kuliner"
  };

  const state = {
    activeCategory: "all",
    pickTarget: "origin",
    origin: null,
    destination: null,
    routes: [],
    selectedRouteIndex: 0,
    sidebarCollapsed: false,
    mobileSheetState: "expanded",
    routeAbortController: null,
    searchAbortControllers: { origin: null, destination: null },
    searchTimers: { origin: null, destination: null },
    searchResults: { origin: [], destination: [] },
    highlightedIndex: { origin: -1, destination: -1 },
    toastTimer: null
  };

  let map = null;
  let originMarker = null;
  let destinationMarker = null;
  let routeLayerGroup = null;
  let presetLayerGroup = null;

  const dom = {};

  function cacheDom() {
    dom.mapEl = document.getElementById("map");
    dom.mapFallback = document.getElementById("map-fallback");
    dom.reloadMapBtn = document.getElementById("reload-map-btn");

    dom.statusBadge = document.getElementById("osm-status-badge");
    dom.statusText = document.getElementById("osm-status-text");
    dom.categoryPills = Array.from(document.querySelectorAll(".category-pill"));
    dom.resetRouteBtn = document.getElementById("reset-route-btn");

    dom.sidebar = document.getElementById("route-panel");
    dom.collapseSidebarBtn = document.getElementById("collapse-sidebar-btn");
    dom.expandSidebarBtn = document.getElementById("expand-sidebar-btn");
    dom.mobileSheetToggle = document.getElementById("mobile-sheet-toggle");
    dom.mobileSheetSummary = document.getElementById("mobile-sheet-summary");
    dom.mobileSheetAction = document.getElementById("mobile-sheet-action");

    dom.pickIndicatorDot = document.getElementById("pick-indicator-dot");
    dom.mapPickHint = document.getElementById("map-pick-hint");
    dom.targetButtons = Array.from(document.querySelectorAll("[data-pick-target]"));

    dom.routeForm = document.getElementById("route-form");
    dom.originInput = document.getElementById("origin-input");
    dom.destinationInput = document.getElementById("destination-input");
    dom.clearOriginBtn = document.getElementById("clear-origin-btn");
    dom.clearDestinationBtn = document.getElementById("clear-destination-btn");
    dom.originSuggestions = document.getElementById("origin-suggestions");
    dom.destinationSuggestions = document.getElementById("destination-suggestions");
    dom.swapPointsBtn = document.getElementById("swap-points-btn");
    dom.findRouteBtn = document.getElementById("find-route-btn");
    dom.formFeedback = document.getElementById("form-feedback");

    dom.emptyState = document.getElementById("route-empty-state");
    dom.loadingState = document.getElementById("route-loading-state");
    dom.errorState = document.getElementById("route-error-state");
    dom.errorTitle = document.getElementById("route-error-title");
    dom.errorDesc = document.getElementById("route-error-desc");
    dom.retryRouteBtn = document.getElementById("retry-route-btn");
    dom.resultCard = document.getElementById("route-result-card");

    dom.routeViaText = document.getElementById("route-summary-via");
    dom.routeArrivalPill = document.getElementById("route-arrival-pill");
    dom.metricDistance = document.getElementById("metric-distance");
    dom.metricDistanceUnit = document.getElementById("metric-distance-unit");
    dom.metricDuration = document.getElementById("metric-duration");
    dom.metricDurationUnit = document.getElementById("metric-duration-unit");
    dom.modesCountNote = document.getElementById("modes-count-note");
    dom.alternativesList = document.getElementById("route-alternatives-list");
    dom.toggleStepsBtn = document.getElementById("toggle-steps-btn");
    dom.stepsCount = document.getElementById("steps-count");
    dom.stepsList = document.getElementById("route-steps-list");

    dom.presetsGrid = document.getElementById("presets-grid");
    dom.presetsCountLabel = document.getElementById("presets-count-label");

    dom.locateMeBtn = document.getElementById("locate-me-btn");
    dom.fitRouteBtn = document.getElementById("fit-route-btn");
    dom.zoomInBtn = document.getElementById("zoom-in-btn");
    dom.zoomOutBtn = document.getElementById("zoom-out-btn");
    dom.toastBanner = document.getElementById("toast-banner");
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setStatus(mode, text) {
    dom.statusBadge.dataset.state = mode;
    dom.statusText.textContent = text;
  }

  function showToast(message) {
    dom.toastBanner.textContent = message;
    dom.toastBanner.hidden = false;
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      dom.toastBanner.hidden = true;
    }, 3200);
  }

  function formatCoords(lat, lng) {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  function formatDistanceParts(meters) {
    if (meters < 1000) {
      return { value: String(Math.round(meters)), unit: "m" };
    }
    const km = meters / 1000;
    return { value: km >= 100 ? km.toFixed(0) : km.toFixed(1), unit: "km" };
  }

  function formatDurationParts(seconds) {
    const totalMinutes = Math.max(1, Math.round(seconds / 60));
    if (totalMinutes < 60) {
      return { value: String(totalMinutes), unit: "mnt" };
    }
    const hours = Math.floor(totalMinutes / 60);
    const rem = totalMinutes % 60;
    return { value: rem > 0 ? `${hours}j ${rem}` : `${hours}`, unit: rem > 0 ? "mnt" : "jam" };
  }

  function formatCompactDuration(seconds) {
    const parts = formatDurationParts(seconds);
    return `${parts.value} ${parts.unit}`;
  }

  function formatCompactDistance(meters) {
    const parts = formatDistanceParts(meters);
    return `${parts.value} ${parts.unit}`;
  }

  function formatArrivalClock(seconds) {
    const eta = new Date(Date.now() + seconds * 1000);
    const hh = String(eta.getHours()).padStart(2, "0");
    const mm = String(eta.getMinutes()).padStart(2, "0");
    return `Tiba ~${hh}:${mm}`;
  }

  function translateManeuver(step) {
    const type = step.maneuver?.type || "";
    const mod = step.maneuver?.modifier || "";
    const road = step.name ? ` ke ${step.name}` : "";

    const modMap = {
      left: "kiri",
      right: "kanan",
      "slight left": "serong kiri",
      "slight right": "serong kanan",
      "sharp left": "tajam ke kiri",
      "sharp right": "tajam ke kanan",
      straight: "lurus",
      uturn: "putar balik"
    };
    const dir = modMap[mod] || "";

    if (type === "depart") {
      return step.name ? `Mulai perjalanan melalui ${step.name}` : "Mulai perjalanan dari titik awal";
    }
    if (type === "arrive") {
      return "Tiba di titik tujuan";
    }
    if (type === "roundabout" || type === "rotary") {
      const exit = step.maneuver?.exit ? ` ambil keluar ke-${step.maneuver.exit}` : "";
      return `Masuk bundaran${exit}${road}`;
    }
    if (type === "merge") {
      return `Bergabung${dir ? ` ke ${dir}` : ""}${road}`;
    }
    if (type === "fork") {
      return `Ambil jalur ${dir || "lurus"} di percabangan${road}`;
    }
    if (type === "turn" || type === "end of road" || type === "new name") {
      if (dir === "putar balik") {
        return `Putar balik${road}`;
      }
      if (dir === "lurus") {
        return `Lanjutkan lurus${road}`;
      }
      return dir ? `Belok ${dir}${road}` : `Lanjutkan${road}`;
    }
    return step.name ? `Ikuti ${step.name}` : "Lanjutkan mengikuti jalur";
  }

  function createPinIcon(slot) {
    const isOrigin = slot === "origin";
    const label = isOrigin ? "A" : "B";
    const modifierClass = isOrigin ? "pin-marker-origin" : "pin-marker-destination";
    return L.divIcon({
      className: "custom-pin-wrapper",
      html: `<div class="pin-marker ${modifierClass} pin-marker-enter" aria-hidden="true">${label}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  }

  function initMap() {
    if (typeof window.L === "undefined") {
      dom.mapFallback.hidden = false;
      setStatus("error", "Peta Tidak Tersedia");
      return;
    }

    map = L.map(dom.mapEl, {
      center: JAKARTA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true
    });

    // Humanitarian OpenStreetMap tiles work cleanly over both file:// and http(s):// without API keys
    const primaryTiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">HOT</a>',
        subdomains: "abc",
        maxZoom: 19
      }
    );

    let fallbackActive = false;
    let tileErrors = 0;

    primaryTiles.on("tileerror", () => {
      if (!navigator.onLine) {
        setStatus("error", "Koneksi Terputus");
        return;
      }
      tileErrors += 1;
      if (!fallbackActive && tileErrors >= 3) {
        fallbackActive = true;
        map.removeLayer(primaryTiles);
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri, OpenStreetMap contributors",
            maxZoom: 19
          }
        ).addTo(map);
      }
    });

    primaryTiles.addTo(map);

    presetLayerGroup = L.layerGroup().addTo(map);
    routeLayerGroup = L.layerGroup().addTo(map);

    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      handleMapClick(lat, lng);
    });

    renderPresetMarkers();
  }

  function getFitBoundsPadding() {
    const headerHeight = dom.sidebar && document.querySelector(".floating-header")
      ? document.querySelector(".floating-header").offsetHeight + 28
      : 108;

    if (isMobileViewport()) {
      const bottomOffset = state.mobileSheetState === "minimized" ? 110 : Math.round(window.innerHeight * 0.45);
      return {
        paddingTopLeft: [28, headerHeight],
        paddingBottomRight: [64, bottomOffset]
      };
    }

    const leftOffset = state.sidebarCollapsed ? 48 : (dom.sidebar.offsetWidth || 400) + 48;
    return {
      paddingTopLeft: [leftOffset, headerHeight],
      paddingBottomRight: [80, 48]
    };
  }

  function fitMapToBounds(bounds) {
    if (!map || !bounds || !bounds.isValid()) return;
    const { paddingTopLeft, paddingBottomRight } = getFitBoundsPadding();
    map.fitBounds(bounds, {
      paddingTopLeft,
      paddingBottomRight,
      maxZoom: 16,
      animate: !prefersReducedMotion(),
      duration: 0.65
    });
  }

  function setPickTarget(slot) {
    state.pickTarget = slot;
    dom.pickIndicatorDot.dataset.target = slot;
    dom.mapPickHint.innerHTML = slot === "origin"
      ? "Klik peta akan mengisi <strong>Titik Awal</strong>"
      : "Klik peta akan mengisi <strong>Titik Tujuan</strong>";

    dom.targetButtons.forEach((btn) => {
      const active = btn.dataset.pickTarget === slot;
      btn.classList.toggle("is-targeted", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function updateControlsState() {
    const hasOrigin = Boolean(state.origin);
    const hasDestination = Boolean(state.destination);
    const hasAnyPoint = hasOrigin || hasDestination;

    dom.clearOriginBtn.hidden = !dom.originInput.value.trim() && !hasOrigin;
    dom.clearDestinationBtn.hidden = !dom.destinationInput.value.trim() && !hasDestination;
    dom.resetRouteBtn.disabled = !hasAnyPoint && !dom.originInput.value.trim() && !dom.destinationInput.value.trim();
    dom.swapPointsBtn.disabled = !(hasOrigin && hasDestination);
    dom.fitRouteBtn.disabled = !(hasOrigin && hasDestination) && state.routes.length === 0;

    if (state.routes.length > 0) {
      const active = state.routes[state.selectedRouteIndex];
      dom.mobileSheetSummary.textContent = `${formatCompactDistance(active.distance)} · ${formatCompactDuration(active.duration)}`;
    } else if (hasOrigin && !hasDestination) {
      dom.mobileSheetSummary.textContent = `Awal: ${state.origin.label}`;
    } else if (!hasOrigin && hasDestination) {
      dom.mobileSheetSummary.textContent = `Tujuan: ${state.destination.label}`;
    } else {
      dom.mobileSheetSummary.textContent = "Cari Rute & Lokasi Populer";
    }
  }

  function setSlotMarker(slot, point) {
    if (!map) return;
    const isOrigin = slot === "origin";
    const existing = isOrigin ? originMarker : destinationMarker;

    if (existing) {
      map.removeLayer(existing);
    }

    if (!point) {
      if (isOrigin) originMarker = null;
      else destinationMarker = null;
      return;
    }

    const marker = L.marker([point.lat, point.lng], {
      icon: createPinIcon(slot),
      draggable: true,
      zIndexOffset: isOrigin ? 400 : 450
    }).addTo(map);

    marker.bindTooltip(
      `${isOrigin ? "Titik Awal" : "Titik Tujuan"}: ${point.label}`,
      { direction: "top", offset: [0, -18] }
    );

    marker.on("dragend", async () => {
      const pos = marker.getLatLng();
      await assignPointFromCoordinates(slot, pos.lat, pos.lng, { skipPan: true });
    });

    if (isOrigin) originMarker = marker;
    else destinationMarker = marker;
  }

  function clearFormFeedback() {
    dom.formFeedback.hidden = true;
    dom.formFeedback.textContent = "";
  }

  function showFormFeedback(message) {
    dom.formFeedback.textContent = message;
    dom.formFeedback.hidden = false;
  }

  function setPoint(slot, point, options = {}) {
    clearFormFeedback();
    state[slot] = point;

    const input = slot === "origin" ? dom.originInput : dom.destinationInput;
    input.value = point ? point.label : "";
    closeSuggestions(slot);

    setSlotMarker(slot, point);
    renderPresetsGrid();
    updateControlsState();

    if (point && !options.skipAutoAdvance) {
      if (slot === "origin" && !state.destination) {
        setPickTarget("destination");
      } else if (slot === "destination" && !state.origin) {
        setPickTarget("origin");
      }
    }

    if (state.origin && state.destination) {
      calculateRoute();
    } else {
      clearRouteDisplay();
      if (point && !options.skipPan && map) {
        map.panTo([point.lat, point.lng], { animate: !prefersReducedMotion() });
      }
    }
  }

  async function reverseGeocode(lat, lng) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 7000);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=17&accept-language=id`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.name) return data.name;
      if (data.address) {
        const road = data.address.road || data.address.suburb || data.address.neighbourhood;
        const city = data.address.city_district || data.address.city || data.address.town;
        if (road && city) return `${road}, ${city}`;
        if (road) return road;
      }
      if (data.display_name) {
        return data.display_name.split(",").slice(0, 2).join(", ").trim();
      }
      return formatCoords(lat, lng);
    } catch {
      return formatCoords(lat, lng);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function assignPointFromCoordinates(slot, lat, lng, options = {}) {
    const tempLabel = formatCoords(lat, lng);
    setPoint(slot, { lat, lng, label: tempLabel, presetId: null }, { skipPan: options.skipPan });
    setStatus("busy", "Membaca Alamat...");

    const resolvedName = await reverseGeocode(lat, lng);
    if (state[slot] && Math.abs(state[slot].lat - lat) < 1e-6 && Math.abs(state[slot].lng - lng) < 1e-6) {
      state[slot].label = resolvedName;
      const input = slot === "origin" ? dom.originInput : dom.destinationInput;
      input.value = resolvedName;
      const marker = slot === "origin" ? originMarker : destinationMarker;
      if (marker) {
        marker.setTooltipContent(`${slot === "origin" ? "Titik Awal" : "Titik Tujuan"}: ${resolvedName}`);
      }
      updateControlsState();
    }

    if (!state.routeAbortController) {
      setStatus("online", "OpenStreetMap Aktif");
    }
  }

  function handleMapClick(lat, lng) {
    const targetSlot = state.pickTarget;
    showToast(`${targetSlot === "origin" ? "Titik Awal" : "Titik Tujuan"} ditetapkan dari peta`);
    assignPointFromCoordinates(targetSlot, lat, lng, { skipPan: true });
  }

  // Nominatim real-time autocomplete search
  function closeSuggestions(slot) {
    const list = slot === "origin" ? dom.originSuggestions : dom.destinationSuggestions;
    const input = slot === "origin" ? dom.originInput : dom.destinationInput;
    list.hidden = true;
    list.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    state.searchResults[slot] = [];
    state.highlightedIndex[slot] = -1;
  }

  function renderSuggestionsLoading(slot) {
    const list = slot === "origin" ? dom.originSuggestions : dom.destinationSuggestions;
    const input = slot === "origin" ? dom.originInput : dom.destinationInput;
    list.innerHTML = `<li class="suggestion-status" role="status">Mencari lokasi di OpenStreetMap...</li>`;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function renderSuggestionsMessage(slot, message, isError = false) {
    const list = slot === "origin" ? dom.originSuggestions : dom.destinationSuggestions;
    const input = slot === "origin" ? dom.originInput : dom.destinationInput;
    list.innerHTML = `<li class="suggestion-status${isError ? " is-error" : ""}">${message}</li>`;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function renderSuggestionsList(slot, items) {
    const list = slot === "origin" ? dom.originSuggestions : dom.destinationSuggestions;
    const input = slot === "origin" ? dom.originInput : dom.destinationInput;
    state.searchResults[slot] = items;
    state.highlightedIndex[slot] = -1;

    if (items.length === 0) {
      renderSuggestionsMessage(slot, "Lokasi tidak ditemukan. Coba kata kunci lain atau klik langsung di peta.");
      return;
    }

    list.innerHTML = "";
    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.setAttribute("role", "presentation");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestion-item-btn";
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", "false");
      btn.dataset.index = String(index);

      const mainSpan = document.createElement("span");
      mainSpan.className = "suggestion-main";
      mainSpan.textContent = item.shortLabel;

      const subSpan = document.createElement("span");
      subSpan.className = "suggestion-sub";
      subSpan.textContent = item.fullAddress;

      btn.append(mainSpan, subSpan);
      btn.addEventListener("click", () => {
        setPoint(slot, {
          lat: item.lat,
          lng: item.lng,
          label: item.shortLabel,
          presetId: null
        });
      });

      li.appendChild(btn);
      list.appendChild(li);
    });

    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  async function searchNominatim(slot, query) {
    if (state.searchAbortControllers[slot]) {
      state.searchAbortControllers[slot].abort();
    }

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      closeSuggestions(slot);
      return;
    }

    renderSuggestionsLoading(slot);
    setStatus("busy", "Mencari Lokasi...");

    const controller = new AbortController();
    state.searchAbortControllers[slot] = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 9000);

    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
        countrycodes: "id",
        "accept-language": "id",
        q: trimmed
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawResults = await response.json();
      const mapped = rawResults.map((entry) => {
        const parts = (entry.display_name || "").split(",").map((s) => s.trim()).filter(Boolean);
        const shortLabel = entry.name || parts[0] || trimmed;
        const fullAddress = parts.slice(1, 4).join(", ") || entry.display_name || "";
        return {
          lat: parseFloat(entry.lat),
          lng: parseFloat(entry.lon),
          shortLabel,
          fullAddress
        };
      });

      renderSuggestionsList(slot, mapped);
      setStatus("online", "OpenStreetMap Aktif");
    } catch (err) {
      if (err.name === "AbortError") return;
      renderSuggestionsMessage(
        slot,
        "Gagal mengambil saran alamat dari Nominatim. Anda tetap dapat memilih lokasi langsung di peta.",
        true
      );
      setStatus("error", "Pencarian Terkendala");
    } finally {
      window.clearTimeout(timeoutId);
      if (state.searchAbortControllers[slot] === controller) {
        state.searchAbortControllers[slot] = null;
      }
    }
  }

  function updateSuggestionHighlight(slot, nextIndex) {
    const list = slot === "origin" ? dom.originSuggestions : dom.destinationSuggestions;
    const buttons = Array.from(list.querySelectorAll(".suggestion-item-btn"));
    if (buttons.length === 0) return;

    const bounded = (nextIndex + buttons.length) % buttons.length;
    state.highlightedIndex[slot] = bounded;

    buttons.forEach((btn, idx) => {
      const selected = idx === bounded;
      btn.classList.toggle("is-highlighted", selected);
      btn.setAttribute("aria-selected", String(selected));
      if (selected) {
        btn.scrollIntoView({ block: "nearest" });
      }
    });
  }

  // OSRM Routing & Polyline Visualization
  function showResultPanelState(panelState) {
    dom.emptyState.hidden = panelState !== "empty";
    dom.loadingState.hidden = panelState !== "loading";
    dom.errorState.hidden = panelState !== "error";
    dom.resultCard.hidden = panelState !== "success";
  }

  function clearRouteDisplay() {
    if (state.routeAbortController) {
      state.routeAbortController.abort();
      state.routeAbortController = null;
    }
    state.routes = [];
    state.selectedRouteIndex = 0;
    if (routeLayerGroup) {
      routeLayerGroup.clearLayers();
    }
    showResultPanelState("empty");
    updateControlsState();
  }

  async function calculateRoute() {
    if (!state.origin || !state.destination) {
      showFormFeedback("Tentukan Titik Awal dan Titik Tujuan terlebih dahulu.");
      return;
    }

    if (state.routeAbortController) {
      state.routeAbortController.abort();
    }

    const controller = new AbortController();
    state.routeAbortController = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    clearFormFeedback();
    showResultPanelState("loading");
    setStatus("busy", "Menghitung Rute...");

    const coords = `${state.origin.lng},${state.origin.lat};${state.destination.lng},${state.destination.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true&steps=true`;

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Server OSRM mengembalikan kode ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
        throw new Error("Jalur darat tidak ditemukan antara dua titik tersebut.");
      }

      // Sort by fastest duration so index 0 is always the fastest route
      state.routes = data.routes.slice().sort((a, b) => a.duration - b.duration);
      state.selectedRouteIndex = 0;

      renderRouteSelection();
      setStatus("online", "OpenStreetMap Aktif");
    } catch (err) {
      if (err.name === "AbortError") return;
      if (routeLayerGroup) routeLayerGroup.clearLayers();
      state.routes = [];
      dom.errorTitle.textContent = "Rute tidak dapat dihitung";
      dom.errorDesc.textContent = err.message || "Gagal menghubungi layanan OSRM. Periksa koneksi internet lalu coba lagi.";
      showResultPanelState("error");
      setStatus("error", "Layanan Rute Gagal");
      updateControlsState();
    } finally {
      window.clearTimeout(timeoutId);
      if (state.routeAbortController === controller) {
        state.routeAbortController = null;
      }
    }
  }

  function drawRoutePolylines() {
    if (!map || !routeLayerGroup) return;
    routeLayerGroup.clearLayers();

    let activeBounds = null;

    // Draw alternative routes underneath first
    state.routes.forEach((route, idx) => {
      if (idx === state.selectedRouteIndex) return;
      const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const altLine = L.polyline(latLngs, {
        color: "#64748b",
        weight: 5,
        opacity: 0.55,
        dashArray: "8 8",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(routeLayerGroup);

      altLine.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        selectRoute(idx);
      });
    });

    // Draw selected primary route as two-layer polyline (halo + solid core)
    const primary = state.routes[state.selectedRouteIndex];
    if (primary) {
      const latLngs = primary.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      L.polyline(latLngs, {
        color: "#2563eb",
        weight: 12,
        opacity: 0.22,
        lineCap: "round",
        lineJoin: "round",
        interactive: false
      }).addTo(routeLayerGroup);

      const coreLine = L.polyline(latLngs, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.96,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(routeLayerGroup);

      activeBounds = coreLine.getBounds();
    }

    if (activeBounds && activeBounds.isValid()) {
      fitMapToBounds(activeBounds);
    }
  }

  function renderRouteSelection() {
    const activeRoute = state.routes[state.selectedRouteIndex];
    if (!activeRoute) return;

    const dist = formatDistanceParts(activeRoute.distance);
    const dur = formatDurationParts(activeRoute.duration);
    const viaSummary = activeRoute.legs?.[0]?.summary || "Jalan utama terdekat";

    dom.metricDistance.textContent = dist.value;
    dom.metricDistanceUnit.textContent = dist.unit;
    dom.metricDuration.textContent = dur.value;
    dom.metricDurationUnit.textContent = dur.unit;
    dom.routeViaText.textContent = `Melalui ${viaSummary}`;
    dom.routeArrivalPill.textContent = formatArrivalClock(activeRoute.duration);

    dom.modesCountNote.textContent = state.routes.length > 1
      ? `${state.routes.length} opsi jalur ditemukan`
      : "1 jalur utama tersedia";

    dom.alternativesList.innerHTML = "";
    state.routes.forEach((route, idx) => {
      const isSelected = idx === state.selectedRouteIndex;
      const via = route.legs?.[0]?.summary || `Jalur ${idx + 1}`;
      const label = idx === 0 ? "Rute Tercepat" : `Alternatif ${idx}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `alt-route-btn${isSelected ? " is-selected" : ""}`;
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(isSelected));

      const left = document.createElement("span");
      left.className = "alt-route-left";

      const nameEl = document.createElement("span");
      nameEl.className = "alt-route-name";
      nameEl.textContent = label;

      const viaEl = document.createElement("span");
      viaEl.className = "alt-route-via";
      viaEl.textContent = `via ${via}`;

      left.append(nameEl, viaEl);

      const meta = document.createElement("span");
      meta.className = "alt-route-meta";
      meta.textContent = `${formatCompactDistance(route.distance)} · ${formatCompactDuration(route.duration)}`;

      btn.append(left, meta);
      btn.addEventListener("click", () => selectRoute(idx));
      dom.alternativesList.appendChild(btn);
    });

    // Populate turn-by-turn steps
    const steps = activeRoute.legs?.[0]?.steps || [];
    dom.stepsCount.textContent = String(steps.length);
    dom.stepsList.innerHTML = "";
    steps.forEach((step) => {
      const li = document.createElement("li");
      li.className = "step-row";

      const textSpan = document.createElement("span");
      textSpan.className = "step-instruction";
      textSpan.textContent = translateManeuver(step);

      const distSpan = document.createElement("span");
      distSpan.className = "step-dist";
      distSpan.textContent = step.distance > 0 ? formatCompactDistance(step.distance) : "Tiba";

      li.append(textSpan, distSpan);
      dom.stepsList.appendChild(li);
    });

    dom.toggleStepsBtn.setAttribute("aria-expanded", "false");
    dom.stepsList.hidden = true;

    showResultPanelState("success");
    drawRoutePolylines();
    updateControlsState();
  }

  function selectRoute(index) {
    if (index < 0 || index >= state.routes.length) return;
    state.selectedRouteIndex = index;
    renderRouteSelection();
  }

  // Preset Directory Cards & Map Markers
  function getFilteredPresets() {
    if (state.activeCategory === "all") return PRESET_LOCATIONS;
    return PRESET_LOCATIONS.filter((loc) => loc.category === state.activeCategory);
  }

  function renderPresetMarkers() {
    if (!map || !presetLayerGroup) return;
    presetLayerGroup.clearLayers();

    const filtered = getFilteredPresets();
    filtered.forEach((loc) => {
      const icon = L.divIcon({
        className: "custom-pin-wrapper",
        html: `<div class="preset-dot-marker" aria-hidden="true"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(presetLayerGroup);

      const popupContainer = document.createElement("div");
      popupContainer.innerHTML = `
        <span class="popup-cat">${loc.categoryLabel}</span>
        <p class="popup-title">${loc.name}</p>
        <p class="popup-area">${loc.area}</p>
        <div class="popup-actions">
          <button type="button" class="popup-btn popup-btn-origin">Set Awal</button>
          <button type="button" class="popup-btn popup-btn-dest">Set Tujuan</button>
        </div>
      `;

      const originBtn = popupContainer.querySelector(".popup-btn-origin");
      const destBtn = popupContainer.querySelector(".popup-btn-dest");

      originBtn.addEventListener("click", () => {
        marker.closePopup();
        setPoint("origin", { lat: loc.lat, lng: loc.lng, label: loc.name, presetId: loc.id });
      });

      destBtn.addEventListener("click", () => {
        marker.closePopup();
        setPoint("destination", { lat: loc.lat, lng: loc.lng, label: loc.name, presetId: loc.id });
      });

      marker.bindPopup(popupContainer, { closeButton: true });
    });
  }

  function renderPresetsGrid() {
    const filtered = getFilteredPresets();
    const catLabel = CATEGORY_NAMES[state.activeCategory] || "Semua";
    dom.presetsCountLabel.textContent = state.activeCategory === "all"
      ? `${filtered.length} lokasi`
      : `${filtered.length} lokasi · ${catLabel}`;

    dom.presetsGrid.innerHTML = "";

    filtered.forEach((loc) => {
      const isOrigin = state.origin?.presetId === loc.id;
      const isDest = state.destination?.presetId === loc.id;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-card";
      if (isOrigin) btn.classList.add("is-origin");
      if (isDest) btn.classList.add("is-destination");

      const topRow = document.createElement("span");
      topRow.className = "preset-card-top";

      const catTag = document.createElement("span");
      catTag.className = "preset-cat-tag";
      catTag.textContent = loc.categoryLabel;
      topRow.appendChild(catTag);

      if (isOrigin || isDest) {
        const badge = document.createElement("span");
        badge.className = `preset-role-badge ${isOrigin ? "role-origin" : "role-destination"}`;
        badge.textContent = isOrigin ? "Awal" : "Tujuan";
        topRow.appendChild(badge);
      }

      const nameEl = document.createElement("span");
      nameEl.className = "preset-name";
      nameEl.textContent = loc.shortName;

      const areaEl = document.createElement("span");
      areaEl.className = "preset-area";
      areaEl.textContent = loc.area;

      btn.append(topRow, nameEl, areaEl);

      btn.addEventListener("click", () => {
        let slot = state.pickTarget;
        if (!state.origin) {
          slot = "origin";
        } else if (!state.destination && state.origin.presetId !== loc.id) {
          slot = "destination";
        }
        setPoint(slot, {
          lat: loc.lat,
          lng: loc.lng,
          label: loc.name,
          presetId: loc.id
        });
      });

      dom.presetsGrid.appendChild(btn);
    });
  }

  function selectCategory(category) {
    state.activeCategory = category;
    dom.categoryPills.forEach((pill) => {
      const active = pill.dataset.category === category;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-pressed", String(active));
    });

    renderPresetsGrid();
    renderPresetMarkers();

    if (map && state.routes.length === 0) {
      const filtered = getFilteredPresets();
      if (filtered.length > 0 && category !== "all") {
        const bounds = L.latLngBounds(filtered.map((loc) => [loc.lat, loc.lng]));
        fitMapToBounds(bounds);
      }
    }
  }

  function resetAll() {
    clearFormFeedback();
    state.origin = null;
    state.destination = null;
    dom.originInput.value = "";
    dom.destinationInput.value = "";
    closeSuggestions("origin");
    closeSuggestions("destination");

    setSlotMarker("origin", null);
    setSlotMarker("destination", null);
    clearRouteDisplay();
    setPickTarget("origin");
    renderPresetsGrid();
    updateControlsState();
    setStatus("online", "OpenStreetMap Aktif");

    if (map) {
      map.setView(JAKARTA_CENTER, DEFAULT_ZOOM, { animate: !prefersReducedMotion() });
    }
    showToast("Rute dan titik lokasi telah direset");
  }

  function setDesktopSidebarCollapsed(collapsed) {
    state.sidebarCollapsed = collapsed;
    dom.sidebar.classList.toggle("is-collapsed", collapsed);
    dom.collapseSidebarBtn.setAttribute("aria-expanded", String(!collapsed));
    dom.expandSidebarBtn.hidden = !collapsed;
    dom.expandSidebarBtn.setAttribute("aria-expanded", String(!collapsed));

    if (collapsed) {
      dom.expandSidebarBtn.focus();
    } else {
      dom.collapseSidebarBtn.focus();
    }
  }

  function setMobileSheetState(nextState) {
    state.mobileSheetState = nextState;
    dom.sidebar.dataset.sheetState = nextState;
    const expanded = nextState === "expanded";
    dom.mobileSheetToggle.setAttribute("aria-expanded", String(expanded));
    dom.mobileSheetAction.textContent = expanded ? "Kecilkan" : "Buka";
  }

  function locateUser() {
    if (!navigator.geolocation) {
      showToast("Browser Anda tidak mendukung fitur geolokasi.");
      return;
    }

    setStatus("busy", "Mendeteksi Lokasi...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        assignPointFromCoordinates("origin", latitude, longitude);
        if (map) {
          map.setView([latitude, longitude], 15, { animate: !prefersReducedMotion() });
        }
        showToast("Lokasi Anda ditetapkan sebagai Titik Awal");
      },
      () => {
        setStatus("online", "OpenStreetMap Aktif");
        showToast("Izin lokasi ditolak atau tidak tersedia.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function bindInputEvents(slot) {
    const input = slot === "origin" ? dom.originInput : dom.destinationInput;
    const clearBtn = slot === "origin" ? dom.clearOriginBtn : dom.clearDestinationBtn;

    input.addEventListener("focus", () => {
      setPickTarget(slot);
      if (isMobileViewport() && state.mobileSheetState === "minimized") {
        setMobileSheetState("expanded");
      }
      // Keep focused field visible above mobile on-screen keyboard
      window.setTimeout(() => {
        input.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      }, 120);
    });

    input.addEventListener("input", () => {
      clearFormFeedback();
      // Typing invalidates previously locked coordinates until user picks a suggestion
      if (state[slot] && state[slot].label !== input.value) {
        state[slot] = null;
        setSlotMarker(slot, null);
        clearRouteDisplay();
        renderPresetsGrid();
      }
      updateControlsState();

      window.clearTimeout(state.searchTimers[slot]);
      const query = input.value;
      if (query.trim().length < 3) {
        closeSuggestions(slot);
        return;
      }

      state.searchTimers[slot] = window.setTimeout(() => {
        searchNominatim(slot, query);
      }, 380);
    });

    input.addEventListener("keydown", (event) => {
      const results = state.searchResults[slot];
      if (event.key === "ArrowDown" && results.length > 0) {
        event.preventDefault();
        updateSuggestionHighlight(slot, state.highlightedIndex[slot] + 1);
      } else if (event.key === "ArrowUp" && results.length > 0) {
        event.preventDefault();
        updateSuggestionHighlight(slot, state.highlightedIndex[slot] - 1);
      } else if (event.key === "Enter" && results.length > 0 && state.highlightedIndex[slot] >= 0) {
        event.preventDefault();
        const picked = results[state.highlightedIndex[slot]];
        setPoint(slot, {
          lat: picked.lat,
          lng: picked.lng,
          label: picked.shortLabel,
          presetId: null
        });
      } else if (event.key === "Escape") {
        closeSuggestions(slot);
      }
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      setPoint(slot, null, { skipAutoAdvance: true });
      setPickTarget(slot);
      input.focus();
    });
  }

  function bindEvents() {
    dom.reloadMapBtn.addEventListener("click", () => window.location.reload());

    dom.categoryPills.forEach((pill) => {
      pill.addEventListener("click", () => selectCategory(pill.dataset.category));
    });

    dom.resetRouteBtn.addEventListener("click", resetAll);

    dom.collapseSidebarBtn.addEventListener("click", () => setDesktopSidebarCollapsed(true));
    dom.expandSidebarBtn.addEventListener("click", () => setDesktopSidebarCollapsed(false));

    dom.mobileSheetToggle.addEventListener("click", () => {
      setMobileSheetState(state.mobileSheetState === "expanded" ? "minimized" : "expanded");
    });

    dom.targetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setPickTarget(btn.dataset.pickTarget);
        showToast(
          btn.dataset.pickTarget === "origin"
            ? "Silakan klik lokasi pada peta untuk Titik Awal"
            : "Silakan klik lokasi pada peta untuk Titik Tujuan"
        );
      });
    });

    bindInputEvents("origin");
    bindInputEvents("destination");

    dom.swapPointsBtn.addEventListener("click", () => {
      if (!state.origin || !state.destination) return;
      const oldOrigin = state.origin;
      const oldDest = state.destination;
      state.origin = oldDest;
      state.destination = oldOrigin;
      dom.originInput.value = state.origin.label;
      dom.destinationInput.value = state.destination.label;
      setSlotMarker("origin", state.origin);
      setSlotMarker("destination", state.destination);
      renderPresetsGrid();
      updateControlsState();
      calculateRoute();
    });

    dom.routeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormFeedback();

      if (!state.origin && dom.originInput.value.trim().length >= 3) {
        if (state.searchResults.origin.length > 0) {
          const first = state.searchResults.origin[0];
          setPoint("origin", { lat: first.lat, lng: first.lng, label: first.shortLabel, presetId: null }, { skipAutoAdvance: true });
        } else {
          showFormFeedback("Pilih salah satu saran alamat untuk Titik Awal, atau klik langsung di peta.");
          return;
        }
      }

      if (!state.destination && dom.destinationInput.value.trim().length >= 3) {
        if (state.searchResults.destination.length > 0) {
          const first = state.searchResults.destination[0];
          setPoint("destination", { lat: first.lat, lng: first.lng, label: first.shortLabel, presetId: null }, { skipAutoAdvance: true });
        } else {
          showFormFeedback("Pilih salah satu saran alamat untuk Titik Tujuan, atau klik langsung di peta.");
          return;
        }
      }

      if (!state.origin || !state.destination) {
        showFormFeedback("Lengkapi Titik Awal dan Titik Tujuan terlebih dahulu untuk menghitung rute.");
        return;
      }

      calculateRoute();
    });

    dom.retryRouteBtn.addEventListener("click", () => {
      if (state.origin && state.destination) {
        calculateRoute();
      }
    });

    dom.toggleStepsBtn.addEventListener("click", () => {
      const expanded = dom.toggleStepsBtn.getAttribute("aria-expanded") === "true";
      dom.toggleStepsBtn.setAttribute("aria-expanded", String(!expanded));
      dom.stepsList.hidden = expanded;
    });

    dom.locateMeBtn.addEventListener("click", locateUser);

    dom.fitRouteBtn.addEventListener("click", () => {
      if (!map) return;
      if (state.routes.length > 0) {
        const primary = state.routes[state.selectedRouteIndex];
        const bounds = L.latLngBounds(primary.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        fitMapToBounds(bounds);
      } else if (state.origin && state.destination) {
        fitMapToBounds(L.latLngBounds([[state.origin.lat, state.origin.lng], [state.destination.lat, state.destination.lng]]));
      }
    });

    dom.zoomInBtn.addEventListener("click", () => map && map.zoomIn());
    dom.zoomOutBtn.addEventListener("click", () => map && map.zoomOut());

    document.addEventListener("click", (event) => {
      if (!event.target.closest('[data-slot="origin"]')) {
        closeSuggestions("origin");
      }
      if (!event.target.closest('[data-slot="destination"]')) {
        closeSuggestions("destination");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSuggestions("origin");
        closeSuggestions("destination");
        if (isMobileViewport() && state.mobileSheetState === "expanded") {
          setMobileSheetState("minimized");
        }
      }
    });

    window.addEventListener("online", () => setStatus("online", "OpenStreetMap Aktif"));
    window.addEventListener("offline", () => setStatus("error", "Koneksi Terputus"));

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!map) return;
        map.invalidateSize();
        if (state.routes.length > 0) {
          const primary = state.routes[state.selectedRouteIndex];
          const bounds = L.latLngBounds(primary.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
          fitMapToBounds(bounds);
        }
      }, 180);
    });
  }

  function bootstrap() {
    cacheDom();
    bindEvents();
    renderPresetsGrid();
    setPickTarget("origin");
    updateControlsState();
    initMap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
