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

const MUSICO_UIDS = "lO3MhmpBIdeVwdUyI9oRGCZizj32";
const songSelector = document.getElementById("songSelectorAdmin");
const adminPanel = document.getElementById("adminPanel");
const display = document.getElementById("display");
const addForm = document.getElementById("addForm");
const inputTitle = document.getElementById("songTitle");
const inputText = document.getElementById("songText");

let allSongs = {};

function renderSong(song) {
  const letra = song.text || "";
  display.innerHTML = `
    <div id="displayTitle" style="font-weight:bold; font-size:1.2em; margin-bottom:10px;">${song.title}</div>
    <pre id="displayText" style="font-family:inherit; white-space:pre-wrap; margin:0; word-break:break-word; overflow-wrap:break-word;"></pre>
  `;
  const pre = document.getElementById('displayText');
  if (pre) {
    pre.textContent = letra;
    ajustarFuenteLetra();
  }
}

function ajustarFuenteLetra() {
  const letraDiv = document.getElementById('displayText');
  if (!letraDiv) return;
  let fontSize = 20;
  letraDiv.style.fontSize = fontSize + 'px';
  const displayBox = display.getBoundingClientRect();
  const titleDiv = document.getElementById('displayTitle');
  const titleHeight = titleDiv ? titleDiv.offsetHeight : 0;
  while (
    (letraDiv.scrollHeight > (display.clientHeight - titleHeight - 10) || letraDiv.scrollWidth > displayBox.width)
    && fontSize > 8
  ) {
    fontSize -= 1;
    letraDiv.style.fontSize = fontSize + "px";
  }
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
    const { title, text } = allSongs[key];
    set(ref(db, 'currentSongMusico'), { title, text });
    renderSong({ title, text });
  } else {
    display.innerHTML = "";
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
  const title = inputTitle.value.trim();
  const text = inputText.value.trim();
  if (!title || !text) return alert("Completa todos los campos.");
  const key = title.toLowerCase().replace(/\s+/g, "_");
  set(ref(db, 'songsMusico/' + key), { title, text }).then(() => {
    inputTitle.value = "";
    inputText.value = "";
    addForm.style.display = 'none';
    renderSong({ title, text });
    songSelector.value = key;
  });
};

window.addEventListener('resize', ajustarFuenteLetra);

