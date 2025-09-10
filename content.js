console.log("🎙️ Discord Vocal Extension loaded");

// 🔹 Observer pour détecter les changements de conversation
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" || mutation.type === "subtree") {
      checkAndInjectButton();
    }
  });
});

// 🔹 Démarrer l'observation
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 🔹 Fonction pour vérifier et injecter le bouton
function checkAndInjectButton() {
  const textbox = document.querySelector("div[role='textbox']");
  const fileInput = document.querySelector("input[type='file'][multiple]");
  const buttonsContainer = document.querySelector("div.buttons__74017");

  if (
    textbox &&
    fileInput &&
    buttonsContainer &&
    !document.getElementById("voice-btn")
  ) {
    injectVoiceButton({ textbox, fileInput, buttonsContainer });
  }
}

// 🔹 Injection bouton 🎙️
function injectVoiceButton({ textbox, fileInput, buttonsContainer }) {
  console.log("✅ Zone détectée - Injection du bouton");

  // Créer le conteneur du bouton vocal
  const voiceButtonContainer = document.createElement("div");
  voiceButtonContainer.className =
    "expression-picker-chat-input-button buttonContainer__74017";

  const btn = document.createElement("button");
  btn.id = "voice-btn";
  btn.className =
    "emojiButtonNormal__04eed emojiButton__04eed emojiButton__74017 button__74017";
  btn.setAttribute("tabindex", "0");
  btn.setAttribute("aria-label", "Enregistrer un message vocal");
  btn.setAttribute("role", "button");
  btn.innerHTML =
    '<div class="spriteContainer__04eed" style="--custom-emoji-sprite-size: 18px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12V10H19ZM12 22C12.6 22 13 21.6 13 21H11C11 21.6 11.4 22 12 22Z"/></svg></div>';

  voiceButtonContainer.appendChild(btn);

  // Insérer tout à gauche, en premier
  const firstChild = buttonsContainer.firstChild;
  if (firstChild) {
    buttonsContainer.insertBefore(voiceButtonContainer, firstChild);
  } else {
    buttonsContainer.appendChild(voiceButtonContainer);
  }

  let recorder,
    audioChunks = [];

  btn.addEventListener("click", async () => {
    if (!recorder || recorder.state === "inactive") {
      // Commencer record
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        recorder = new MediaRecorder(stream, { mimeType });

        audioChunks = [];
        recorder.ondataavailable = (e) => audioChunks.push(e.data);

        recorder.onstop = async () => {
          const fileType = mimeType.includes("mp4")
            ? "audio/mp4"
            : "audio/webm";
          const fileName = mimeType.includes("mp4")
            ? "vocal.m4a"
            : "vocal.webm";

          const blob = new Blob(audioChunks, { type: fileType });
          const file = new File([blob], fileName, { type: fileType });

          // Afficher la preview au lieu d'envoyer directement
          showAudioPreview(blob, file, fileInput);
        };

        recorder.start();
        btn.classList.add("recording");
        btn.innerHTML =
          '<div class="spriteContainer__04eed" style="--custom-emoji-sprite-size: 18px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></div>';
        console.log("🎙️ Recording...");
      } catch (err) {
        console.error("Erreur micro:", err);
      }
    } else {
      // Stop record
      recorder.stop();
      btn.classList.remove("recording");
      btn.innerHTML =
        '<div class="spriteContainer__04eed" style="--custom-emoji-sprite-size: 18px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12V10H19ZM12 22C12.6 22 13 21.6 13 21H11C11 21.6 11.4 22 12 22Z"/></svg></div>';
    }
  });
}

// 🔹 Fonction pour afficher la preview audio
function showAudioPreview(blob, file, fileInput) {
  // Supprimer toute preview existante
  const existingPreview = document.getElementById("voice-preview");
  if (existingPreview) {
    existingPreview.remove();
  }

  // Créer le conteneur de preview
  const previewContainer = document.createElement("div");
  previewContainer.id = "voice-preview";
  previewContainer.className = "voice-preview-container";

  // Créer l'audio element
  const audio = document.createElement("audio");
  audio.src = URL.createObjectURL(blob);
  audio.controls = false;
  audio.preload = "metadata";

  // Maintenir le focus audio
  audio.setAttribute("data-keep-playing", "true");

  // Créer l'interface de preview
  const previewHTML = `
    <div class="voice-preview">
      <div class="voice-preview-controls">
        <button class="voice-control-btn" id="voice-play-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z"/>
            <path fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd"/>
          </svg>
        </button>
        
        <button class="voice-action-btn voice-send-btn" id="voice-send-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  previewContainer.innerHTML = previewHTML;
  previewContainer.appendChild(audio);

  // Insérer la preview dans le composer
  const composer = document.querySelector("div[class*='channelTextArea']");
  if (composer) {
    composer.appendChild(previewContainer);
  }

  // Gérer les événements audio
  let isPlaying = false;
  let isDragging = false;
  const playBtn = document.getElementById("voice-play-btn");
  const progressFill = document.getElementById("voice-progress-fill");
  const progressThumb = document.getElementById("voice-progress-thumb");
  const progressBar = document.getElementById("voice-progress-bar");
  const timeDisplay = document.getElementById("voice-time");
  const durationDisplay = document.getElementById("voice-duration");
  const controlsContainer = document.querySelector(".voice-preview-controls");

  // Mettre à jour la durée
  audio.addEventListener("loadedmetadata", () => {
    const duration = formatTime(audio.duration);
    if (durationDisplay) {
      durationDisplay.textContent = duration;
    }
    if (timeDisplay) {
      timeDisplay.textContent = `0:00 / ${duration}`;
    }
    // Mettre en cache la durée
    cachedDuration = audio.duration;
  });

  // Gérer la lecture - SOLUTION RADICALE AVEC LOGS
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Empêcher la propagation vers controlsContainer

    console.log("🎵 CLICK BOUTON - État actuel:", {
      isPlaying,
      currentTime: audio.currentTime,
      duration: audio.duration,
      paused: audio.paused,
    });

    if (isPlaying) {
      console.log("⏸️ PAUSE - Avant pause:", audio.currentTime);
      audio.pause();
      isPlaying = false;
      console.log("⏸️ PAUSE - Après pause:", audio.currentTime);
      playBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    } else {
      console.log("▶️ PLAY - Avant play:", audio.currentTime);
      audio.play().catch((e) => console.log("Erreur lecture:", e));
      isPlaying = true;
      console.log("▶️ PLAY - Après play:", audio.currentTime);
      playBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
    }
  });

  // SUPPRIMER TOUS LES ÉVÉNEMENTS AUDIO QUI INTERFÈRENT
  // On gère tout manuellement dans le click handler

  // Mettre à jour la progression (seulement si pas en train de drag)
  let lastUpdateTime = 0;
  audio.addEventListener("timeupdate", () => {
    if (!isDragging && Date.now() - lastUpdateTime > 100) {
      const progress = (audio.currentTime / audio.duration) * 100;
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      if (progressThumb) {
        progressThumb.style.left = `${progress}%`;
      }
      if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(
          audio.currentTime
        )} / ${formatTime(audio.duration)}`;
      }
      lastUpdateTime = Date.now();

      // LOG pour debug
      if (audio.currentTime === 0 && isPlaying) {
        console.log(
          "🚨 PROBLÈME DÉTECTÉ - currentTime remis à 0 pendant la lecture!"
        );
      }
    }
  });

  // Cache pour éviter les recalculs
  let cachedRect = null;
  let cachedDuration = null;

  // Fonction pour calculer la position et mettre à jour l'audio
  function updateAudioPosition(clientX) {
    if (!cachedRect) {
      cachedRect = progressBar.getBoundingClientRect();
    }
    if (!cachedDuration) {
      cachedDuration = audio.duration;
    }

    const clickX = clientX - cachedRect.left;
    const percentage = Math.max(
      0,
      Math.min(100, (clickX / cachedRect.width) * 100)
    );
    const newTime = (percentage / 100) * cachedDuration;

    console.log(
      "🎯 NAVIGATION - Avant:",
      audio.currentTime,
      "→ Après:",
      newTime
    );
    audio.currentTime = newTime;
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    if (progressThumb) {
      progressThumb.style.left = `${percentage}%`;
    }
    if (timeDisplay) {
      timeDisplay.textContent = `${formatTime(newTime)} / ${formatTime(
        cachedDuration
      )}`;
    }
  }

  // Navigation par clic sur la barre de progression
  progressBar.addEventListener("click", (e) => {
    if (!isDragging) {
      console.log("🎯 CLIC BARRE - Navigation autorisée");
      updateAudioPosition(e.clientX);
    }
  });

  // Drag & Drop du thumb avec throttling
  progressThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();

    // Invalider le cache au début du drag
    cachedRect = null;

    let lastMoveTime = 0;
    const handleMouseMove = (e) => {
      if (Date.now() - lastMoveTime > 16) {
        // ~60fps
        updateAudioPosition(e.clientX);
        lastMoveTime = Date.now();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  // Contrôle sur toute la zone des contrôles avec throttling
  controlsContainer.addEventListener("mousedown", (e) => {
    if (e.target === progressBar || e.target === progressThumb) return;

    isDragging = true;
    e.preventDefault();

    // Invalider le cache au début du drag
    cachedRect = null;

    let lastMoveTime = 0;
    const handleMouseMove = (e) => {
      if (Date.now() - lastMoveTime > 16) {
        // ~60fps
        updateAudioPosition(e.clientX);
        lastMoveTime = Date.now();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  // Clic sur toute la zone des contrôles pour navigation
  controlsContainer.addEventListener("click", (e) => {
    // PROTECTION RENFORCÉE : Vérifier si c'est le bouton play ou ses enfants
    if (
      e.target === progressBar ||
      e.target === progressThumb ||
      e.target === playBtn ||
      e.target.closest("#voice-play-btn") ||
      e.target.closest(".voice-control-btn")
    ) {
      console.log("🚫 NAVIGATION BLOQUÉE - Clic sur bouton play");
      return;
    }

    // PROTECTION : Ne pas naviguer si on est en pause
    if (!isPlaying) {
      console.log("🚫 NAVIGATION BLOQUÉE - En pause, on ne navigue pas");
      return;
    }

    console.log("🎯 NAVIGATION AUTORISÉE - Clic sur zone contrôles");
    // Invalider le cache pour recalculer la position
    cachedRect = null;
    updateAudioPosition(e.clientX);
  });

  // Réinitialiser à la fin - SOLUTION RADICALE
  audio.addEventListener("ended", () => {
    console.log("🏁 FIN AUDIO - Remise à zéro normale");
    isPlaying = false;
    if (playBtn) {
      playBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
    if (progressFill) {
      progressFill.style.width = "0%";
    }
    if (progressThumb) {
      progressThumb.style.left = "0%";
    }
    if (timeDisplay) {
      timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    }
    // Remettre l'audio au début seulement à la fin complète
    audio.currentTime = 0;
  });

  // Bouton supprimer
  document.getElementById("voice-delete-btn").addEventListener("click", () => {
    previewContainer.remove();
    URL.revokeObjectURL(audio.src);
  });

  // Bouton envoyer
  document
    .getElementById("voice-send-btn")
    .addEventListener("click", async () => {
      // Attacher le fichier
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      // Attendre que Discord traite le fichier
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Vérifier que le fichier est bien attaché
      const attachmentPreview = document.querySelector("li[class*='upload_']");
      if (attachmentPreview) {
        // Simuler Enter (envoi)
        const tb = document.querySelector("div[role='textbox']");
        tb.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            which: 13,
            keyCode: 13,
            bubbles: true,
          })
        );

        // Supprimer la preview
        previewContainer.remove();
        URL.revokeObjectURL(audio.src);
        console.log("✅ Vocal envoyé !");
      } else {
        console.error("❌ Fichier non attaché, réessayez");
      }
    });
}

// 🔹 Fonction utilitaire pour formater le temps
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 🔹 Vérification initiale
checkAndInjectButton();
