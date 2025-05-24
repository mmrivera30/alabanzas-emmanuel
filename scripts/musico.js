import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJEPsI0xrYHM5YdbeO58IgiJ1ocCg1nBg",
  authDomain: "alabanzasemmanuel2.firebaseapp.com",
  databaseURL: "https://alabanzasemmanuel2-default-rtdb.firebaseio.com/",
  projectId: "alabanzasemmanuel2",
  storageBucket: "alabanzasemmanuel2.appspot.com",
  messagingSenderId: "454013833170",
  appId: "1:454013833170:web:828b4a5179a042332cc20b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const MUSICO_UIDS = "lO3MhmpBIdeVwdUyI9oRGCZizj32";
const display = document.getElementById("display");
const displayTitle = document.getElementById("displayTitle");
const displayText = document.getElementById("displayText");
const songSelector = document.getElementById("songSelectorAdmin");
const addForm = document.getElementById("addForm");
const inputTitle = document.getElementById("songTitle");
const inputText = document.getElementById("songText");
const adminPanel = document.getElementById("adminPanel");

let allSongs = {};
let currentKey = null;

function highlightChords(text) {
  // Puedes personalizar esta regex según tu formato de acordes
  // Aquí detecta: D, G, Bm, A, Am, Em, F, etc (mayúsculas, opcional m, 7, etc.)
  return text.replace(
    /\b([A-G][#b]?m?(?:aj|min|dim|aug|sus|add)?\d*)\b/g,
    '<span class="chord">$1</span>'
  );
}

function renderSong(song, key) {
  currentKey = key;
  displayTitle.textContent = song.title;
  displayText.innerHTML = formatSongHtml(song.text || "");
  ajustarFuenteLetra();
}

function formatSongHtml(texto) {
  // 1. Resalta acordes
  let resaltado = highlightChords(texto);

  // 2. Reemplaza espacios por &nbsp; y saltos de línea por <br>
  // Para no romper los acordes resaltados, primero reemplaza espacios que no estén dentro de las etiquetas
  // Usamos un truco con split para no afectar el HTML de los acordes
  resaltado = resaltado
    .split('\n').map(line =>
      line.replace(/ /g, '&nbsp;')
    ).join('<br>');

  return resaltado;
}

function loadSongs() {
  onValue(ref(db, "songsMusico"), (snapshot) => {
    allSongs = snapshot.val() || {};
    songSelector.innerHTML = '<option value="">Selecciona una alabanza</option>';
    Object.entries(allSongs).forEach(([key, song]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = song.title;
      songSelector.appendChild(opt);
    });
  }, (error) => {
    console.error("Error al cargar las alabanzas:", error);
    alert("No se pudieron cargar las alabanzas. Verifica la conexión a Firebase.");
  });
}

songSelector?.addEventListener("change", () => {
  const key = songSelector.value;
  if (key && allSongs[key]) {
    const { title, text } = allSongs[key];
    set(ref(db, "currentSongMusico"), { title, text });
    renderSong({ title, text }, key);
  } else {
    displayTitle.textContent = "";
    displayText.textContent = "Selecciona una alabanza.";
  }
});

window.login = () => {
  signInWithPopup(auth, provider).catch((error) =>
    alert("Error al iniciar sesión: " + error.message)
  );
};

onAuthStateChanged(auth, (user) => {
  const loginButton = document.getElementById("loginButton");
  if (user) {
    if (MUSICO_UIDS.includes(user.uid)) {
      adminPanel.style.display = "block";
      loadSongs();
    } else {
      alert("Acceso restringido al músico.");
    }
    if (loginButton) loginButton.style.display = "none";
  } else {
    if (loginButton) loginButton.style.display = "block";
  }
});

window.showAddForm = () => {
  addForm.style.display = "block";
};

window.addSong = () => {
  const title = inputTitle.value.trim();
  const text = inputText.value.trim();
  if (!title || !text) return alert("Completa todos los campos.");
  const key = title.toLowerCase().replace(/\s+/g, "_");
  set(ref(db, "songsMusico/" + key), { title, text }).then(() => {
    inputTitle.value = "";
    inputText.value = "";
    addForm.style.display = "none";
    renderSong({ title, text }, key);
    songSelector.value = key;
  });
};

window.addEventListener("resize", ajustarFuenteLetra);

// -------- OPCIONAL: Adaptar el ajuste de fuente para que funcione con HTML dinámico ---------
function ajustarFuenteLetra() {
  const letraDiv = displayText;
  if (!letraDiv) return;
  let fontSize = 14; // Tamaño inicial de la fuente
  letraDiv.style.fontSize = fontSize + "px";
  const displayBox = display.getBoundingClientRect();
  const titleHeight = displayTitle.offsetHeight;

  while (
    (letraDiv.scrollHeight > (display.clientHeight - titleHeight - 10) || letraDiv.scrollWidth > displayBox.width) &&
    fontSize > 8
  ) {
    fontSize--;
    letraDiv.style.fontSize = fontSize + "px";
  }
}
