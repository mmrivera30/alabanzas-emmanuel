import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// CONFIGURA tus datos reales de Firebase aquí:
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

// UIDs permitidos para el músico (reemplaza por los correctos)
const MUSICO_UIDS = "lO3MhmpBIdeVwdUyI9oRGCZizj32";
const songSelector = document.getElementById("songSelectorAdmin");
const adminPanel = document.getElementById("adminPanel");
const display = document.getElementById("display");
const addForm = document.getElementById("addForm");

let allSongs = {};

function ajustarFuenteDisplay() {
  // Ajusta el tamaño de fuente para que todo el texto quepa en #display
  let fontSize = 32; // tamaño inicial grande
  display.style.fontSize = fontSize + "px";
  // Considera si tiene texto (puede ser innerText o textContent según el contenido)
  if (
    (!display.textContent || !display.textContent.trim()) &&
    (!display.innerText || !display.innerText.trim())
  ) return;
  // Bucle: reduce tamaño hasta que no haya overflow (desborde)
  while (
    (display.scrollHeight > display.clientHeight || display.scrollWidth > display.clientWidth)
    && fontSize > 10
  ) {
    fontSize -= 1;
    display.style.fontSize = fontSize + "px";
  }
}

function renderSong(song) {
  const lines = song.text.split("\n");
  let html = `<strong>${song.title}</strong><br><br><pre style="margin:0; font-family:inherit;">`;
  for (const line of lines) {
    html += line + "\n";
  }
  html += "</pre>";
  display.innerHTML = html;
  ajustarFuenteDisplay(); // Ajusta la fuente cada vez que se renderiza
}

function loadSongs() {
  onValue(ref(db, 'songsMusico'), snapshot => {
    allSongs = snapshot.val() || {};
    songSelector.innerHTML = '<option value="">Selecciona una alabanza</option>';
    Object.keys(allSongs).forEach(key => {
      const song = allSongs[key];
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = song.title;
      songSelector.appendChild(opt);
    });
  });
}

songSelector?.addEventListener('change', () => {
  const key = songSelector.value;
  if (key && allSongs[key]) {
    const song = allSongs[key];
    set(ref(db, 'currentSongMusico'), song);
    renderSong(song);
  } else {
    display.innerHTML = "";
    ajustarFuenteDisplay();
  }
});

window.login = () => {
  signInWithPopup(auth, provider)
    .catch(error => {
      alert("Error al iniciar sesión: " + error.message);
      console.error(error);
    });
};

onAuthStateChanged(auth, user => {
  if (!user) return;
  if (MUSICO_UIDS.includes(user.uid)) {
    adminPanel.style.display = 'block';
    loadSongs();
  } else {
    alert("Acceso restringido al músico.");
  }
});

window.showAddForm = () => {
  addForm.style.display = 'block';
};

window.addSong = () => {
  const title = document.getElementById("songTitle").value.trim();
  const text = document.getElementById("songText").value.trim();
  if (!title || !text) return alert("Completa todos los campos.");
  const key = title.toLowerCase().replace(/\s+/g, "_");
  set(ref(db, 'songsMusico/' + key), { title, text });
  document.getElementById("songTitle").value = "";
  document.getElementById("songText").value = "";
  addForm.style.display = 'none';
};

// Ajusta la fuente si se redimensiona la ventana
window.addEventListener('resize', ajustarFuenteDisplay);
