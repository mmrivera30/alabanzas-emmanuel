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
        <button class="btn-edit" onclick="editarLetras('${key}')">✏️ Editar Letras</button>
        <button class="btn-edit" onclick="editarLetrasYAcordes('${key}')">✏️ Editar Letras y Acordes</button>
        <button class="btn-delete" onclick="eliminar('${key}')">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function editarLetras(key) {
  const song = todasLasAlabanzas[key];
  const nuevaLetra = prompt("Edita solo las letras (sin acordes):", filtrarSoloLetras(song.text || ""));
  if (nuevaLetra !== null) {
    const textoConAcordes = song.text || "";
    const textoActualizado = textoConAcordes.replace(/(^|\n)\[.*?\]/g, ""); // Reemplaza solo las letras
    set(ref(db, 'songsCantante/' + key), {
      title: song.title,
      text: textoActualizado
    }).then(() => {
      alert("Letras actualizadas correctamente.");
      cargarAlabanzas();
    });
  }
}

function editarLetrasYAcordes(key) {
  const song = todasLasAlabanzas[key];
  const nuevoTexto = prompt("Edita las letras y acordes:", song.text || "");
  if (nuevoTexto !== null) {
    set(ref(db, 'songsCantante/' + key), {
      title: song.title,
      text: nuevoTexto
    }).then(() => {
      alert("Letras y acordes actualizados correctamente.");
      cargarAlabanzas();
    });
  }
}

window.eliminar = (key) => {
  if (confirm("¿Seguro que deseas eliminar esta alabanza?")) {
    remove(ref(db, 'songsCantante/' + key)).then(() => {
      alert("Alabanza eliminada correctamente.");
      cargarAlabanzas();
    });
  }
};
