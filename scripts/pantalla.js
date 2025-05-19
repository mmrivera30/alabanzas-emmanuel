<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Pantalla de Alabanzas - Control Total</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      background-color: #f4f4f4;
    }
    .container {
      width: 100%;
      max-width: 800px;
      padding: 20px;
      box-sizing: border-box;
    }
    #display {
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      margin-top: 20px;
      text-align: left;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .chord {
      color: #e91e63;
      font-weight: bold;
    }
    textarea, input, select, button {
      width: 100%;
      font-size: 16px;
      margin: 10px 0;
      padding: 8px;
      box-sizing: border-box;
    }
    textarea {
      height: 220px;
      font-family: 'Courier New', monospace;
    }
    .admin {
      display: none;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pantalla de Alabanzas</h1>

    <!-- Botón para iniciar sesión -->
    

    <!-- Panel de administración -->
    <div class="admin" id="adminPanel" style="display:none;">
      <select id="globalViewMode">
        <option value="all">Mostrar letra con acordes</option>
        <option value="lyrics">Mostrar solo la letra</option>
      </select>
      <select id="songSelectorAdmin">
        <option value="">Selecciona una alabanza</option>
      </select>
      <button onclick="showAddForm()">Agregar nueva alabanza</button>
      <div id="addForm" style="display:none;">
        <input id="songTitle" type="text" placeholder="Título de la alabanza">
        <textarea id="songText" placeholder="Letra con acordes..."></textarea>
        <button onclick="addSong()">Guardar Alabanza</button>
      </div>
    </div>

    <!-- Lista para todos los usuarios -->
    <select id="songSelectorUser">
      <option value="">Selecciona una alabanza</option>
    </select>

    <div id="display">Cargando alabanza...</div>
  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
    import { getDatabase, ref, onValue, get, set, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
    import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyBJEPsI0xrYHM5YdbeO58IgiJ1ocCg1nBg",
      authDomain: "alabanzasemmanuel2.firebaseapp.com",
      databaseURL: "https://alabanzasemmanuel2-default-rtdb.firebaseio.com/",
      projectId: "alabanzasemmanuel2",
      storageBucket: "alabanzasemmanuel2.firebasestorage.app",
      messagingSenderId: "454013833170",
      appId: "1:454013833170:web:828b4a5179a042332cc20b"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    // No requiere autenticación // Reemplazar con tu UID real

    const loginBtn = document.getElementById('loginBtn');
    const adminPanel = document.getElementById('adminPanel');
    const songSelectorAdmin = document.getElementById('songSelectorAdmin');
    const songSelectorUser = document.getElementById('songSelectorUser');
    const globalViewMode = document.getElementById('globalViewMode');
    const display = document.getElementById('display');

    let allSongs = {};
    let viewMode = "all";

    // Mostrar letra de acuerdo al modo actual
    function renderSong(song) {
      if (!song) return display.textContent = "No hay alabanza.";
      const lines = song.text.split("\n");
      let html = `<strong>${song.title}</strong><br><br><pre>`;
      for (const line of lines) {
        const isChord = /^[A-G][#b]?m?(maj|min|dim|aug)?(\s|$)/.test(line.trim());
        if (viewMode === "lyrics" && isChord) continue;
        html += isChord && viewMode === "all"
          ? `<span class='chord'>${line}</span>\n`
          : `${line}\n`;
      }
      html += `</pre>`;
      display.innerHTML = html;
    }

    // Escuchar el modo de vista global
    onValue(ref(db, 'viewModeGlobal'), snapshot => {
      viewMode = snapshot.val() || "all";
      const currentKey = songSelectorUser.value || songSelectorAdmin.value;
      if (currentKey && allSongs[currentKey]) {
        renderSong(allSongs[currentKey]);
      }
    });

    // Escuchar todas las canciones
    onValue(ref(db, 'songs'), snapshot => {
      allSongs = snapshot.val() || {};
      [songSelectorUser, songSelectorAdmin].forEach(selector => {
        selector.innerHTML = '<option value="">Selecciona una alabanza</option>';
        for (const key in allSongs) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = allSongs[key].title;
          selector.appendChild(option);
        }
      });
    });

    songSelectorUser.addEventListener('change', () => {
      const key = songSelectorUser.value;
      if (key && allSongs[key]) renderSong(allSongs[key]);
    });

    songSelectorAdmin.addEventListener('change', () => {
      const key = songSelectorAdmin.value;
      if (key && allSongs[key]) {
        set(ref(db, 'currentSong'), allSongs[key]);
        renderSong(allSongs[key]);
      }
    });

    globalViewMode.addEventListener('change', () => {
      const newMode = globalViewMode.value;
      set(ref(db, 'viewModeGlobal'), newMode);
    });

    window.login = () => {};
      signInWithPopup(auth, provider)
        .then(result => {
          if (result.user.uid === ALLOWED_UID) // oculto para vista pública
          else alert("No tienes permisos para administrar.");
        })
        .catch(err => alert("Error de autenticación: " + err.message));
    };

    onAuthStateChanged(auth, user => { return;
      if (user && user.uid === ALLOWED_UID) // oculto para vista pública
    });

    function showAdminPanel() {
      adminPanel.style.display = 'block';
      loginBtn.style.display = 'none';
    }

    window.showAddForm = () => {
      document.getElementById('addForm').style.display = 'block';
    };

    window.addSong = () => {
      const title = document.getElementById('songTitle').value.trim();
      const text = document.getElementById('songText').value;
      if (!title || !text) return alert("Completa todos los campos.");
      const key = title.toLowerCase().replace(/\s+/g, "_");
      const songData = { title, text };
      const updates = {};
      updates['/songs/' + key] = songData;
      updates['/currentSong'] = songData;
      update(ref(db), updates).then(() => {
        alert("Alabanza agregada.");
        location.reload();
      });
    };
  </script>
</body>
</html>