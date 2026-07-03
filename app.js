(function () {
  const data = window.TRAVEL_GUIDE_DATA;
  const TOC_PAGE_SIZE = 3;
  const START_POINT = {
    name: "포항 양덕 하우스토리",
    address: "경북 포항시 북구 천마로72번길 11",
    lat: 36.083684,
    lng: 129.398185
  };
  const VEHICLE_ROUTE_ORDER = [
    { id: "uiseong-bingsansaji", distanceKm: 97.2, durationMin: 87 },
    { id: "chilgok-songnimsa", distanceKm: 58.5, durationMin: 56 },
    { id: "gumi-jukjangri-pagoda", distanceKm: 45.2, durationMin: 39 },
    { id: "hapcheon-yeongamsaji", distanceKm: 109.4, durationMin: 98 },
    { id: "tongyeong-sebyeonggwan", distanceKm: 122.2, durationMin: 102 },
    { id: "suncheon-national-garden", distanceKm: 121.6, durationMin: 100 },
    { id: "suncheon-seonamsa", distanceKm: 30, durationMin: 34 },
    { id: "suncheon-songgwangsa", distanceKm: 32.7, durationMin: 41 },
    { id: "gwangju-base", distanceKm: 75.1, durationMin: 66 },
    { id: "gangjin-wolnamsaji", distanceKm: 61.4, durationMin: 58 },
    { id: "haenam-mihwangsa", distanceKm: 56.5, durationMin: 52 },
    { id: "bogildo-yunseondo", distanceKm: 38.2, durationMin: 243 },
    { id: "gochang-seonunsa", distanceKm: 203.9, durationMin: 365 },
    { id: "buan-naesosa", distanceKm: 35.7, durationMin: 40 },
    { id: "iksan-wanggungri", distanceKm: 78.7, durationMin: 75 },
    { id: "iksan-mireuksaji", distanceKm: 7.7, durationMin: 11 },
    { id: "nonsan-gwanchoksa", distanceKm: 34.9, durationMin: 38 },
    { id: "buyeo-jeongnimsaji", distanceKm: 23.1, durationMin: 25 },
    { id: "buyeo-daejosa", distanceKm: 7.9, durationMin: 14 },
    { id: "buyeo-janghari", distanceKm: 10.5, durationMin: 16 },
    { id: "buyeo-muryangsa", distanceKm: 27.4, durationMin: 34 },
    { id: "seocheon-seongbukri", distanceKm: 32.7, durationMin: 40 },
    { id: "cheongyang-seojeongri", distanceKm: 53.4, durationMin: 54 },
    { id: "asan-hyeonchungsa", distanceKm: 52.4, durationMin: 52 },
    { id: "mmca-cheongju", distanceKm: 54.1, durationMin: 54 },
    { id: "cheongnamdae", distanceKm: 28.7, durationMin: 42 },
    { id: "chungju-mireukdaewon", distanceKm: 90.6, durationMin: 104 },
    { id: "jecheon-hanbyeokru", distanceKm: 42, durationMin: 51 },
    { id: "wonju-geodonsaji", distanceKm: 65.5, durationMin: 69 },
    { id: "wonju-beopcheonsaji", distanceKm: 7.4, durationMin: 10 },
    { id: "wonju-heungbeopsaji", distanceKm: 21.3, durationMin: 28 },
    { id: "hanam-dongsaji", distanceKm: 77.4, durationMin: 68 },
    { id: "guri-geonwolleung", distanceKm: 14.3, durationMin: 17 },
    { id: "seoul-taereung", distanceKm: 7.6, durationMin: 11 },
    { id: "bukhansan-seunggasa", distanceKm: 16.7, durationMin: 21 },
    { id: "goyang-huireung", distanceKm: 8.6, durationMin: 13 },
    { id: "pyeongchang-woljeongsa", distanceKm: 196.9, durationMin: 167 },
    { id: "bonghwa-cheongamjeong", distanceKm: 148.6, durationMin: 152 },
    { id: "andong-jebiwon", distanceKm: 40.8, durationMin: 43 },
    { id: "yecheon-gaesimsaji", distanceKm: 29.1, durationMin: 26 }
  ];
  const routeOrderBySightId = new Map(
    VEHICLE_ROUTE_ORDER.map((leg, index) => [leg.id, index + 1])
  );
  const originalIndexById = new Map(data.items.map((item, index) => [item.id, index]));
  const routeSightItems = VEHICLE_ROUTE_ORDER
    .map((leg) => data.items.find((item) => item.id === leg.id))
    .filter(Boolean);
  const routeAwareOrder = buildRouteAwareOrder();
  const state = {
    activeTypes: ["sight"],
    activeRegion: "전체",
    activeTocType: "sight",
    activeAllListType: "sight",
    focusedId: null,
    tocPageByType: {}
  };

  const markerLabelByType = {
    stay: "숙",
    food: "식",
    cafe: "카"
  };

  const elements = {
    tabBar: document.getElementById("tabBar"),
    regionScroller: document.getElementById("regionScroller"),
    cards: document.getElementById("cards"),
    tocTabs: document.getElementById("tocTabs"),
    tocList: document.getElementById("tocList"),
    carouselMeta: document.getElementById("carouselMeta"),
    prevTocButton: document.getElementById("prevTocButton"),
    nextTocButton: document.getElementById("nextTocButton"),
    prevCardButton: document.getElementById("prevCardButton"),
    nextCardButton: document.getElementById("nextCardButton"),
    visibleCount: document.getElementById("visibleCount"),
    visibleLabel: document.getElementById("visibleLabel"),
    fitAllButton: document.getElementById("fitAllButton"),
    routeOrderButton: document.getElementById("routeOrderButton"),
    allSightsPanel: document.getElementById("allSightsPanel"),
    allSightsTabs: document.getElementById("allSightsTabs"),
    allSightsTitle: document.getElementById("allSightsTitle"),
    allSightsList: document.getElementById("allSightsList"),
    closeAllSightsButton: document.getElementById("closeAllSightsButton"),
    routePanel: document.getElementById("routePanel"),
    routeList: document.getElementById("routeList"),
    closeRouteButton: document.getElementById("closeRouteButton")
  };

  const map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: true,
    tap: true
  }).setView([36.35, 127.85], 6);

  L.control.zoom({ position: "bottomleft" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let clusterLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 42,
    spiderfyDistanceMultiplier: 1.4,
    iconCreateFunction: createClusterIcon
  });
  map.addLayer(clusterLayer);

  const markerById = new Map();
  let visibleItemsCache = [];
  let scrollFrame = 0;
  let ignoreScrollSyncUntil = 0;

  function init() {
    renderTabs();
    render();
    elements.fitAllButton.addEventListener("click", openAllSightsPanel);
    elements.routeOrderButton.addEventListener("click", openRoutePanel);
    elements.closeAllSightsButton.addEventListener("click", closeAllSightsPanel);
    elements.closeRouteButton.addEventListener("click", closeRoutePanel);
    elements.allSightsPanel.addEventListener("click", (event) => {
      if (event.target === elements.allSightsPanel) closeAllSightsPanel();
    });
    elements.routePanel.addEventListener("click", (event) => {
      if (event.target === elements.routePanel) closeRoutePanel();
    });
    elements.prevCardButton.addEventListener("click", () => moveCard(-1));
    elements.nextCardButton.addEventListener("click", () => moveCard(1));
    elements.prevTocButton.addEventListener("click", () => moveTocPage(-1));
    elements.nextTocButton.addEventListener("click", () => moveTocPage(1));
    elements.cards.addEventListener("scroll", () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(syncCarouselFromScroll);
    }, { passive: true });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.allSightsPanel.hidden) {
        closeAllSightsPanel();
      }
      if (event.key === "Escape" && !elements.routePanel.hidden) {
        closeRoutePanel();
      }
    });
    window.addEventListener("resize", () => {
      map.invalidateSize();
      fitVisibleItems(false);
      updateCardListHeight();
      scrollActiveCard(false);
    });
  }

  function renderTabs() {
    elements.tabBar.innerHTML = "";
    data.tabs.forEach((tab) => {
      const isActive = state.activeTypes.includes(tab.id);
      const isOnlyActive = isActive && state.activeTypes.length === 1;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tab-button ${tab.id}`;
      button.textContent = `${tab.label} ${countByType(tab.id)}`;
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute(
        "aria-label",
        `${tab.label} 표시 ${isOnlyActive ? "중" : isActive ? "끄기" : "켜기"}`
      );
      if (isActive) button.classList.add("is-active");
      button.addEventListener("click", () => {
        toggleType(tab.id);
        state.focusedId = null;
        render();
      });
      elements.tabBar.appendChild(button);
    });
  }

  function toggleType(type) {
    if (state.activeTypes.includes(type)) {
      if (state.activeTypes.length === 1) return;
      state.activeTypes = state.activeTypes.filter((activeType) => activeType !== type);
      return;
    }

    state.activeTypes = data.tabs
      .map((tab) => tab.id)
      .filter((tabType) => tabType === type || state.activeTypes.includes(tabType));
  }

  function renderRegions(itemsForType) {
    const available = new Set(itemsForType.map((item) => item.regionGroup));
    const regions = data.regionOrder.filter((region) => region === "전체" || available.has(region));
    elements.regionScroller.innerHTML = "";

    regions.forEach((region) => {
      const count = region === "전체"
        ? itemsForType.length
        : itemsForType.filter((item) => item.regionGroup === region).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "region-button";
      button.textContent = `${region} ${count}`;
      button.setAttribute("aria-pressed", String(region === state.activeRegion));
      if (region === state.activeRegion) button.classList.add("is-active");
      button.addEventListener("click", () => {
        state.activeRegion = region;
        state.focusedId = null;
        render();
      });
      elements.regionScroller.appendChild(button);
    });
  }

  function render() {
    const itemsForTypes = getItemsForSelectedTypes();
    if (
      state.activeRegion !== "전체" &&
      !itemsForTypes.some((item) => item.regionGroup === state.activeRegion)
    ) {
      state.activeRegion = "전체";
    }
    const visibleItems = filterVisible(itemsForTypes);
    syncActiveTocType(visibleItems);
    visibleItemsCache = visibleItems;
    state.focusedId = getTocItems(visibleItems)[0]?.id || visibleItems[0]?.id || null;

    elements.visibleCount.textContent = `${visibleItems.length}곳`;
    elements.visibleLabel.textContent = state.activeRegion === "전체"
      ? `${selectedTypeLabel()} 전체`
      : `${state.activeRegion} ${selectedTypeLabel()}`;

    renderTabs();
    renderRegions(itemsForTypes);
    renderMarkers(visibleItems);
    renderTocTabs(visibleItems);
    renderToc(visibleItems);
    renderCards(visibleItems);
    updateCarouselState();
    fitVisibleItems();
    requestAnimationFrame(() => scrollActiveCard(false));
  }

  function filterVisible(items) {
    if (state.activeRegion === "전체") return items;
    return items.filter((item) => item.regionGroup === state.activeRegion);
  }

  function getItemsForSelectedTypes() {
    return data.items
      .filter((item) => state.activeTypes.includes(item.type))
      .sort(compareDisplayItems);
  }

  function syncActiveTocType(items) {
    const availableTypes = new Set(items.map((item) => item.type));
    if (availableTypes.has(state.activeTocType)) return;

    state.activeTocType = data.tabs.find((tab) => availableTypes.has(tab.id))?.id || data.tabs[0].id;
  }

  function renderMarkers(items) {
    clusterLayer.clearLayers();
    markerById.clear();

    items.forEach((item) => {
      const markerLabel = getMarkerLabel(item);
      const marker = L.marker([item.lat, item.lng], {
        guideType: item.type,
        icon: L.divIcon({
          className: "",
          html: `<div class="guide-marker ${item.type}">${escapeHtml(markerLabel)}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -18]
        })
      });

      marker.bindPopup(
        `<p class="popup-title">${escapeHtml(getNumberedName(item))}</p><p class="popup-region">${escapeHtml(item.region)}</p>`
      );
      marker.on("click", () => focusItem(item.id, true));
      clusterLayer.addLayer(marker);
      markerById.set(item.id, marker);
    });
  }

  function createClusterIcon(cluster) {
    const childMarkers = cluster.getAllChildMarkers();
    const childTypes = [...new Set(childMarkers.map((marker) => marker.options.guideType))];
    const clusterType = childTypes.length === 1 ? childTypes[0] : "mixed";

    return L.divIcon({
      className: "",
      html: `<div class="guide-cluster ${clusterType}">${cluster.getChildCount()}</div>`,
      iconSize: [46, 46],
      iconAnchor: [23, 23]
    });
  }

  function renderTocTabs(items) {
    elements.tocTabs.innerHTML = "";

    data.tabs.forEach((tab) => {
      const count = items.filter((item) => item.type === tab.id).length;
      const isActive = tab.id === state.activeTocType && count > 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `toc-tab-button ${tab.id}`;
      button.textContent = `${tab.label} ${count}`;
      button.disabled = count === 0;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(isActive));
      if (isActive) button.classList.add("is-active");
      button.addEventListener("click", () => {
        if (count === 0) return;
        state.activeTocType = tab.id;
        setTocPage(0);
        renderTocTabs(visibleItemsCache);
        renderToc(visibleItemsCache);
        const firstItem = getTocItems(visibleItemsCache)[0];
        if (firstItem) {
          setActiveCard(firstItem.id, { scrollCard: true, focusMap: true, preservePageScroll: true });
        }
      });
      elements.tocTabs.appendChild(button);
    });
  }

  function renderToc(items) {
    const tocItems = getTocItems(items);
    elements.tocList.innerHTML = "";

    if (tocItems.length === 0) {
      elements.carouselMeta.textContent = "0 / 0";
      elements.prevTocButton.disabled = true;
      elements.nextTocButton.disabled = true;
      return;
    }

    const { page, pageCount } = clampTocPage(tocItems);
    const start = page * TOC_PAGE_SIZE;
    const end = Math.min(start + TOC_PAGE_SIZE, tocItems.length);

    elements.carouselMeta.textContent = `${start + 1}-${end} / ${tocItems.length}`;
    elements.prevTocButton.disabled = page <= 0;
    elements.nextTocButton.disabled = page >= pageCount - 1;

    tocItems.slice(start, end).forEach((item, offset) => {
      const index = start + offset;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "toc-button";
      button.dataset.tocId = item.id;
      button.textContent = `${getListNumber(item, index)}. ${item.name}`;
      button.setAttribute("aria-pressed", String(item.id === state.focusedId));
      if (item.id === state.focusedId) button.classList.add("is-active");
      button.addEventListener("click", () => {
        setActiveCard(item.id, { scrollCard: true, focusMap: true, preservePageScroll: true });
      });
      elements.tocList.appendChild(button);
    });
  }

  function getTocItems(items) {
    return items.filter((item) => item.type === state.activeTocType);
  }

  function getTocPage() {
    return state.tocPageByType[state.activeTocType] || 0;
  }

  function setTocPage(page) {
    state.tocPageByType[state.activeTocType] = page;
  }

  function clampTocPage(tocItems) {
    const pageCount = Math.max(1, Math.ceil(tocItems.length / TOC_PAGE_SIZE));
    const page = Math.min(pageCount - 1, Math.max(0, getTocPage()));
    setTocPage(page);
    return { page, pageCount };
  }

  function moveTocPage(direction) {
    const tocItems = getTocItems(visibleItemsCache);
    if (!tocItems.length) return;

    const { page, pageCount } = clampTocPage(tocItems);
    const nextPage = Math.min(pageCount - 1, Math.max(0, page + direction));
    if (nextPage === page) return;

    setTocPage(nextPage);
    renderToc(visibleItemsCache);
  }

  function syncTocPageToFocusedItem(tocItems) {
    const focusedIndex = tocItems.findIndex((item) => item.id === state.focusedId);
    if (focusedIndex < 0) return;
    setTocPage(Math.floor(focusedIndex / TOC_PAGE_SIZE));
  }

  function renderCards(items) {
    elements.cards.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "이 지역에 등록된 후보가 아직 없습니다.";
      elements.cards.appendChild(empty);
      elements.cards.style.height = "";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "place-card";
      card.id = `card-${item.id}`;
      if (item.id === state.focusedId) card.classList.add("is-focused");

      const nearbyHtml = item.nearbySights?.length
        ? `<div class="nearby">
            <p class="nearby-title">근처에 더 가볼 만한 곳</p>
            <div class="chips">${item.nearbySights.map((nearby) => `<span class="chip">${escapeHtml(nearby)}</span>`).join("")}</div>
          </div>`
        : "";

      const selectionHtml = item.selectionReason
        ? `<p class="selection">${escapeHtml(item.selectionReason)}</p>`
        : "";

      const photoHtml = item.photo?.url
        ? `<figure class="photo-frame">
            <img src="${escapeHtml(item.photo.url)}" alt="${escapeHtml(item.photo.alt || item.name)}" loading="lazy">
            <figcaption>${escapeHtml(item.photo.credit || "대표사진")}</figcaption>
          </figure>`
        : "";

      const infoHtml = `
        <div class="info-grid">
          <div class="info-box">
            <p class="info-title">운영시간</p>
            ${renderHoursInfo(item)}
          </div>
          <div class="info-box">
            <p class="info-title">주차장</p>
            ${renderParkingInfo(item)}
            ${renderParkingFees(item)}
          </div>
        </div>
      `;

      const naverUrl = makeNaverMapUrl(item);
      const notesHtml = item.notes?.length
        ? `<div class="notes">
            <p class="notes-title">메모</p>
            <ul class="note-list">${item.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
          </div>`
        : "";
      const itemNumber = getItemOrderNumber(item);
      const itemNumberHtml = itemNumber
        ? `<span class="place-number ${item.type}">#${itemNumber}</span>`
        : "";

      card.innerHTML = `
        <div class="card-top">
          <div>
            <h2>${itemNumberHtml}${escapeHtml(item.name)}</h2>
            <p class="region">${escapeHtml(item.region)}</p>
          </div>
          <span class="type-pill ${item.type}">${escapeHtml(getTypePillText(item))}</span>
        </div>
        ${photoHtml}
        <p class="description">${escapeHtml(item.description)}</p>
        ${selectionHtml}
        ${infoHtml}
        ${nearbyHtml}
        ${notesHtml}
        <div class="card-actions">
          <button class="focus-button" type="button" data-focus-id="${escapeHtml(item.id)}">지도에서 위치 보기</button>
          <a class="naver-button" href="${escapeHtml(naverUrl)}" target="_blank" rel="noopener">네이버지도에서 영업시간·주차 확인</a>
        </div>
        <p class="static-meta">조사일 ${escapeHtml(item.researchedAt)} · 정적 후보 데이터 · 방문 전 네이버지도 재확인 권장</p>
      `;

      elements.cards.appendChild(card);
    });

    elements.cards.querySelectorAll("[data-focus-id]").forEach((button) => {
      button.addEventListener("click", () => focusItem(button.dataset.focusId, false));
    });

    elements.cards.querySelectorAll("img").forEach((image) => {
      if (image.complete) return;
      image.addEventListener("load", updateCardListHeight, { once: true });
    });
  }

  function renderHoursInfo(item) {
    if (hasNoHoursInfo(item)) {
      return "<p>정보없음</p>";
    }

    if (item.weeklyHours?.length) {
      const rowsHtml = item.weeklyHours.map((entry) => `
        <div class="hours-row">
          <span class="hours-day">${escapeHtml(entry.day || entry.label)}</span>
          <span class="hours-time">${escapeHtml(entry.hours)}</span>
        </div>
      `).join("");
      const usefulNotes = (item.hoursNotes || []).filter((note) => !isNoInfoText(note));
      const notesHtml = usefulNotes.length
        ? `<ul class="hours-notes">${usefulNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`
        : "";

      return `
        <div class="hours-list">${rowsHtml}</div>
        ${notesHtml}
      `;
    }

    return `<p>${escapeHtml(item.operatingHours)}</p>`;
  }

  function renderParkingInfo(item) {
    return `<p>${escapeHtml(getParkingInfoText(item))}</p>`;
  }

  function renderParkingFees(item) {
    if (!item.parkingFees?.length) return "";
    const rowsHtml = item.parkingFees.map((entry) => `
      <div class="parking-fee-row">
        <span class="parking-fee-label">${escapeHtml(entry.label)}</span>
        <strong>${escapeHtml(entry.price)}</strong>
      </div>
    `).join("");

    return `
      <div class="parking-fee-list">${rowsHtml}</div>
    `;
  }

  function openAllSightsPanel() {
    renderAllSightsPanel();
    elements.allSightsPanel.hidden = false;
    document.body.classList.add("is-panel-open");
    elements.closeAllSightsButton.focus({ preventScroll: true });
  }

  function closeAllSightsPanel() {
    elements.allSightsPanel.hidden = true;
    document.body.classList.remove("is-panel-open");
    elements.fitAllButton.focus({ preventScroll: true });
  }

  function renderAllSightsPanel() {
    renderAllSightsTabs();
    renderAllSightsList();
  }

  function renderAllSightsTabs() {
    elements.allSightsTabs.innerHTML = "";

    data.tabs.forEach((tab) => {
      const isActive = tab.id === state.activeAllListType;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `all-sights-tab-button ${tab.id}`;
      button.textContent = `${tab.label} ${countByType(tab.id)}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(isActive));
      if (isActive) button.classList.add("is-active");
      button.addEventListener("click", () => {
        state.activeAllListType = tab.id;
        renderAllSightsPanel();
        elements.allSightsList.scrollTo({ top: 0, behavior: "auto" });
      });
      elements.allSightsTabs.appendChild(button);
    });
  }

  function renderAllSightsList() {
    const activeTab = data.tabs.find((tab) => tab.id === state.activeAllListType) || data.tabs[0];
    const items = data.items
      .filter((item) => item.type === activeTab.id)
      .sort(compareDisplayItems);
    elements.allSightsTitle.textContent = `전체 ${activeTab.label} ${items.length}곳`;
    elements.allSightsList.innerHTML = `
      <div class="all-sights-column-header" aria-hidden="true">
        <span>장소</span>
        <span>운영시간</span>
        <span>주차</span>
      </div>
      ${items.map((item, index) => `
      <article class="all-sight-row">
        <div class="all-sight-name">
          <span class="all-sight-index ${item.type}">${getListNumber(item, index)}</span>
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.region)}</p>
          </div>
        </div>
        <div class="all-sight-field all-sight-hours">
          ${escapeHtml(getCompactHoursText(item))}
        </div>
        <div class="all-sight-field all-sight-parking">
          ${escapeHtml(getParkingAvailabilityText(item))}
        </div>
      </article>
      `).join("")}
    `;
  }

  function openRoutePanel() {
    renderRoutePanel();
    elements.routePanel.hidden = false;
    document.body.classList.add("is-panel-open");
    elements.closeRouteButton.focus({ preventScroll: true });
  }

  function closeRoutePanel() {
    elements.routePanel.hidden = true;
    document.body.classList.remove("is-panel-open");
    elements.routeOrderButton.focus({ preventScroll: true });
  }

  function renderRoutePanel() {
    const itemById = new Map(data.items.map((item) => [item.id, item]));
    const routeRows = VEHICLE_ROUTE_ORDER
      .map((leg, index) => ({
        ...leg,
        order: index + 1,
        item: itemById.get(leg.id),
        fromName: index === 0 ? START_POINT.name : itemById.get(VEHICLE_ROUTE_ORDER[index - 1].id)?.name
      }))
      .filter((row) => row.item);

    elements.routeList.innerHTML = `
      <div class="route-summary">
        <strong>출발지</strong>
        <span>${escapeHtml(START_POINT.address)}</span>
        <small>차량 경로거리 기준입니다. 시작은 의성-칠곡-구미-합천-통영으로 고정하고, 이후에는 현재 위치에서 남은 후보 중 가까운 곳을 이어 붙인 순서입니다.</small>
      </div>
      ${routeRows.map(({ item, order, fromName, distanceKm, durationMin }) => `
        <article class="route-row">
          <div class="route-rank">${order}</div>
          <div class="route-main">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.region)}</p>
            <span class="route-leg">${escapeHtml(fromName)}에서 출발</span>
          </div>
          <div class="route-metrics">
            <strong class="route-distance">${formatDistanceKm(distanceKm)}</strong>
            <span class="route-duration">${formatDuration(durationMin)}</span>
          </div>
          <div class="all-sight-field route-field">
            <span class="all-sight-label">운영시간</span>
            <span>${escapeHtml(getCompactHoursText(item))}</span>
          </div>
          <div class="all-sight-field route-field">
            <span class="all-sight-label">주차</span>
            <span>${escapeHtml(getParkingAvailabilityText(item))}</span>
          </div>
        </article>
      `).join("")}
    `;
  }

  function formatDistanceKm(distanceKm) {
    if (distanceKm < 10) return `${distanceKm.toFixed(1)}km`;
    return `${Math.round(distanceKm)}km`;
  }

  function formatDuration(durationMin) {
    if (durationMin < 60) return `${durationMin}분`;
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    return minutes ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }

  function getCompactHoursText(item) {
    if (hasNoHoursInfo(item)) {
      return "정보없음";
    }

    if (item.weeklyHours?.length) {
      return summarizeWeeklyHours(item.weeklyHours);
    }

    return cleanSummaryText(item.operatingHours);
  }

  function hasNoHoursInfo(item) {
    if (item.weeklyHours?.length) {
      return item.weeklyHours.every((entry) => isNoInfoText(entry.hours));
    }

    return isNoInfoText(item.operatingHours);
  }

  function isNoInfoText(value) {
    if (!value) return true;
    return /정보\s*없음|정보는 표시되지 않습니다|별도 확인 필요/.test(String(value));
  }

  function summarizeWeeklyHours(weeklyHours) {
    if (weeklyHours.length === 1) {
      const entry = weeklyHours[0];
      return `${entry.day || entry.label} ${entry.hours}`;
    }

    const hoursSet = new Set(weeklyHours.map((entry) => entry.hours));
    if (weeklyHours.length >= 7 && hoursSet.size === 1) {
      return `매일 ${weeklyHours[0].hours}`;
    }

    const hasRegularHoliday = weeklyHours.find((entry) => /휴무/.test(entry.hours));
    const regularRows = weeklyHours.filter((entry) => !/휴무/.test(entry.hours));
    const regularHoursSet = new Set(regularRows.map((entry) => entry.hours));

    if (hasRegularHoliday && regularRows.length > 0 && regularRows.length <= 2) {
      const openDays = regularRows
        .map((entry) => `${entry.day || entry.label} ${entry.hours}`)
        .join(" · ");
      return `${openDays} · 그 외 휴무`;
    }

    if (hasRegularHoliday && regularRows.length && regularHoursSet.size === 1) {
      return `${hasRegularHoliday.day || hasRegularHoliday.label} 휴무 · 그 외 ${regularRows[0].hours}`;
    }

    return weeklyHours
      .slice(0, 2)
      .map((entry) => `${entry.day || entry.label} ${entry.hours}`)
      .join(" · ") + (weeklyHours.length > 2 ? " 외" : "");
  }

  function getParkingAvailabilityText(item) {
    return getParkingInfoText(item);
  }

  function getParkingInfoText(item) {
    const parkingInfo = item.parkingInfo || "";

    if (item.parkingFees?.length) return "주차 가능 · 요금 있음";
    if (!parkingInfo) return "정보없음";
    if (/정보\s*없음|별도 확인 필요|주차 가능 여부를 확인/.test(parkingInfo)) return "정보없음";
    if (/전용 또는 인근 주차장 이용을 전제로|전용 또는 인근 주차 가능성을 기준|차량 이동 중 쉬어가기|호텔\/리조트 주차 가능 여부/.test(parkingInfo)) return "정보없음";
    if (/공식 안내 기준 무료|최초 2시간 무료|무료/.test(parkingInfo)) return "주차 가능 · 무료";
    if (/주차 표시 있음|주차 가능|주차장|인근 주차/.test(parkingInfo)) return "주차 가능";

    return cleanSummaryText(parkingInfo);
  }

  function cleanSummaryText(value) {
    const text = String(value)
      .replace(/^네이버지도 확인\(2026-07-02\):\s*/, "")
      .trim();

    if (/주간 관람을 권장/.test(text)) return "주간 관람 권장 · 변동 가능";
    if (/숙소 체크인\/체크아웃/.test(text)) return "체크인/체크아웃 예약 시 확인";
    if (/영업시간·브레이크타임/.test(text)) return "영업시간·브레이크타임 확인";
    if (/영업시간·마지막 주문/.test(text)) return "영업시간·라스트오더 확인";
    if (/사전예약|입장 시간/.test(text)) return "사전예약·입장 시간 확인";
    if (/조선왕릉 관람 시간/.test(text)) return "조선왕릉 계절별 시간 · 월요일 휴관 확인";
    if (/공식 홈페이지|공식 안내/.test(text)) return "공식 안내 확인";

    return text
      .replace(/방문 전.*$/, "확인 필요")
      .replace(/확인하세요\.?$/, "확인 필요")
      .replace(/\s+/g, " ")
      .trim();
  }

  function focusItem(id, scrollCard) {
    setActiveCard(id, { scrollCard, focusMap: true });
  }

  function setActiveCard(id, options = {}) {
    const item = data.items.find((entry) => entry.id === id);
    if (!item) return;
    const restorePageScroll = createPageScrollRestorer(options.preservePageScroll);

    state.focusedId = id;
    updateCarouselState();

    if (options.focusMap) {
      map.setView([item.lat, item.lng], Math.max(map.getZoom(), 11), { animate: true });
      const marker = markerById.get(id);
      if (marker) {
        clusterLayer.zoomToShowLayer(marker, () => marker.openPopup());
      }
    }

    if (options.scrollCard) {
      scrollActiveCard(true, options.preservePageScroll);
    }
    updateCardListHeight();
    restorePageScroll();
  }

  function scrollActiveCard(smooth = true, preservePageScroll = false) {
    if (!state.focusedId) return;
    const card = document.getElementById(`card-${state.focusedId}`);
    if (!card) return;
    const pageX = window.scrollX;
    const pageY = window.scrollY;
    ignoreScrollSyncUntil = Date.now() + 900;
    const firstCard = elements.cards.querySelector(".place-card");
    const left = card.offsetLeft - (firstCard?.offsetLeft || 0);
    elements.cards.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    if (preservePageScroll) {
      requestAnimationFrame(() => window.scrollTo(pageX, pageY));
    }
  }

  function updateCardListHeight() {
    const card = document.getElementById(`card-${state.focusedId}`);
    if (!card) {
      elements.cards.style.height = "";
      return;
    }

    const styles = window.getComputedStyle(elements.cards);
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;
    elements.cards.style.height = `${Math.ceil(card.offsetHeight + paddingTop + paddingBottom)}px`;
  }

  function createPageScrollRestorer(shouldRestore) {
    if (!shouldRestore) return () => {};
    const pageX = window.scrollX;
    const pageY = window.scrollY;
    return () => {
      requestAnimationFrame(() => window.scrollTo(pageX, pageY));
      setTimeout(() => window.scrollTo(pageX, pageY), 80);
      setTimeout(() => window.scrollTo(pageX, pageY), 220);
    };
  }

  function moveCard(direction) {
    if (visibleItemsCache.length === 0) return;
    const currentIndex = Math.max(0, visibleItemsCache.findIndex((item) => item.id === state.focusedId));
    const nextIndex = Math.min(visibleItemsCache.length - 1, Math.max(0, currentIndex + direction));
    const nextItem = visibleItemsCache[nextIndex];
    if (nextItem) setActiveCard(nextItem.id, { scrollCard: true, focusMap: true, preservePageScroll: true });
  }

  function syncCarouselFromScroll() {
    if (Date.now() < ignoreScrollSyncUntil) return;
    if (!visibleItemsCache.length) return;
    const containerLeft = elements.cards.getBoundingClientRect().left;
    let nearest = null;
    let nearestDistance = Infinity;

    visibleItemsCache.forEach((item) => {
      const card = document.getElementById(`card-${item.id}`);
      if (!card) return;
      const distance = Math.abs(card.getBoundingClientRect().left - containerLeft - 16);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = item;
      }
    });

    if (nearest && nearest.id !== state.focusedId) {
      state.focusedId = nearest.id;
      updateCarouselState();
    }
  }

  function updateCarouselState() {
    const currentIndex = visibleItemsCache.findIndex((item) => item.id === state.focusedId);
    const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
    const focusedItem = visibleItemsCache[currentIndex];

    if (focusedItem && focusedItem.type !== state.activeTocType) {
      state.activeTocType = focusedItem.type;
      renderTocTabs(visibleItemsCache);
    }

    const tocItems = getTocItems(visibleItemsCache);
    syncTocPageToFocusedItem(tocItems);
    renderToc(visibleItemsCache);

    elements.prevCardButton.disabled = displayIndex <= 1;
    elements.nextCardButton.disabled = displayIndex === 0 || displayIndex >= visibleItemsCache.length;

    document.querySelectorAll(".place-card").forEach((card) => {
      card.classList.toggle("is-focused", card.id === `card-${state.focusedId}`);
    });

    document.querySelectorAll(".toc-button").forEach((button) => {
      const isActive = button.dataset.tocId === state.focusedId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    requestAnimationFrame(updateCardListHeight);
  }

  function fitVisibleItems(animate = true) {
    const items = filterVisible(getItemsForSelectedTypes());
    if (!items.length) return;
    const bounds = L.latLngBounds(items.map((item) => [item.lat, item.lng]));
    map.fitBounds(bounds, {
      animate,
      paddingTopLeft: [22, 22],
      paddingBottomRight: [22, 74],
      maxZoom: state.activeRegion === "전체" ? 8 : 12
    });
  }

  function countByType(type) {
    return data.items.filter((item) => item.type === type).length;
  }

  function selectedTypeLabel() {
    return data.tabs
      .filter((tab) => state.activeTypes.includes(tab.id))
      .map((tab) => tab.label)
      .join("·");
  }

  function compareDisplayItems(a, b) {
    const anchorDiff = getRouteAnchorOrder(a) - getRouteAnchorOrder(b);
    if (anchorDiff !== 0) return anchorDiff;

    if (a.type === b.type) {
      return getItemOrderNumber(a) - getItemOrderNumber(b);
    }

    const typeDiff = getTypeSortIndex(a.type) - getTypeSortIndex(b.type);
    if (typeDiff !== 0) return typeDiff;

    return getItemOrderNumber(a) - getItemOrderNumber(b);
  }

  function getSightOrderNumber(item) {
    if (item.type !== "sight") return null;
    return routeOrderBySightId.get(item.id) || null;
  }

  function getMarkerLabel(item) {
    return getItemOrderNumber(item) || markerLabelByType[item.type] || typeLabel(item.type);
  }

  function getListNumber(item, fallbackIndex) {
    return getItemOrderNumber(item) || fallbackIndex + 1;
  }

  function getNumberedName(item) {
    const number = getItemOrderNumber(item);
    return number ? `${number}. ${item.name}` : item.name;
  }

  function getTypePillText(item) {
    const number = getItemOrderNumber(item);
    return number ? `${typeLabel(item.type)} ${number}` : typeLabel(item.type);
  }

  function getItemOrderNumber(item) {
    return routeAwareOrder.numberById.get(item.id) || null;
  }

  function getRouteAnchorOrder(item) {
    return routeAwareOrder.anchorById.get(item.id)?.order || Number.MAX_SAFE_INTEGER;
  }

  function getTypeSortIndex(type) {
    return data.tabs.findIndex((tab) => tab.id === type);
  }

  function buildRouteAwareOrder() {
    const numberById = new Map();
    const anchorById = new Map();

    data.tabs.forEach((tab) => {
      data.items
        .filter((item) => item.type === tab.id)
        .map((item) => ({
          item,
          anchor: getNearestRouteSight(item)
        }))
        .sort((a, b) => {
          const anchorDiff = a.anchor.order - b.anchor.order;
          if (anchorDiff !== 0) return anchorDiff;

          const distanceDiff = a.anchor.distanceKm - b.anchor.distanceKm;
          if (distanceDiff !== 0) return distanceDiff;

          return (originalIndexById.get(a.item.id) || 0) - (originalIndexById.get(b.item.id) || 0);
        })
        .forEach(({ item, anchor }, index) => {
          numberById.set(item.id, index + 1);
          anchorById.set(item.id, anchor);
        });
    });

    return { numberById, anchorById };
  }

  function getNearestRouteSight(item) {
    const ownSightOrder = getSightOrderNumber(item);
    if (ownSightOrder) {
      return { order: ownSightOrder, distanceKm: 0 };
    }

    return routeSightItems.reduce((nearest, sight) => {
      const distanceKm = getDistanceKm(item, sight);
      const order = getSightOrderNumber(sight) || Number.MAX_SAFE_INTEGER;
      if (!nearest || distanceKm < nearest.distanceKm) {
        return { order, distanceKm };
      }
      return nearest;
    }, null) || { order: Number.MAX_SAFE_INTEGER, distanceKm: Number.MAX_SAFE_INTEGER };
  }

  function getDistanceKm(from, to) {
    const radiusKm = 6371;
    const lat1 = toRadians(from.lat);
    const lat2 = toRadians(to.lat);
    const deltaLat = toRadians(to.lat - from.lat);
    const deltaLng = toRadians(to.lng - from.lng);
    const a = Math.sin(deltaLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function typeLabel(type) {
    return data.tabs.find((tab) => tab.id === type)?.label || type;
  }

  function makeNaverMapUrl(item) {
    if (item.naverUrl) return item.naverUrl;
    const query = item.naverQuery || getNaverSearchName(item.name);
    return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
  }

  function getNaverSearchName(name) {
    return [
      /\s+[가-힣]+\s+탑비$/,
      /\s+마애여래좌상$/,
      /\s+석불입상$/,
      /\s+석조(?:관음\/)?미륵보살입상$/,
      /\s+미륵보살입상$/,
      /\s+오층전탑$/,
      /\s+팔각구층석탑$/,
      /\s+(?:오층|삼층|구층)석탑$/
    ].reduce((result, pattern) => result.replace(pattern, ""), name).trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
