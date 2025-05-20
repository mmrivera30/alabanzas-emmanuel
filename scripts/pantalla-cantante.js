
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyBJEPsI0xrYHM5YdbeO58IgiJ1ocCg1nBg",
  authDomain: "alabanzasemmanuel2.firebaseapp.com",
  databaseURL: "https://alabanzasemmanuel2-default-rtdb.firebaseio.com/"
});
const db = getDatabase(app);
const display = document.getElementById('display');

function renderSong(song) {
  if (!song) return display.textContent = "No hay alabanza.";
  const lines = song.text.split("\n");
  let html = `<strong>${song.title}</strong><br><br><pre>`;
  for (const line of lines) {
    const isChord = /^[A-G][#b]?m?(maj|min|dim|aug)?(\s|$)/.test(line.trim());
    if (!isChord) html += `${line}\n`;
  }
  html += `</pre>`;
  display.innerHTML = html;
}

onValue(ref(db, 'currentSongCantante'), snapshot => renderSong(snapshot.val()));
