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
let alabanzaSeleccionada = null;

const lista = document.getElementById("listaAlabanzas");
const fechaInput = document.getElementById("fechaServicio");

function mostrarAlabanzas() {
  lista.innerHTML = "";
  Object.entries(todasLasAlabanzas).forEach(([key, { title, text }]) => {
    const card = document.createElement("div");
    card.className = "alabanza-card";
    card.innerHTML = `
      <h3>${title}</h3>
      <pre>${text}</pre>
      <div class="btn-row">
        <button class="btn-edit" onclick="editar('${key}')">✏️ Editar</button>
        <button class="btn-delete" onclick="eliminar('${key}')">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function cargarAlabanzas() {
  onValue(ref(db, 'songsMusico'), snapshot => {
    todasLasAlabanzas = snapshot.val() || {};
    mostrarAlabanzas();
  });
}

window.editar = (key) => {
  const nuevaLetra = prompt("Edita el texto:", todasLasAlabanzas[key].text);
  if (nuevaLetra !== null) {
    set(ref(db, 'songsMusico/' + key), {
      title: todasLasAlabanzas[key].title,
      text: nuevaLetra
    });
  }
};

window.eliminar = (key) => {
  if (confirm("¿Seguro que deseas eliminar esta alabanza?")) {
    remove(ref(db, 'songsMusico/' + key));
  }
};

window.agregarAlabanzaADia = () => {
  const fecha = fechaInput.value;
  if (!fecha) return alert("Selecciona una fecha.");

  const titulo = prompt("Escribe el TÍTULO EXACTO de la alabanza a agregar:");
  const key = titulo?.toLowerCase().replace(/\s+/g, "_");

  if (!key || !todasLasAlabanzas[key]) {
    alert("No se encontró la alabanza con ese título.");
    return;
  }

  const alabanza = todasLasAlabanzas[key];
  set(ref(db, `songsPorDia/${fecha}/${key}`), alabanza)
    .then(() => alert("Alabanza agregada al servicio del día."))
    .catch(err => alert("Error al guardar: " + err.message));
};

// Autenticación
onAuthStateChanged(auth, user => {
  if (user?.uid === UID_AUTORIZADO) {
    cargarAlabanzas();
  } else {
    alert("Acceso restringido. No tienes permiso.");
    window.location.href = "index.html";
  }
});

if (!auth.currentUser) {
  signInWithPopup(auth, provider).catch(e => {
    alert("Error al iniciar sesión: " + e.message);
  });
}
