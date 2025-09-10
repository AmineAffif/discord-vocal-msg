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

          // Attacher le fichier
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event("change", { bubbles: true }));

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

          console.log("✅ Vocal attaché et envoyé !");
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

// 🔹 Vérification initiale
checkAndInjectButton();
