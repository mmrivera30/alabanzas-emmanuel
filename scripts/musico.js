import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
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
const displayTitle = document.getElementById("displayTitle");
const displayText = document.getElementById("displayText");
const songSelector = document.getElementById("songSelectorAdmin");
const addForm = document.getElementById("addForm");
const inputTitle = document.getElementById("songTitle");
const inputText = document.getElementById("songText");
const adminPanel = document.getElementById("adminPanel");

let allSongs = {};
let currentKey = null;

// Regex para acordes típicos: D, G, Bm, A, Am, Em, F, etc.
function highlightChords(text) {
  // Resalta SOLO los acordes que están al comienzo de la línea o seguidos por espacios.
  // Evita resaltar palabras normales por accidente.
  return text.replace(
    /(^|\s)([A-G][#b]?m?(?:aj|min|dim|aug|sus|add)?\d*)/g,
    (match, p1, p2) => {
      // Solo resalta si es acorde válido y no está vacío
      if (p2.trim() && /^[A-G][#b]?m?(aj|min|dim|aug|sus|add)?\d*$/.test(p2)) {
        return p1 + `<span class="chord">${p2}</span>`;
      }
      return match;
    }
  );
}

function renderSong(song, key) {
  currentKey = key;
  displayTitle.textContent = song.title;

  // 1. Resalta acordes con HTML
  let resaltado = highlightChords(song.text || "");

  // 2. Conserva espacios y saltos de línea fielmente:
  //    - Espacios: &nbsp; (incluida indentación al inicio de línea)
  //    - Saltos de línea: <br>
  resaltado = resaltado
    .split('\n').map(line =>
      line.replace(/ /g, '&nbsp;')
    ).join('<br>');

  displayText.innerHTML = resaltado;
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

// Puedes eliminar la función de ajuste de fuente si usas <pre> y CSS responsive.
// Si necesitas ajustar el tamaño de fuente dinámicamente según el contenedor, puedes volver a agregarla.
