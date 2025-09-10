console.log("🎙️ Discord Vocal Extension loaded");

// 🔹 CONSTANTES ET CONFIGURATION
const CONFIG = {
  SELECTORS: {
    TEXTBOX: "div[role='textbox']",
    FILE_INPUT: "input[type='file'][multiple]",
    BUTTONS_CONTAINER: "div.buttons__74017",
    CHANNEL_TEXT_AREA: "div[class*='channelTextArea']",
    UPLOAD_PREVIEW: "li[class*='upload_']",
  },
  CLASSES: {
    VOICE_BUTTON_CONTAINER:
      "expression-picker-chat-input-button buttonContainer__74017",
    VOICE_BUTTON:
      "emojiButtonNormal__04eed emojiButton__04eed emojiButton__74017 button__74017",
  },
  PERFORMANCE: {
    THROTTLE_TIME: 100,
    DRAG_THROTTLE: 16,
    FILE_PROCESSING_DELAY: 500,
  },
};

// 🔹 ICÔNES SVG (DRY - Éviter la duplication)
const ICONS = {
  MICROPHONE:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12V10H19ZM12 22C12.6 22 13 21.6 13 21H11C11 21.6 11.4 22 12 22Z"/></svg>',
  STOP: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  PLAY: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  PAUSE:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
  DELETE:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z"/><path fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd"/></svg>',
  SEND: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
};

// 🔹 UTILITAIRES (Single Responsibility)
class DOMUtils {
  static createElement(tag, attributes = {}, innerHTML = "") {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  static safeSetTextContent(element, text) {
    if (element) element.textContent = text;
  }

  static safeSetStyle(element, property, value) {
    if (element) element.style[property] = value;
  }

  static safeSetInnerHTML(element, html) {
    if (element) element.innerHTML = html;
  }
}

class AudioUtils {
  static getOptimalMimeType() {
    if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
      return "audio/webm;codecs=opus";
    return "audio/webm";
  }

  static getFileInfo(mimeType) {
    const isMP4 = mimeType.includes("mp4");
    return {
      type: isMP4 ? "audio/mp4" : "audio/webm",
      name: isMP4 ? "vocal.m4a" : "vocal.webm",
    };
  }

  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}

// 🔹 CLASSE PRINCIPALE (Single Responsibility Principle)
class VoiceRecorder {
  constructor() {
    this.recorder = null;
    this.audioChunks = [];
    this.observer = null;
    this.init();
  }

  init() {
    this.setupObserver();
    this.checkAndInjectButton();
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "subtree") {
          this.checkAndInjectButton();
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  checkAndInjectButton() {
    const textbox = document.querySelector(CONFIG.SELECTORS.TEXTBOX);
    const fileInput = document.querySelector(CONFIG.SELECTORS.FILE_INPUT);
    const buttonsContainer = document.querySelector(
      CONFIG.SELECTORS.BUTTONS_CONTAINER
    );

    if (
      textbox &&
      fileInput &&
      buttonsContainer &&
      !document.getElementById("voice-btn")
    ) {
      this.injectVoiceButton({ textbox, fileInput, buttonsContainer });
    }
  }

  injectVoiceButton({ textbox, fileInput, buttonsContainer }) {
    console.log("✅ Zone détectée - Injection du bouton");

    const voiceButtonContainer = DOMUtils.createElement("div", {
      className: CONFIG.CLASSES.VOICE_BUTTON_CONTAINER,
    });

    const btn = DOMUtils.createElement(
      "button",
      {
        id: "voice-btn",
        className: CONFIG.CLASSES.VOICE_BUTTON,
        tabindex: "0",
        "aria-label": "Enregistrer un message vocal",
        role: "button",
      },
      `<div class="spriteContainer__04eed" style="--custom-emoji-sprite-size: 18px;">${ICONS.MICROPHONE}</div>`
    );

    voiceButtonContainer.appendChild(btn);
    this.insertButton(buttonsContainer, voiceButtonContainer);
    this.setupRecordingEvents(btn, fileInput);
  }

  insertButton(buttonsContainer, voiceButtonContainer) {
    const firstChild = buttonsContainer.firstChild;
    if (firstChild) {
      buttonsContainer.insertBefore(voiceButtonContainer, firstChild);
    } else {
      buttonsContainer.appendChild(voiceButtonContainer);
    }
  }

  setupRecordingEvents(btn, fileInput) {
    btn.addEventListener("click", async () => {
      if (!this.recorder || this.recorder.state === "inactive") {
        await this.startRecording(btn, fileInput);
      } else {
        this.stopRecording(btn);
      }
    });
  }

  async startRecording(btn, fileInput) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = AudioUtils.getOptimalMimeType();

      this.recorder = new MediaRecorder(stream, { mimeType });
      this.audioChunks = [];

      this.recorder.ondataavailable = (e) => this.audioChunks.push(e.data);
      this.recorder.onstop = () =>
        this.handleRecordingStop(mimeType, fileInput);

      this.recorder.start();
      this.updateButtonState(btn, true);
      console.log("🎙️ Recording...");
    } catch (err) {
      console.error("Erreur micro:", err);
    }
  }

  stopRecording(btn) {
    this.recorder.stop();
    this.updateButtonState(btn, false);
  }

  updateButtonState(btn, isRecording) {
    if (isRecording) {
      btn.classList.add("recording");
      btn.innerHTML = `<div class="spriteContainer__04eed" style="--custom-emoji-sprite-size: 18px;">${ICONS.STOP}</div>`;
    } else {
      btn.classList.remove("recording");
      btn.innerHTML = `<div class="spriteContainer__04eed" style="--custom-emoji-sprite-size: 18px;">${ICONS.MICROPHONE}</div>`;
    }
  }

  handleRecordingStop(mimeType, fileInput) {
    const fileInfo = AudioUtils.getFileInfo(mimeType);
    const blob = new Blob(this.audioChunks, { type: fileInfo.type });
    const file = new File([blob], fileInfo.name, { type: fileInfo.type });

    new AudioPreview(blob, file, fileInput).show();
  }
}

// 🔹 CLASSE AUDIO PREVIEW (Single Responsibility)
class AudioPreview {
  constructor(blob, file, fileInput) {
    this.blob = blob;
    this.file = file;
    this.fileInput = fileInput;
    this.audio = null;
    this.elements = {};
    this.state = {
      isPlaying: false,
      isDragging: false,
      lastUpdateTime: 0,
    };
    this.cache = {
      rect: null,
      duration: null,
    };
  }

  show() {
    this.removeExistingPreview();
    this.createPreviewContainer();
    this.setupAudio();
    this.createPreviewHTML();
    this.insertPreview();
    this.setupEventListeners();
  }

  removeExistingPreview() {
    const existingPreview = document.getElementById("voice-preview");
    if (existingPreview) existingPreview.remove();
  }

  createPreviewContainer() {
    this.previewContainer = DOMUtils.createElement("div", {
      id: "voice-preview",
      className: "voice-preview-container",
    });
  }

  setupAudio() {
    this.audio = DOMUtils.createElement("audio", {
      controls: false,
      preload: "metadata",
    });
    this.audio.src = URL.createObjectURL(this.blob);
    this.audio.setAttribute("data-keep-playing", "true");
  }

  createPreviewHTML() {
    const previewHTML = `
      <div class="voice-preview">
        <div class="voice-preview-controls">
          <button class="voice-control-btn" id="voice-play-btn">
            ${ICONS.PLAY}
          </button>
          <div class="voice-progress-container">
            <div class="voice-progress-bar" id="voice-progress-bar">
              <div class="voice-progress-fill" id="voice-progress-fill"></div>
              <div class="voice-progress-thumb" id="voice-progress-thumb"></div>
            </div>
          </div>
          <div class="voice-time" id="voice-time">0:00 / 0:00</div>
        </div>
        <div class="voice-preview-actions">
          <button class="voice-action-btn voice-delete-btn" id="voice-delete-btn">
            ${ICONS.DELETE}
          </button>
          <button class="voice-action-btn voice-send-btn" id="voice-send-btn">
            ${ICONS.SEND}
          </button>
        </div>
      </div>
    `;
    this.previewContainer.innerHTML = previewHTML;
    this.previewContainer.appendChild(this.audio);
  }

  insertPreview() {
    const composer = document.querySelector(CONFIG.SELECTORS.CHANNEL_TEXT_AREA);
    if (composer) composer.appendChild(this.previewContainer);
  }

  setupEventListeners() {
    this.cacheElements();
    this.setupAudioEvents();
    this.setupControlEvents();
    this.setupNavigationEvents();
    this.setupActionEvents();
  }

  cacheElements() {
    this.elements = {
      playBtn: document.getElementById("voice-play-btn"),
      progressFill: document.getElementById("voice-progress-fill"),
      progressThumb: document.getElementById("voice-progress-thumb"),
      progressBar: document.getElementById("voice-progress-bar"),
      timeDisplay: document.getElementById("voice-time"),
      controlsContainer: document.querySelector(".voice-preview-controls"),
    };
  }

  setupAudioEvents() {
    this.audio.addEventListener("loadedmetadata", () =>
      this.handleMetadataLoaded()
    );
    this.audio.addEventListener("timeupdate", () => this.handleTimeUpdate());
    this.audio.addEventListener("ended", () => this.handleAudioEnded());
  }

  setupControlEvents() {
    this.elements.playBtn.addEventListener("click", (e) =>
      this.handlePlayPause(e)
    );
  }

  setupNavigationEvents() {
    this.elements.progressBar.addEventListener("click", (e) =>
      this.handleProgressClick(e)
    );
    this.elements.progressThumb.addEventListener("mousedown", (e) =>
      this.handleThumbDrag(e)
    );
    this.elements.controlsContainer.addEventListener("mousedown", (e) =>
      this.handleControlsDrag(e)
    );
    this.elements.controlsContainer.addEventListener("click", (e) =>
      this.handleControlsClick(e)
    );
  }

  setupActionEvents() {
    document
      .getElementById("voice-delete-btn")
      .addEventListener("click", () => this.delete());
    document
      .getElementById("voice-send-btn")
      .addEventListener("click", () => this.send());
  }

  handleMetadataLoaded() {
    const duration = AudioUtils.formatTime(this.audio.duration);
    DOMUtils.safeSetTextContent(
      this.elements.timeDisplay,
      `0:00 / ${duration}`
    );
    this.cache.duration = this.audio.duration;
  }

  handleTimeUpdate() {
    if (
      !this.state.isDragging &&
      Date.now() - this.state.lastUpdateTime > CONFIG.PERFORMANCE.THROTTLE_TIME
    ) {
      this.updateProgress();
      this.state.lastUpdateTime = Date.now();

      if (this.audio.currentTime === 0 && this.state.isPlaying) {
        console.log(
          "🚨 PROBLÈME DÉTECTÉ - currentTime remis à 0 pendant la lecture!"
        );
      }
    }
  }

  updateProgress() {
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    DOMUtils.safeSetStyle(this.elements.progressFill, "width", `${progress}%`);
    DOMUtils.safeSetStyle(this.elements.progressThumb, "left", `${progress}%`);
    DOMUtils.safeSetTextContent(
      this.elements.timeDisplay,
      `${AudioUtils.formatTime(
        this.audio.currentTime
      )} / ${AudioUtils.formatTime(this.audio.duration)}`
    );
  }

  handlePlayPause(e) {
    e.stopPropagation();

    console.log("🎵 CLICK BOUTON - État actuel:", {
      isPlaying: this.state.isPlaying,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration,
      paused: this.audio.paused,
    });

    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    console.log("▶️ PLAY - Avant play:", this.audio.currentTime);
    this.audio.play().catch((e) => console.log("Erreur lecture:", e));
    this.state.isPlaying = true;
    console.log("▶️ PLAY - Après play:", this.audio.currentTime);
    DOMUtils.safeSetInnerHTML(this.elements.playBtn, ICONS.PAUSE);
  }

  pause() {
    console.log("⏸️ PAUSE - Avant pause:", this.audio.currentTime);
    this.audio.pause();
    this.state.isPlaying = false;
    console.log("⏸️ PAUSE - Après pause:", this.audio.currentTime);
    DOMUtils.safeSetInnerHTML(this.elements.playBtn, ICONS.PLAY);
  }

  handleProgressClick(e) {
    if (!this.state.isDragging) {
      console.log("🎯 CLIC BARRE - Navigation autorisée");
      this.updateAudioPosition(e.clientX);
    }
  }

  handleThumbDrag(e) {
    this.startDrag(e);
  }

  handleControlsDrag(e) {
    if (
      e.target === this.elements.progressBar ||
      e.target === this.elements.progressThumb
    )
      return;
    this.startDrag(e);
  }

  startDrag(e) {
    this.state.isDragging = true;
    e.preventDefault();
    this.cache.rect = null;

    let lastMoveTime = 0;
    const handleMouseMove = (e) => {
      if (Date.now() - lastMoveTime > CONFIG.PERFORMANCE.DRAG_THROTTLE) {
        this.updateAudioPosition(e.clientX);
        lastMoveTime = Date.now();
      }
    };

    const handleMouseUp = () => {
      this.state.isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  handleControlsClick(e) {
    if (this.isPlayButtonClick(e)) {
      console.log("🚫 NAVIGATION BLOQUÉE - Clic sur bouton play");
      return;
    }

    if (!this.state.isPlaying) {
      console.log("🚫 NAVIGATION BLOQUÉE - En pause, on ne navigue pas");
      return;
    }

    console.log("🎯 NAVIGATION AUTORISÉE - Clic sur zone contrôles");
    this.cache.rect = null;
    this.updateAudioPosition(e.clientX);
  }

  isPlayButtonClick(e) {
    return (
      e.target === this.elements.progressBar ||
      e.target === this.elements.progressThumb ||
      e.target === this.elements.playBtn ||
      e.target.closest("#voice-play-btn") ||
      e.target.closest(".voice-control-btn")
    );
  }

  updateAudioPosition(clientX) {
    if (!this.cache.rect) {
      this.cache.rect = this.elements.progressBar.getBoundingClientRect();
    }
    if (!this.cache.duration) {
      this.cache.duration = this.audio.duration;
    }

    const clickX = clientX - this.cache.rect.left;
    const percentage = Math.max(
      0,
      Math.min(100, (clickX / this.cache.rect.width) * 100)
    );
    const newTime = (percentage / 100) * this.cache.duration;

    console.log(
      "🎯 NAVIGATION - Avant:",
      this.audio.currentTime,
      "→ Après:",
      newTime
    );
    this.audio.currentTime = newTime;
    DOMUtils.safeSetStyle(
      this.elements.progressFill,
      "width",
      `${percentage}%`
    );
    DOMUtils.safeSetStyle(
      this.elements.progressThumb,
      "left",
      `${percentage}%`
    );
    DOMUtils.safeSetTextContent(
      this.elements.timeDisplay,
      `${AudioUtils.formatTime(newTime)} / ${AudioUtils.formatTime(
        this.cache.duration
      )}`
    );
  }

  handleAudioEnded() {
    console.log("🏁 FIN AUDIO - Remise à zéro normale");
    this.state.isPlaying = false;
    DOMUtils.safeSetInnerHTML(this.elements.playBtn, ICONS.PLAY);
    DOMUtils.safeSetStyle(this.elements.progressFill, "width", "0%");
    DOMUtils.safeSetStyle(this.elements.progressThumb, "left", "0%");
    DOMUtils.safeSetTextContent(
      this.elements.timeDisplay,
      `0:00 / ${AudioUtils.formatTime(this.audio.duration)}`
    );
    this.audio.currentTime = 0;
  }

  delete() {
    this.previewContainer.remove();
    URL.revokeObjectURL(this.audio.src);
  }

  async send() {
    const dt = new DataTransfer();
    dt.items.add(this.file);
    this.fileInput.files = dt.files;
    this.fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.PERFORMANCE.FILE_PROCESSING_DELAY)
    );

    const attachmentPreview = document.querySelector(
      CONFIG.SELECTORS.UPLOAD_PREVIEW
    );
    if (attachmentPreview) {
      const tb = document.querySelector(CONFIG.SELECTORS.TEXTBOX);
      tb.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          which: 13,
          keyCode: 13,
          bubbles: true,
        })
      );

      this.previewContainer.remove();
      URL.revokeObjectURL(this.audio.src);
      console.log("✅ Vocal envoyé !");
    } else {
      console.error("❌ Fichier non attaché, réessayez");
    }
  }
}

// 🔹 INITIALISATION
const voiceRecorder = new VoiceRecorder();
