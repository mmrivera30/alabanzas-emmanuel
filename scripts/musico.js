
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

const ALLOWED_UID = "lO3MhmpBIdeVwdUyI9oRGCZizj32";
const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const songSelector = document.getElementById('songSelectorAdmin');
const display = document.getElementById('display');

let allSongs = {};

function renderSong(song) {
  if (!song) return display.textContent = "No hay alabanza.";
  const lines = song.text.split("\n");
  let html = `<strong>${song.title}</strong><br><br><pre>`;
  for (const line of lines) {
    const isChord = /^[A-G][#b]?m?(maj|min|dim|aug)?(\s|$)/.test(line.trim());
    html += isChord ? `<span class='chord'>${line}</span>\n` : `${line}\n`;
  }
  html += `</pre>`;
  display.innerHTML = html;
}

onValue(ref(db, 'songs'), snapshot => {
  allSongs = snapshot.val() || {};
  songSelector.innerHTML = '<option value="">Selecciona una alabanza</option>';
  for (const key in allSongs) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = allSongs[key].title;
    songSelector.appendChild(option);
  }
});

songSelector?.addEventListener('change', () => {
  const key = songSelector.value;
  if (key && allSongs[key]) {
    const song = allSongs[key];
    set(ref(db, 'currentSongMusico'), song);
    renderSong(song);
  }
});

window.login = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      if (result.user.uid === ALLOWED_UID) showAdminPanel();
      else alert("No tienes permisos para administrar.");
    })
    .catch(err => alert("Error de autenticación: " + err.message));
};

onAuthStateChanged(auth, user => {
  if (user && user.uid === ALLOWED_UID) showAdminPanel();
});

function showAdminPanel() {
  adminPanel.style.display = 'block';
  loginBtn.style.display = 'none';
}

window.showAddForm = () => {
  document.getElementById('addForm').style.display = 'block';
};

window.addSong = () => {
  const title = document.getElementById('songTitle').value.trim();
  const text = document.getElementById('songText').value;
  if (!title || !text) return alert("Completa todos los campos.");
  const key = title.toLowerCase().replace(/\s+/g, "_");
  const songData = { title, text };
  const updates = {};
  updates['/songs/' + key] = songData;
  updates['/currentSongMusico'] = songData;
  update(ref(db), updates).then(() => {
    alert("Alabanza agregada.");
    location.reload();
  });
};
