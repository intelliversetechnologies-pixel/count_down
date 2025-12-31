const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const targetEl = document.getElementById("target");
const localEl = document.getElementById("local");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const panelMaxBtn = document.getElementById("panel-max-btn");
const displayBtn = document.getElementById("display-btn");
const panelDisplayBtn = document.getElementById("panel-display-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const settingsClose = document.getElementById("settings-close");
const durationInput = document.getElementById("duration-input");
const dateInput = document.getElementById("date-input");
const timeInput = document.getElementById("time-input");
const showMetaInput = document.getElementById("show-meta-input");
const applySettingsBtn = document.getElementById("apply-settings");
const resetSettingsBtn = document.getElementById("reset-settings");
const metaSection = document.querySelector(".meta");

const DEFAULT_DURATION_MINUTES = 60;
const TIME_ZONE = "Africa/Lagos";
const STORAGE_KEY = "rccg-crossover-settings";
const FORMAT_OPTIONS = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: TIME_ZONE
};

const TIME_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: TIME_ZONE
};

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

function getTimeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
    Number(lookup.second)
  );

  return asUtc - date.getTime();
}

function makeTimeInZone(year, monthIndex, day, hour, minute, second, timeZone) {
  const utcGuess = new Date(Date.UTC(year, monthIndex, day, hour, minute, second));
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset);
}

function getNowInZoneParts() {
  const now = new Date();
  const nowParts = partsFormatter.formatToParts(now);
  return Object.fromEntries(nowParts.map(({ type, value }) => [type, value]));
}

function getNextNewYearInZone() {
  const lookup = getNowInZoneParts();
  const year = Number(lookup.year) + 1;
  return makeTimeInZone(year, 0, 1, 0, 0, 0, TIME_ZONE);
}

function getDefaultTarget() {
  return getNextNewYearInZone();
}

function parseDateInput(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, monthIndex: month - 1, day };
}

function parseTimeInput(value) {
  if (!value) return null;
  const [hour, minute, second = "0"] = value.split(":");
  return {
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second)
  };
}

function getSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      durationMinutes: DEFAULT_DURATION_MINUTES,
      showMeta: true,
      target: null
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      durationMinutes: Number(parsed.durationMinutes) || DEFAULT_DURATION_MINUTES,
      showMeta: parsed.showMeta !== false,
      target: parsed.target ?? null
    };
  } catch {
    return {
      durationMinutes: DEFAULT_DURATION_MINUTES,
      showMeta: true,
      target: null
    };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function getTargetDate(settings) {
  if (settings.target) {
    return makeTimeInZone(
      settings.target.year,
      settings.target.monthIndex,
      settings.target.day,
      settings.target.hour,
      settings.target.minute,
      settings.target.second ?? 0,
      TIME_ZONE
    );
  }
  return getDefaultTarget();
}

function applyMetaVisibility(showMeta) {
  if (!metaSection) return;
  metaSection.style.display = showMeta ? "" : "none";
}

function formatTimeParts(totalMs) {
  const clamped = Math.max(0, totalMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  };
}

function formatDateTime(date) {
  return date.toLocaleString("en-NG", FORMAT_OPTIONS);
}

function formatClockTime(date) {
  return date.toLocaleTimeString("en-NG", TIME_OPTIONS);
}

function setDisplayMode(isDisplayMode) {
  document.body.classList.toggle("display-mode", isDisplayMode);
  const label = isDisplayMode ? "Exit Display" : "Display Mode";
  if (displayBtn) displayBtn.textContent = label;
  if (panelDisplayBtn) panelDisplayBtn.textContent = label;
}

function setFullscreenMode(isFullscreen) {
  document.body.classList.toggle("fullscreen", isFullscreen);
  if (fullscreenBtn) {
    fullscreenBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Maximize Clock";
  }
  if (panelMaxBtn) {
    panelMaxBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Maximize Countdown";
  }
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        setFullscreenMode(!document.body.classList.contains("fullscreen"));
      }
    } else {
      await document.exitFullscreen();
    }
  });
}

if (panelMaxBtn) {
  panelMaxBtn.addEventListener("click", async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        setFullscreenMode(!document.body.classList.contains("fullscreen"));
      }
    } else {
      await document.exitFullscreen();
    }
  });
}

if (displayBtn) {
  displayBtn.addEventListener("click", () => {
    setDisplayMode(!document.body.classList.contains("display-mode"));
  });
}

if (panelDisplayBtn) {
  panelDisplayBtn.addEventListener("click", () => {
    setDisplayMode(!document.body.classList.contains("display-mode"));
  });
}

document.addEventListener("fullscreenchange", () => {
  setFullscreenMode(Boolean(document.fullscreenElement));
});

function openSettings() {
  if (!settingsPanel) return;
  settingsPanel.classList.add("open");
  settingsPanel.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  if (!settingsPanel) return;
  settingsPanel.classList.remove("open");
  settingsPanel.setAttribute("aria-hidden", "true");
}

function populateSettingsForm(settings) {
  if (!durationInput || !dateInput || !timeInput || !showMetaInput) return;
  durationInput.value = String(settings.durationMinutes);
  showMetaInput.checked = settings.showMeta;

  const targetDate = getTargetDate(settings);
  const parts = partsFormatter.formatToParts(targetDate);
  const lookup = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  dateInput.value = `${lookup.year}-${lookup.month}-${lookup.day}`;
  timeInput.value = `${lookup.hour}:${lookup.minute}:${lookup.second}`;
}

function readSettingsForm() {
  const durationMinutes = Math.max(1, Number(durationInput?.value || DEFAULT_DURATION_MINUTES));
  const dateParts = parseDateInput(dateInput?.value || "");
  const timeParts = parseTimeInput(timeInput?.value || "");

  let target = null;
  if (dateParts && timeParts) {
    target = {
      year: dateParts.year,
      monthIndex: dateParts.monthIndex,
      day: dateParts.day,
      hour: timeParts.hour,
      minute: timeParts.minute,
      second: timeParts.second
    };
  }

  return {
    durationMinutes,
    showMeta: Boolean(showMetaInput?.checked),
    target
  };
}

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    const settings = getSettings();
    populateSettingsForm(settings);
    openSettings();
  });
}

if (settingsClose) {
  settingsClose.addEventListener("click", closeSettings);
}

if (settingsPanel) {
  settingsPanel.addEventListener("click", (event) => {
    if (event.target === settingsPanel) {
      closeSettings();
    }
  });
}

if (applySettingsBtn) {
  applySettingsBtn.addEventListener("click", () => {
    const nextSettings = readSettingsForm();
    saveSettings(nextSettings);
    applyMetaVisibility(nextSettings.showMeta);
    closeSettings();
  });
}

if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener("click", () => {
    const defaults = {
      durationMinutes: DEFAULT_DURATION_MINUTES,
      showMeta: true,
      target: null
    };
    saveSettings(defaults);
    populateSettingsForm(defaults);
    applyMetaVisibility(defaults.showMeta);
  });
}

const hoursEl = document.getElementById("t-hours");
const minutesEl = document.getElementById("t-minutes");
const secondsEl = document.getElementById("t-seconds");

function updateCountdown() {
  const now = new Date();
  const settings = getSettings();
  const target = getTargetDate(settings);
  const remaining = target.getTime() - now.getTime();
  const durationMs = settings.durationMinutes * 60 * 1000;

  targetEl.textContent = formatDateTime(target);
  localEl.textContent = formatDateTime(now);
  applyMetaVisibility(settings.showMeta);

  // Helper to safely set text content if elements exist
  const setTime = (h, m, s) => {
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, "0");
  };

  if (remaining <= 0) {
    setTime(0, 0, 0);
    statusEl.textContent = "Happy New Year!";

    // Trigger Celebration
    const celebrationOverlay = document.getElementById('celebration-overlay');
    const celebrationVideo = document.getElementById('celebration-video');

    if (celebrationOverlay && !celebrationOverlay.classList.contains('active')) {
      celebrationOverlay.classList.add('active');
      celebrationOverlay.setAttribute('aria-hidden', 'false');
      if (celebrationVideo) {
        celebrationVideo.play().catch(e => console.log('Auto-play prevent:', e));
      }
    }
    return;
  }

  // Hide celebration if we reset (or time is back positive)
  const celebrationOverlay = document.getElementById('celebration-overlay');
  const celebrationVideo = document.getElementById('celebration-video');
  if (celebrationOverlay && celebrationOverlay.classList.contains('active') && remaining > 1000) {
    // Only hide if we aren't at 0 anymore (e.g. user reset clock)
    celebrationOverlay.classList.remove('active');
    celebrationOverlay.setAttribute('aria-hidden', 'true');
    if (celebrationVideo) {
      celebrationVideo.pause();
      celebrationVideo.currentTime = 0;
    }
  }

  if (remaining > durationMs) {
    const untilStart = remaining - durationMs;
    const startTime = new Date(target.getTime() - durationMs);
    const days = Math.floor(untilStart / (24 * 60 * 60 * 1000));
    const hours = Math.floor((untilStart % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((untilStart % (60 * 60 * 1000)) / (60 * 1000));

    // Show duration (e.g. 60:00:00) as static or countdown? 
    // Usually we show the full duration waiting.
    const durParts = formatTimeParts(durationMs);
    setTime(durParts.hours, durParts.minutes, durParts.seconds);

    statusEl.textContent = `Countdown starts at ${startTime.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE })}. Starts in ${days}d ${hours}h ${minutes}m.`;
    return;
  }

  const parts = formatTimeParts(remaining);
  setTime(parts.hours, parts.minutes, parts.seconds);
  statusEl.textContent = "Final hour to the crossover";
}

// Close Celebration Handler
const closeCelebrationBtn = document.getElementById('close-celebration-btn');
if (closeCelebrationBtn) {
  closeCelebrationBtn.addEventListener('click', () => {
    const overlay = document.getElementById('celebration-overlay');
    const video = document.getElementById('celebration-video');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (video) {
      video.pause();
    }
  });
}

const startNowBtn = document.getElementById("start-now-btn");

if (startNowBtn) {
  startNowBtn.addEventListener("click", () => {
    // 1. Determine "Now" and "Next Midnight" in the correct timezone
    const now = new Date();
    const nowParts = partsFormatter.formatToParts(now);
    const lookup = Object.fromEntries(nowParts.map(({ type, value }) => [type, value]));

    // Create date for "Tomorrow 00:00:00" based on current timezone time
    // JS Date.UTC handles overflow (e.g. Day + 1 at end of month correctly wraps)
    const nextMidnight = makeTimeInZone(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day) + 1,
      0, 0, 0,
      TIME_ZONE
    );

    // 2. Calculate remaining milliseconds
    const diffMs = nextMidnight.getTime() - now.getTime();

    // 3. Set duration to cover the entire remaining time so countdown starts immediately
    // Add a small buffer (e.g. 1 min) to ensure no "waiting" text flickers
    let neededDurationMins = Math.ceil(diffMs / 60000);
    if (neededDurationMins < 1) neededDurationMins = 1;

    // 4. Update Settings
    // Save target as the specific nextMidnight components
    const targetParts = partsFormatter.formatToParts(nextMidnight);
    const tLookup = Object.fromEntries(targetParts.map(({ type, value }) => [type, value]));

    const newTarget = {
      year: Number(tLookup.year),
      monthIndex: Number(tLookup.month) - 1,
      day: Number(tLookup.day),
      hour: Number(tLookup.hour),
      minute: Number(tLookup.minute),
      second: Number(tLookup.second)
    };

    const nextSettings = {
      ...getSettings(),
      durationMinutes: neededDurationMins,
      target: newTarget,
      showMeta: true
    };

    saveSettings(nextSettings);

    // Update UI
    populateSettingsForm(nextSettings);
    updateCountdown();
  });
}

updateCountdown();
setInterval(updateCountdown, 250);
