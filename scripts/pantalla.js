
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue, get, set, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
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

// No requiere autenticación

const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const songSelectorAdmin = document.getElementById('songSelectorAdmin');
const songSelectorUser = document.getElementById('songSelectorUser');
const globalViewMode = document.getElementById('globalViewMode');
const display = document.getElementById('display');

let allSongs = {};
let viewMode = "all";

function renderSong(song) {
  if (!song) return display.textContent = "No hay alabanza.";
  const lines = song.text.split("\n");
  let html = `<strong>${song.title}</strong><br><br><pre>`;
  for (const line of lines) {
    const isChord = /^[A-G][#b]?m?(maj|min|dim|aug)?(\s|$)/.test(line.trim());
    if (viewMode === "lyrics" && isChord) continue;
    html += isChord && viewMode === "all"
      ? `<span class='chord'>${line}</span>\n`
      : `${line}\n`;
  }
  html += `</pre>`;
  display.innerHTML = html;
}

onValue(ref(db, 'viewModeGlobal'), snapshot => {
  viewMode = snapshot.val() || "all";
  const currentKey = songSelectorUser.value || songSelectorAdmin.value;
  if (currentKey && allSongs[currentKey]) {
    renderSong(allSongs[currentKey]);
  }
});

onValue(ref(db, 'songs'), snapshot => {
  allSongs = snapshot.val() || {};
  [songSelectorUser, songSelectorAdmin].forEach(selector => {
    selector.innerHTML = '<option value="">Selecciona una alabanza</option>';
    for (const key in allSongs) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = allSongs[key].title;
      selector.appendChild(option);
    }
  });
});

songSelectorUser?.addEventListener('change', () => {
  const key = songSelectorUser.value;
  if (key && allSongs[key]) renderSong(allSongs[key]);
});

songSelectorAdmin?.addEventListener('change', () => {
  const key = songSelectorAdmin.value;
  if (key && allSongs[key]) {
    set(ref(db, 'currentSong'), allSongs[key]);
    renderSong(allSongs[key]);
  }
});

globalViewMode?.addEventListener('change', () => {
  const newMode = globalViewMode.value;
  set(ref(db, 'viewModeGlobal'), newMode);
});

window.login = () => {};
  signInWithPopup(auth, provider)
    .then(result => {
      if (result.user.uid === ALLOWED_UID) // oculto para vista pública
      else alert("No tienes permisos para administrar.");
    })
    .catch(err => alert("Error de autenticación: " + err.message));
};

onAuthStateChanged(auth, user => { return;
  if (user && user.uid === ALLOWED_UID) // oculto para vista pública
});

function showAdminPanel() {
  adminPanel.style.display = 'block';
  loginBtn.style.display = 'none';
}

window.showAddForm = () => {};
  document.getElementById('addForm').style.display = 'block';
};

window.addSong = () => {};
  const title = document.getElementById('songTitle').value.trim();
  const text = document.getElementById('songText').value;
  if (!title || !text) return alert("Completa todos los campos.");
  const key = title.toLowerCase().replace(/\s+/g, "_");
  const songData = { title, text };
  const updates = {};
  updates['/songs/' + key] = songData;
  updates['/currentSong'] = songData;
  update(ref(db), updates).then(() => {
    alert("Alabanza agregada.");
    location.reload();
  });
};
