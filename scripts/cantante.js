
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  databaseURL: "https://alabanzasemmanuel2-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const CANTANTE_UIDS = ["lWrfrkQSxeNX1JbavN8djnQ3fg62", "lO3MhmpBIdeVwdUyI9oRGCZizj32"];
const songSelector = document.getElementById("songSelectorAdmin");
const adminPanel = document.getElementById("adminPanel");
const display = document.getElementById("display");
const addForm = document.getElementById("addForm");

let allSongs = {};

function renderSong(song) {
  const lines = song.text.split("\n");
  let html = `<strong>\${song.title}</strong><br><br><pre>`;
  for (const line of lines) {
    html += line + "\n";
  }
  html += "</pre>";
  display.innerHTML = html;
}

function loadSongs() {
  onValue(ref(db, 'songsCantante'), snapshot => {
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
    set(ref(db, 'currentSongCantante'), song);
    renderSong(song);
  }
});

window.login = () => {
  signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, user => {
  if (user && CANTANTE_UIDS.includes(user.uid)) {
    adminPanel.style.display = 'block';
    loadSongs();
  } else {
    alert("Acceso restringido al cantante.");
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
  set(ref(db, 'songsCantante/' + key), { title, text });
  document.getElementById("songTitle").value = "";
  document.getElementById("songText").value = "";
  addForm.style.display = 'none';
};
