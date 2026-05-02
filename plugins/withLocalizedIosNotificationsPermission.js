const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const DEFAULT_TRANSLATIONS = {
  en: "We use notifications to remind you when daily rewards are ready and to announce new content.",
  tr: "Günlük ödülleriniz hazır olduğunda sizi bilgilendirmek ve yeni içerikleri duyurmak için bildirimleri kullanıyoruz.",
  es: "Usamos notificaciones para avisarte cuando tus recompensas diarias estén listas y para anunciar contenido nuevo.",
};

function escapeIosString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

module.exports = function withLocalizedIosNotificationsPermission(config, options = {}) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const iosRoot = modConfig.modRequest.platformProjectRoot;
      const projectName = modConfig.modRequest.projectName;
      const translations = {
        ...DEFAULT_TRANSLATIONS,
        ...(options.translations || {}),
      };

      for (const [lang, message] of Object.entries(translations)) {
        const lprojDir = path.join(iosRoot, projectName, `${lang}.lproj`);
        const filePath = path.join(lprojDir, "InfoPlist.strings");
        const content = `"NSUserNotificationUsageDescription" = "${escapeIosString(message)}";\n`;

        fs.mkdirSync(lprojDir, { recursive: true });
        fs.writeFileSync(filePath, content, "utf8");
      }

      return modConfig;
    },
  ]);
};
