// Adresse du Calculateur de plex en ligne.
const SITE = "https://christfortnite.github.io/calculateur-plex/calculateur.html";

// S'exécute dans la page de l'annonce, seulement quand tu cliques sur l'icône.
async function lireAnnonce() {
  if (!/\/\d{6,}/.test(location.pathname)) {
    alertBox("Ouvre d'abord la page d'une annonce (pas la liste de résultats).");
    return null;
  }
  // Affiche les taxes et les dépenses, cachées par défaut sous « Voir plus ».
  const plus = [...document.querySelectorAll("a,button,span,div")].find(
    (e) => e.children.length === 0 && /^Voir plus$/.test((e.textContent || "").trim()) && e.offsetParent
  );
  if (plus) { plus.click(); await new Promise((r) => setTimeout(r, 800)); }
  return { texte: document.body.innerText.slice(0, 60000), url: location.href };

  function alertBox(msg) {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;z-index:2147483647;right:20px;top:20px;max-width:340px;padding:14px 16px;border-radius:10px;font:14px/1.4 system-ui,sans-serif;color:#fff;background:#b3372c;box-shadow:0 6px 24px rgba(0,0,0,.3)";
    el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 6000);
  }
}

// S'exécute dans le calculateur : lui remet l'annonce.
function remettre(texte, url) {
  window.postMessage({ type: "plex-annonce", texte, url }, location.origin);
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !/^https:\/\/(www\.)?centris\.ca\//.test(tab.url || "")) {
    chrome.action.setBadgeText({ tabId: tab.id, text: "?" });
    chrome.action.setTitle({ tabId: tab.id, title: "Ouvre une annonce sur centris.ca, puis clique ici." });
    return;
  }
  try {
    const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: lireAnnonce });
    const annonce = res && res.result;
    if (!annonce) return;
    const cible = await chrome.tabs.create({ url: SITE, index: tab.index + 1 });
    const pret = (id, info) => {
      if (id !== cible.id || info.status !== "complete") return;
      chrome.tabs.onUpdated.removeListener(pret);
      chrome.scripting.executeScript({ target: { tabId: id }, world: "MAIN", func: remettre, args: [annonce.texte, annonce.url] });
    };
    chrome.tabs.onUpdated.addListener(pret);
  } catch (e) {
    chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
  }
});
