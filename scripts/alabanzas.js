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

const UID_AUTORIZADO = "lO3MhmpBIdeVwdUyI9oRGCZizj32";
let todasLasAlabanzas = {};
const lista = document.getElementById("listaAlabanzas");

window.login = () => {
  signInWithPopup(auth, provider).catch(e => {
    alert("Error al iniciar sesión: " + e.message);
  });
};

onAuthStateChanged(auth, user => {
  if (user?.uid === UID_AUTORIZADO) {
    cargarAlabanzas();
  } else {
    alert("Acceso restringido.");
    window.location.href = "index.html";
  }
});

function cargarAlabanzas() {
  onValue(ref(db, 'songsCantante'), snapshot => {
    todasLasAlabanzas = snapshot.val() || {};
    mostrarAlabanzas();
  });
}

function filtrarSoloLetras(texto) {
  // Eliminar acordes entre corchetes como [G], [Am]
  return texto.replace(/\[.*?\]/g, "").trim();
}

function mostrarAlabanzas() {
  lista.innerHTML = "";
  Object.entries(todasLasAlabanzas).forEach(([key, { title, text }]) => {
    const letraSinAcordes = filtrarSoloLetras(text || "");
    const card = document.createElement("div");
    card.className = "alabanza-card";
    card.innerHTML = `
      <strong>${title}</strong>
      <p><strong>Con acordes:</strong> ${text || ""}</p>
      <p><strong>Sin acordes:</strong> ${letraSinAcordes}</p>
      <div class="btn-row">
        <button class="btn-edit" onclick="mostrarFormularioEdicion('${key}')">✏️ Editar</button>
        <button class="btn-delete" onclick="eliminar('${key}')">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function mostrarFormularioEdicion(key) {
  const song = todasLasAlabanzas[key];
  const formHtml = `
    <div class="edit-form-container">
      <h2>Editar Alabanza</h2>
      <form id="editSongForm">
        <label for="songTitle">Título</label>
        <input type="text" id="songTitle" name="songTitle" value="${song.title}" required>

        <label for="songText">Letra</label>
        <textarea id="songText" name="songText" required>${song.text}</textarea>

        <button type="button" onclick="guardarEdicion('${key}')">Guardar Cambios</button>
        <button type="button" onclick="cancelarEdicion()">Cancelar</button>
      </form>
    </div>
  `;
  lista.innerHTML = formHtml; // Reemplaza el contenido de la lista con el formulario
}

function guardarEdicion(key) {
  const title = document.getElementById("songTitle").value.trim();
  const text = document.getElementById("songText").value.trim();
  if (!title || !text) return alert("Completa todos los campos.");
  set(ref(db, 'songsCantante/' + key), { title, text }).then(() => {
    alert("Alabanza actualizada correctamente.");
    cargarAlabanzas(); // Recargar la lista después de guardar
  });
}

function cancelarEdicion() {
  cargarAlabanzas(); // Recargar la lista sin guardar cambios
}

window.eliminar = (key) => {
  if (confirm("¿Seguro que deseas eliminar esta alabanza?")) {
    remove(ref(db, 'songsCantante/' + key)).then(() => {
      alert("Alabanza eliminada correctamente.");
      cargarAlabanzas(); // Recargar la lista después de eliminar
    });
  }
};
