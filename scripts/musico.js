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
const messageBox = document.createElement("div");
messageBox.id = "messageBox";
messageBox.style.cssText = "display:none;position:fixed;top:24px;left:50%;transform:translateX(-50%);background:#4caf50;color:white;padding:10px 30px;border-radius:8px;z-index:9999;font-size:16px;box-shadow:0 2px 12px #2223a355;";
document.body.appendChild(messageBox);

let allSongs = {};
let currentKey = null;

function showMessage(msg, success = true) {
  messageBox.textContent = msg;
  messageBox.style.background = success ? "#4caf50" : "#e74c3c";
  messageBox.style.display = "block";
  setTimeout(() => { messageBox.style.display = "none"; }, 1800);
}

function renderSong(song, key) {
  currentKey = key;
  displayTitle.textContent = song.title;
  const texto = song.text || "";
  const lineas = texto.split("\n");
  displayText.innerHTML = "";

  for (let linea of lineas) {
    const divLinea = document.createElement("div");
    divLinea.className = "linea";

    let contenido = linea.replace(/ /g, "\u00A0");

    contenido = contenido.replace(
      /(^|\s)([A-G][#b]?m?(?:aj|min|dim|aug|sus|add)?\d*)/g,
      (match, p1, p2) => {
        if (/^[A-G][#b]?m?(aj|min|dim|aug|sus|add)?\d*$/.test(p2)) {
          return p1 + `<span class="chord">${p2}</span>`;
        }
        return match;
      }
    );

    divLinea.innerHTML = contenido;
    displayText.appendChild(divLinea);
  }
}
// Copiar texto plano (sin HTML)
function copySongText(song) {
  navigator.clipboard.writeText(song.text || "").then(() => {
    showMessage("Alabanza copiada al portapapeles");
  });
}

function showEditForm(song, key) {
  addForm.style.display = "block";
  inputTitle.value = song.title;
  inputText.value = song.text;
  addForm.dataset.editing = key;
  window.scrollTo({top:0, behavior:"smooth"});
}

function hideEditForm() {
  addForm.style.display = "none";
  inputTitle.value = "";
  inputText.value = "";
  addForm.dataset.editing = "";
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
    showMessage("No se pudieron cargar las alabanzas. Verifica la conexión a Firebase.", false);
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
    const controls = document.getElementById("songControls");
    if (controls) controls.remove();
  }
});

window.login = () => {
  signInWithPopup(auth, provider).catch((error) =>
    showMessage("Error al iniciar sesión: " + error.message, false)
  );
};

onAuthStateChanged(auth, (user) => {
  const loginButton = document.getElementById("loginButton");
  if (user) {
    if (MUSICO_UIDS.includes(user.uid)) {
      adminPanel.style.display = "block";
      loadSongs();
    } else {
      showMessage("Acceso restringido al músico.", false);
    }
    if (loginButton) loginButton.style.display = "none";
  } else {
    if (loginButton) loginButton.style.display = "block";
  }
});

window.showAddForm = () => {
  hideEditForm();
  addForm.style.display = "block";
};

window.addSong = () => {
  const title = inputTitle.value.trim();
  const text = inputText.value.trim();
  if (!title || !text) return showMessage("Completa todos los campos.", false);

  const editingKey = addForm.dataset.editing;
  const key = editingKey || title.toLowerCase().replace(/\s+/g, "_");

  set(ref(db, "songsMusico/" + key), { title, text }).then(() => {
    hideEditForm();
    renderSong({ title, text }, key);
    songSelector.value = key;
    showMessage(editingKey ? "Alabanza editada con éxito" : "Alabanza guardada con éxito");
  });
};
