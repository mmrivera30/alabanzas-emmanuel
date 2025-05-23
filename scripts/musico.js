import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

const songSelector = document.getElementById("songSelectorAdmin");
const displayTitle = document.getElementById("displayTitle");
const displayPre = document.getElementById("displayPre");
const editBlock = document.getElementById("editBlock");
const editTitle = document.getElementById("editTitle");
const editText = document.getElementById("editText");
const editMessage = document.getElementById("editMessage");

let allSongs = {};
let currentKey = null;

// Cargar canciones
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

// Mostrar canción y preparar edición
songSelector?.addEventListener('change', () => {
  const key = songSelector.value;
  currentKey = key;
  if (key && allSongs[key]) {
    const { title, text } = allSongs[key];
    renderSong({ title, text });
    // Rellenar edición
    editTitle.value = title;
    editText.value = text;
    editBlock.style.display = 'block';
    editMessage.textContent = '';
  } else {
    displayTitle.textContent = "";
    displayPre.textContent = "";
    editBlock.style.display = 'none';
  }
});

function renderSong(song) {
  if (!song) {
    displayTitle.textContent = "";
    displayPre.textContent = "No hay alabanza.";
    return;
  }
  displayTitle.textContent = song.title || "";
  // Resalta acordes en líneas que parecen acordes
  const lines = (song.text || "").split("\n");
  let html = "";
  for (const line of lines) {
    const isChord = /^[A-G][#b]?m?(maj|min|dim|aug)?(\s|$)/.test(line.trim());
    if (isChord && line.trim() !== "") {
      html += `<span class="chord">${line}</span>\n`;
    } else {
      html += line + "\n";
    }
  }
  displayPre.innerHTML = html;
}

// Guardar cambios
window.guardarEdicion = () => {
  if (!currentKey) return alert("No hay canción seleccionada.");
  const title = editTitle.value.trim();
  const text = editText.value; // NO usar .trim()
  if (!title || !text) return alert("Completa todos los campos.");
  set(ref(db, 'songsMusico/' + currentKey), { title, text }).then(() => {
    editMessage.textContent = "¡Modificación guardada!";
    editMessage.className = "success";
    renderSong({ title, text });
    // Actualizar selector
    songSelector.querySelector(`[value='${currentKey}']`).textContent = title;
    // Opcional: actualiza currentSongMusico para la pantalla de músicos
    set(ref(db, 'currentSongMusico'), { title, text });
    // Refrescar lista local
    allSongs[currentKey] = { title, text };
  });
};

// Borrar canción
window.borrarCancion = () => {
  if (!currentKey) return alert("No hay canción seleccionada.");
  if (!confirm("¿Seguro que quieres borrar esta alabanza?")) return;
  remove(ref(db, 'songsMusico/' + currentKey)).then(() => {
    editMessage.textContent = "¡Canción borrada!";
    editMessage.className = "success";
    editBlock.style.display = 'none';
    songSelector.value = "";
    displayTitle.textContent = "";
    displayPre.textContent = "";
    set(ref(db, 'currentSongMusico'), { title: "", text: "" });
    // Remover de lista local
    delete allSongs[currentKey];
    // Refrescar selector
    songSelector.innerHTML = '<option value="">Selecciona una alabanza</option>';
    Object.keys(allSongs).forEach(key => {
      const song = allSongs[key];
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = song.title;
      songSelector.appendChild(opt);
    });
  });
};
