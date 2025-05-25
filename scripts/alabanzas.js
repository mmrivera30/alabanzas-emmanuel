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
  signInWithPopup(auth, provider).catch(e => alert("Error al iniciar sesión: " + e.message));
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
  return texto.replace(/\[.*?\]/g, "").trim();
}

function mostrarAlabanzas() {
  lista.innerHTML = "";
  Object.entries(todasLasAlabanzas).forEach(([key, { title, text }]) => {
    const letraSinAcordes = filtrarSoloLetras(text || "");
    const card = document.createElement("div");
    card.className = "alabanza-card";

    card.innerHTML = `
      <div class="card-header">
        <h2 class="preview-link" data-key="${key}">${title}</h2>
      </div>
      <div class="card-footer">
        <button class="btn-edit" data-key="${key}">✏️ Editar</button>
        <button class="btn-delete" data-key="${key}">🗑️ Eliminar</button>
      </div>
    `;

    lista.appendChild(card);
  });

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => abrirPopUpEditar(btn.dataset.key));
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => confirmarEliminar(btn.dataset.key));
  });

  document.querySelectorAll('.preview-link').forEach(h2 => {
    h2.addEventListener('click', () => {
      const song = todasLasAlabanzas[h2.dataset.key];
      const soloLetra = filtrarSoloLetras(song.text || "");
      const popUpHtml = `
        <div class="popup-overlay">
          <div class="popup-container">
            <h2>${song.title}</h2>
            <pre style="text-align:left; font-size:13px; line-height:1.4; white-space:pre-wrap; background:#f0f0f0; padding:10px; border-radius:8px; color:#333;">${soloLetra}</pre>
            <div class="popup-buttons">
              <button id="cancelVista" class="cancel-btn">Cerrar</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', popUpHtml);
      agregarEstilos();
      document.getElementById('cancelVista').addEventListener('click', cerrarPopUp);
    });
  });
}

function abrirPopUpEditar(key) {
  const song = todasLasAlabanzas[key];
  const textoInicial = filtrarSoloLetras(song.text || "");
  const popUpHtml = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>Editar Letras</h2>
        <form id="editForm">
          <label for="songTitle">Título</label>
          <input type="text" id="songTitle" value="${song.title}" required>
          <label for="songText">Texto</label>
          <textarea id="songText" rows="10" required>${textoInicial}</textarea>
          <div class="popup-buttons">
            <button type="button" id="saveChanges">Guardar</button>
            <button type="button" id="cancelChanges">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', popUpHtml);
  agregarEstilos();

  document.getElementById('saveChanges').addEventListener('click', () => guardarEdicion(key));
  document.getElementById('cancelChanges').addEventListener('click', cerrarPopUp);
}

function cerrarPopUp() {
  const popUp = document.querySelector('.popup-overlay');
  if (popUp) popUp.remove();
}

function guardarEdicion(key) {
  const nuevoTitulo = document.getElementById("songTitle").value.trim();
  const nuevoTexto = document.getElementById("songText").value.trim();

  if (!nuevoTitulo || !nuevoTexto) {
    alert("Completa todos los campos.");
    return;
  }

  set(ref(db, 'songsCantante/' + key), { title: nuevoTitulo, text: nuevoTexto });
  alert("Cambios guardados correctamente.");
  cerrarPopUp();
  cargarAlabanzas();
}

function confirmarEliminar(key) {
  const opcionesHtml = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>¿Qué deseas eliminar?</h2>
        <p style="font-size: 14px; margin-bottom: 10px;">Puedes borrar solo la letra (cantante), o también la versión con acordes (músico).</p>
        <div class="popup-buttons">
          <button id="deleteOnlyLyrics">🧾 Solo letra</button>
          <button id="deleteBoth">🎵 Letra y acordes</button>
          <button id="cancelDelete">❌ Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', opcionesHtml);
  agregarEstilos();

  document.getElementById('deleteOnlyLyrics').addEventListener('click', () => eliminarSoloCantante(key));
  document.getElementById('deleteBoth').addEventListener('click', () => eliminarAmbasVersiones(key));
  document.getElementById('cancelDelete').addEventListener('click', cerrarPopUp);
}

function eliminarSoloCantante(key) {
  remove(ref(db, 'songsCantante/' + key))
    .then(() => {
      alert("Letra eliminada correctamente.");
      cerrarPopUp();
      cargarAlabanzas();
    })
    .catch(() => {
      alert("Error al eliminar la letra.");
    });
}

function eliminarAmbasVersiones(key) {
  const updates = {
    [`songsCantante/${key}`]: null,
    [`songsMusico/${key}`]: null
  };
  set(ref(db), updates)
    .then(() => {
      alert("Letra y acordes eliminados correctamente.");
      cerrarPopUp();
      cargarAlabanzas();
    })
    .catch(() => {
      alert("Error al eliminar ambas versiones.");
    });
}

function agregarEstilos() {
  // Puedes mantener el estilo anterior aquí si ya lo tienes
}
