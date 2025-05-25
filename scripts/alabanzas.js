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

const UID_AUTORIZADO =["lWrfrkQSxeNX1JbavN8djnQ3fg62", "lO3MhmpBIdeVwdUyI9oRGCZizj32"];
let letras = {};
let acordes = {};
const lista = document.getElementById("listaAlabanzas");
const filtro = document.getElementById("filtroTipo");

window.login = () => {
  signInWithPopup(auth, provider).catch(e => alert("Error al iniciar sesión: " + e.message));
};

onAuthStateChanged(auth, user => {
  if (UID_AUTORIZADO.includes(user?.uid)) {
    cargarDatos();
  } else {
    alert("Acceso restringido.");
    window.location.href = "index.html";
  }
});

function cargarDatos() {
  onValue(ref(db, 'songsCantante'), snapshot => {
    letras = snapshot.val() || {};
    onValue(ref(db, 'songsMusico'), snap => {
      acordes = snap.val() || {};
      mostrarAlabanzas();
    });
  });
}

filtro?.addEventListener("change", mostrarAlabanzas);

function mostrarAlabanzas() {
  lista.innerHTML = "";
  const tipo = filtro.value;

  const keys = new Set([
    ...Object.keys(letras || {}),
    ...Object.keys(acordes || {})
  ]);

  [...keys].forEach(key => {
    const letra = letras[key];
    const cancion = acordes[key];
    const existeLetras = letra && letra.text;
    const existeAcordes = cancion && cancion.text;

    if (tipo === "letras" && !existeLetras) return;
    if (tipo === "acordes" && !existeAcordes) return;
    if (tipo === "todas" && !existeLetras && !existeAcordes) return;

    const card = document.createElement("div");
    card.className = "alabanza-card";
    card.innerHTML = `
      <div class="card-header">
        <h2>${letra?.title || cancion?.title || key}</h2>
        <span class="badge">${existeLetras ? "🎤 Letras" : ""} ${existeAcordes ? "🎸 Acordes" : ""}</span>
      </div>
      <div class="card-footer">
        ${existeLetras ? `<button class="btn-edit" data-key="${key}">✏️ Editar</button>` : ""}
        <button class="btn-delete" data-key="${key}">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => abrirPopUpEditar(btn.dataset.key);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => confirmarEliminar(btn.dataset.key);
  });
}

function abrirPopUpEditar(key) {
  const song = letras[key];
  const textoInicial = (song?.text || "").replace(/\[.*?\]/g, "");
  const html = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>Editar Letras</h2>
        <input id="songTitle" value="${song.title}" placeholder="Título" />
        <textarea id="songText" rows="10">${textoInicial}</textarea>
        <div class="popup-buttons">
          <button id="saveChanges">Guardar</button>
          <button id="cancelChanges">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  estiloPopup();

  document.getElementById('saveChanges').onclick = () => guardarEdicion(key);
  document.getElementById('cancelChanges').onclick = cerrarPopUp;
}

function guardarEdicion(key) {
  const title = document.getElementById("songTitle").value.trim();
  const text = document.getElementById("songText").value.trim();
  if (!title || !text) return alert("Completa los campos");
  set(ref(db, 'songsCantante/' + key), { title, text }).then(() => {
    cerrarPopUp();
    cargarDatos();
  });
}

function confirmarEliminar(key) {
  const html = `
    <div class="popup-overlay">
      <div class="popup-container">
        <h2>¿Qué deseas eliminar?</h2>
        <p>Selecciona si deseas eliminar solo la letra o también la alabanza con acordes.</p>
        <div class="popup-buttons">
          <button id="deleteLyrics">🧾 Solo letras</button>
          <button id="deleteBoth">🎵 Letra y acordes</button>
          <button id="cancelDelete">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  estiloPopup();
  document.getElementById("deleteLyrics").onclick = () => eliminarSoloCantante(key);
  document.getElementById("deleteBoth").onclick = () => eliminarAmbas(key);
  document.getElementById("cancelDelete").onclick = cerrarPopUp;
}

function eliminarSoloCantante(key) {
  remove(ref(db, 'songsCantante/' + key)).then(() => {
    cerrarPopUp();
    cargarDatos();
  });
}

function eliminarAmbas(key) {
  const updates = {
    [`songsCantante/${key}`]: null,
    [`songsMusico/${key}`]: null
  };
  set(ref(db), updates).then(() => {
    cerrarPopUp();
    cargarDatos();
  });
}

function cerrarPopUp() {
  document.querySelector(".popup-overlay")?.remove();
}

function estiloPopup() {
  const s = document.createElement("style");
  if (document.head.contains(s)) return;
  s.textContent = `.popup-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;}
.popup-container{background:white;border-radius:12px;padding:20px;width:90%;max-width:500px;box-shadow:0 4px 20px rgba(0,0,0,0.2);}
.popup-container input,.popup-container textarea{width:100%;margin:8px 0;padding:10px;border-radius:6px;border:1px solid #ccc;}
.popup-buttons{display:flex;justify-content:flex-end;gap:10px;margin-top:12px;}
.popup-buttons button{padding:8px 14px;border-radius:6px;border:none;font-weight:bold;cursor:pointer;background:#313293;color:white;}
.popup-buttons button:hover{opacity:0.9;}
.alabanza-card{background:#fff;color:#313293;border-radius:12px;padding:14px 18px;margin:10px auto;max-width:680px;box-shadow:0 2px 6px #00000033;}
.card-header{display:flex;justify-content:space-between;align-items:center;}
.badge{background:#eee;color:#555;font-size:12px;padding:4px 8px;border-radius:12px;}
.card-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:12px;}
.btn-edit,.btn-delete{border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:bold;}
.btn-edit{background-color:#4caf50;color:white;}
.btn-delete{background-color:#f44336;color:white;}`;
  document.head.appendChild(s);
}
