
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://alabanzasemmanuel2-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const display = document.getElementById("display");

onValue(ref(db, 'currentSongCantante'), snapshot => {
  const song = snapshot.val();
  if (!song) return display.textContent = "No hay alabanza.";
  const lines = song.text.split("\n");
  let html = `<strong>${song.title}</strong><br><br><pre>`;
  for (const line of lines) html += line + "\n";
  html += "</pre>";
  display.innerHTML = html;
});
