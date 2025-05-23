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
const editDeleteButtons = document.getElementById("editDeleteButtons");
const songSelector = document.getElementById("songSelectorAdmin");
const addForm = document.getElementById("addForm");
const inputTitle = document.getElementById("songTitle");
const inputText = document.getElementById("songText");
const adminPanel = document.getElementById("adminPanel");

let allSongs = {};
let currentKey = null;

function renderSong(song, key) {
  currentKey = key;
  displayTitle.textContent = song.title;
  displayText.textContent = song.text || "";
  editDeleteButtons.style.display = 'flex';
  ajustarFuenteLetra();
}

function ajustarFuenteLetra() {
  const letraDiv = displayText;
  if (!letraDiv) return;
  let fontSize = 14;
  letraDiv.style.fontSize = fontSize + 'px';
  const displayBox = display.getBoundingClientRect();
  const titleHeight = displayTitle.offsetHeight;

  while (
    (letraDiv.scrollHeight > (display.clientHeight - titleHeight - 10) || letraDiv.scrollWidth > displayBox.width)
    && fontSize > 8
  ) {
    fontSize--;
    letraDiv.style.fontSize = fontSize + "px";
  }
}

function loadSongs() {
  onValue(ref(db, 'songsMusico'), snapshot => {
    allSongs = snapshot.val() || {};
    songSelector.innerHTML = '<option value="">Selecciona una alabanza</option>';
    Object.entries(allSongs).forEach(([key, song]) => {
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
    renderSong({ title, text }, key);
  } else {
    displayTitle.textContent = "";
    displayText.textContent = "Selecciona una alabanza.";
    editDeleteButtons.style.display = 'none';
  }
});

window.login = () => {
  signInWithPopup(auth, provider)
    .catch(error => alert("Error al iniciar sesión: " + error.message));
};

onAuthStateChanged(auth, user => {
  const loginButton = document.getElementById("loginButton");
  if (user) {
    if (MUSICO_UIDS.includes(user.uid)) {
      adminPanel.style.display = 'block';
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
    renderSong({ title, text }, key);
    songSelector.value = key;
  });
};

window.editarCancion = () => {
  if (!currentKey || !allSongs[currentKey]) return;
  const song = allSongs[currentKey];
  inputTitle.value = song.title;
  inputText.value = song.text;
  addForm.style.display = 'block';
};

window.eliminarCancion = () => {
  if (!currentKey) return;
  if (confirm("¿Estás seguro de eliminar esta alabanza?")) {
    remove(ref(db, 'songsMusico/' + currentKey)).then(() => {
      displayTitle.textContent = "";
      displayText.textContent = "Alabanza eliminada.";
      editDeleteButtons.style.display = 'none';
      songSelector.value = "";
    });
  }
};

window.addEventListener('resize', ajustarFuenteLetra);
