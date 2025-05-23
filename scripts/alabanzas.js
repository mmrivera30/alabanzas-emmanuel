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
    const letraSinAcordes = filtrarSoloLetras(text || ""); // Generar texto sin acordes
    const letraConAcordes = text || ""; // Mantener texto con acordes

    const card = document.createElement("div");
    card.className = "alabanza-card";

    // Mostrar ambas versiones en la pantalla
    card.innerHTML = `
      <strong>${title}</strong>
      <p><strong>Con acordes:</strong></p>
      <textarea readonly rows="3">${letraConAcordes}</textarea>
      <p><strong>Sin acordes:</strong></p>
      <textarea readonly rows="3">${letraSinAcordes}</textarea>
      <div class="btn-row">
        <button class="btn-edit" data-key="${key}" data-type="letras">✏️ Editar Letras</button>
        <button class="btn-edit" data-key="${key}" data-type="letrasYacordes">✏️ Editar Letras y Acordes</button>
        <button class="btn-delete" data-key="${key}">🗑️ Eliminar</button>
      </div>
    `;

    lista.appendChild(card);
  });

  // Vincular eventos a los botones
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => abrirPopUpEditar(btn.dataset.key, btn.dataset.type));
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => confirmarEliminar(btn.dataset.key));
  });
}

function abrirPopUpEditar(key, tipoEdicion) {
  const song = todasLasAlabanzas[key];
  let textoInicial;

  // Determinar el contenido basado en el tipo de edición
  if (tipoEdicion === "letras") {
    textoInicial = filtrarSoloLetras(song.text || ""); // Solo letras (sin acordes)
  } else if (tipoEdicion === "letrasYacordes") {
    textoInicial = song.text || ""; // Letras con acordes
  }

  const popUpHtml = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>Editar ${tipoEdicion === "letras" ? "Letras" : "Letras y Acordes"}</h2>
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
  agregarEstilosPopUp();

  document.getElementById('saveChanges').addEventListener('click', () => guardarEdicion(key, tipoEdicion));
  document.getElementById('cancelChanges').addEventListener('click', cerrarPopUp);
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
  const song = todasLasAlabanzas[key];
  const textoConAcordes = song.text || "";
  const textoSinAcordes = filtrarSoloLetras(textoConAcordes);

  const opcionesHtml = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>¿Qué deseas eliminar?</h2>
        <p><strong>Con acordes:</strong></p>
        <textarea readonly rows="5">${textoConAcordes}</textarea>
        <p><strong>Sin acordes:</strong></p>
        <textarea readonly rows="5">${textoSinAcordes}</textarea>
        <div class="popup-buttons">
          <button id="deleteLetras">Solo Letras</button>
          <button id="deleteAmbas">Letras y Acordes</button>
          <button id="cancelDelete">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', opcionesHtml);
  agregarEstilosPopUp();

  document.getElementById('deleteLetras').addEventListener('click', () => eliminar(key, 'letras'));
  document.getElementById('deleteAmbas').addEventListener('click', () => eliminar(key, 'todas'));
  document.getElementById('cancelDelete').addEventListener('click', cerrarPopUp);
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
      max-width: 500px;
      text-align: center;
    }
    .popup-container textarea {
      width: 100%;
      resize: none;
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
