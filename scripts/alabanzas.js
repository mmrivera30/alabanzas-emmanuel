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
        <button class="btn-edit" onclick="abrirPopUpEditar('${key}', 'letras')">✏️ Editar Letras</button>
        <button class="btn-edit" onclick="abrirPopUpEditar('${key}', 'letrasYacordes')">✏️ Editar Letras y Acordes</button>
        <button class="btn-delete" onclick="confirmarEliminar('${key}')">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function abrirPopUpEditar(key, tipoEdicion) {
  const song = todasLasAlabanzas[key];
  const textoInicial = tipoEdicion === "letras" ? filtrarSoloLetras(song.text || "") : song.text || "";

  const popUpHtml = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>Editar ${tipoEdicion === "letras" ? "Letras" : "Letras y Acordes"}</h2>
        <form id="editForm">
          <label for="songTitle">Título</label>
          <input type="text" id="songTitle" value="${song.title}" required>
          <label for="songText">Texto</label>
          <textarea id="songText" required>${textoInicial}</textarea>
          <div class="popup-buttons">
            <button type="button" onclick="guardarEdicion('${key}', '${tipoEdicion}')">Guardar</button>
            <button type="button" onclick="cerrarPopUp()">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', popUpHtml);
  agregarEstilosPopUp();
}

function cerrarPopUp() {
  const popUp = document.querySelector('.popup-overlay');
  if (popUp) popUp.remove();
}

function guardarEdicion(key, tipoEdicion) {
  const nuevoTitulo = document.getElementById("songTitle").value.trim();
  const nuevoTexto = document.getElementById("songText").value.trim();

  if (!nuevoTitulo || !nuevoTexto) {
    alert("Completa todos los campos.");
    return;
  }

  if (tipoEdicion === "letras") {
    const letrasSinAcordes = filtrarSoloLetras(nuevoTexto);
    set(ref(db, 'songsCantante/' + key), { title: nuevoTitulo, text: letrasSinAcordes });
  } else {
    set(ref(db, 'songsCantante/' + key), { title: nuevoTitulo, text: nuevoTexto });
  }

  alert("Cambios guardados correctamente.");
  cerrarPopUp();
  cargarAlabanzas();
}

function confirmarEliminar(key) {
  const opcionesHtml = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>¿Qué deseas eliminar?</h2>
        <div class="popup-buttons">
          <button onclick="eliminar('${key}', 'letras')">Solo Letras</button>
          <button onclick="eliminar('${key}', 'todas')">Letras y Acordes</button>
          <button onclick="cerrarPopUp()">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', opcionesHtml);
  agregarEstilosPopUp();
}

function eliminar(key, tipoEliminacion) {
  if (tipoEliminacion === "letras") {
    const song = todasLasAlabanzas[key];
    const textoConAcordes = song.text || "";
    const textoActualizado = textoConAcordes.replace(/(^|\n)\[.*?\]/g, ""); // Solo elimina los acordes
    set(ref(db, 'songsCantante/' + key), { title: song.title, text: textoActualizado });
  } else if (tipoEliminacion === "todas") {
    remove(ref(db, 'songsCantante/' + key));
  }

  alert("Eliminación realizada correctamente.");
  cerrarPopUp();
  cargarAlabanzas();
}

function agregarEstilosPopUp() {
  const estilo = document.createElement('style');
  estilo.textContent = `
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .popup-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 400px;
      text-align: center;
    }
    .popup-buttons button {
      margin: 10px;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-color: #313293;
      color: white;
      cursor: pointer;
    }
    .popup-buttons button:hover {
      background-color: #2b2c80;
    }
  `;
  document.head.appendChild(estilo);
}
