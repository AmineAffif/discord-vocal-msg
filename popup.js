// 🔹 POPUP LOGIC - Discord Vocal Extension

console.log("🎙️ Discord Vocal Popup loaded");

// 🔹 Configuration
const CONFIG = {
  PLANS: {
    FREE: "free",
    STARTER: "starter",
    PRO: "pro",
    ULTIMATE: "ultimate",
  },
  STORAGE_KEYS: {
    CURRENT_PLAN: "currentPlan",
    USER_PREFERENCES: "userPreferences",
  },
};

// 🔹 Classe principale pour gérer la popup
class PopupManager {
  constructor() {
    this.currentPlan = CONFIG.PLANS.FREE;
    this.init();
  }

  async init() {
    await this.loadUserData();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadUserData() {
    try {
      const result = await chrome.storage.sync.get([
        CONFIG.STORAGE_KEYS.CURRENT_PLAN,
      ]);
      this.currentPlan =
        result[CONFIG.STORAGE_KEYS.CURRENT_PLAN] || CONFIG.PLANS.FREE;
    } catch (error) {
      console.error("Erreur chargement données:", error);
      this.currentPlan = CONFIG.PLANS.FREE;
    }
  }

  setupEventListeners() {
    // Boutons d'upgrade
    document.querySelectorAll(".plan-btn.upgrade").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleUpgrade(e));
    });

    // Liens footer
    document.querySelectorAll(".footer-link").forEach((link) => {
      link.addEventListener("click", (e) => this.handleFooterLink(e));
    });

    // Animation au survol des cartes
    document.querySelectorAll(".plan-card").forEach((card) => {
      card.addEventListener("mouseenter", () => this.animateCard(card, true));
      card.addEventListener("mouseleave", () => this.animateCard(card, false));
    });
  }

  updateUI() {
    this.updateCurrentPlanBadge();
    this.updatePlanButtons();
    this.highlightCurrentPlan();
  }

  updateCurrentPlanBadge() {
    const badge = document.querySelector(".plan-badge");
    const planName = document.querySelector(".plan-name");
    const planStatus = document.querySelector(".plan-status");

    // Supprimer toutes les classes de plan
    badge.className = "plan-badge";

    // Ajouter la classe du plan actuel
    badge.classList.add(this.currentPlan);

    // Mettre à jour le texte
    const planInfo = this.getPlanInfo(this.currentPlan);
    planName.textContent = planInfo.name;
    planStatus.textContent = "Actuel";
  }

  updatePlanButtons() {
    document.querySelectorAll(".plan-btn").forEach((btn) => {
      const card = btn.closest(".plan-card");
      const planType = this.getPlanTypeFromCard(card);

      if (planType === this.currentPlan) {
        btn.textContent = "Plan Actuel";
        btn.classList.remove("upgrade");
        btn.classList.add("current");
      } else {
        btn.textContent = "Upgrade";
        btn.classList.remove("current");
        btn.classList.add("upgrade");
      }
    });
  }

  highlightCurrentPlan() {
    document.querySelectorAll(".plan-card").forEach((card) => {
      const planType = this.getPlanTypeFromCard(card);
      if (planType === this.currentPlan) {
        card.classList.add("current-plan");
      } else {
        card.classList.remove("current-plan");
      }
    });
  }

  getPlanTypeFromCard(card) {
    if (card.classList.contains("free-plan")) return CONFIG.PLANS.FREE;
    if (card.classList.contains("starter-plan")) return CONFIG.PLANS.STARTER;
    if (card.classList.contains("pro-plan")) return CONFIG.PLANS.PRO;
    if (card.classList.contains("ultimate-plan")) return CONFIG.PLANS.ULTIMATE;
    return CONFIG.PLANS.FREE;
  }

  getPlanInfo(planType) {
    const plans = {
      [CONFIG.PLANS.FREE]: { name: "🆓 Free", price: "Gratuit" },
      [CONFIG.PLANS.STARTER]: { name: "💡 Starter", price: "3€/mois" },
      [CONFIG.PLANS.PRO]: { name: "⚡ Pro", price: "7€/mois" },
      [CONFIG.PLANS.ULTIMATE]: { name: "👑 Ultimate", price: "15€/mois" },
    };
    return plans[planType] || plans[CONFIG.PLANS.FREE];
  }

  async handleUpgrade(e) {
    e.preventDefault();
    const card = e.target.closest(".plan-card");
    const planType = this.getPlanTypeFromCard(card);

    if (planType === this.currentPlan) {
      this.showNotification("Vous utilisez déjà ce plan !", "info");
      return;
    }

    // Animation de clic
    e.target.style.transform = "scale(0.95)";
    setTimeout(() => {
      e.target.style.transform = "scale(1)";
    }, 150);

    // Simuler l'upgrade (en attendant l'intégration de paiement)
    await this.simulateUpgrade(planType);
  }

  async simulateUpgrade(planType) {
    this.showNotification("Redirection vers la page de paiement...", "info");

    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mettre à jour le plan (simulation)
    this.currentPlan = planType;
    await this.saveUserData();
    this.updateUI();

    this.showNotification(
      `Upgrade vers ${this.getPlanInfo(planType).name} réussi !`,
      "success"
    );
  }

  async saveUserData() {
    try {
      await chrome.storage.sync.set({
        [CONFIG.STORAGE_KEYS.CURRENT_PLAN]: this.currentPlan,
      });
    } catch (error) {
      console.error("Erreur sauvegarde données:", error);
    }
  }

  handleFooterLink(e) {
    e.preventDefault();
    const linkText = e.target.textContent.toLowerCase();

    const links = {
      support: "https://discord.gg/your-support-server",
      documentation: "https://docs.discord-vocal.com",
      discord: "https://discord.gg/your-discord-server",
    };

    const url = links[linkText];
    if (url) {
      chrome.tabs.create({ url });
    }
  }

  animateCard(card, isHover) {
    if (isHover) {
      card.style.transform = "translateY(-2px)";
      card.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
    } else {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    }
  }

  showNotification(message, type = "info") {
    // Créer une notification temporaire
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Styles inline pour la notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      padding: "10px 15px",
      borderRadius: "4px",
      color: "white",
      fontSize: "12px",
      fontWeight: "500",
      zIndex: "1000",
      opacity: "0",
      transform: "translateX(100%)",
      transition: "all 0.3s ease",
    });

    // Couleurs selon le type
    const colors = {
      info: "#5865f2",
      success: "#3ba55c",
      error: "#ed4245",
      warning: "#faa61a",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 100);

    // Suppression automatique
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// 🔹 Initialisation
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});

// 🔹 Gestion des erreurs globales
window.addEventListener("error", (e) => {
  console.error("Erreur popup:", e.error);
});

// 🔹 Export pour tests (si nécessaire)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PopupManager, CONFIG };
}
