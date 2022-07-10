"use strict";

const kana = document.querySelector('#kana');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'ja-JP';

recognition.addEventListener('result', event => kana.innerHTML = event.results[0][0].transcript);
recognition.addEventListener('end', recognition.start);

recognition.start();