const addBtn = document.getElementById('addNote');
const deleteBtn = document.getElementById('deleteAll');
const exportBtn = document.getElementById('exportNotes');
const container = document.getElementById('noteContainer');

const pastelColors = [
  '#FFD3B6', '#FFAAA5', '#FF8C94', '#E0BBE4',
  '#D5AAFF', '#B5EAD7', '#C7CEEA', '#FDFD97', '#FFDAC1'
];

function createNote() {
  const note = document.createElement('div');
  note.classList.add('note');
  note.style.backgroundColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

  const editable = document.createElement('div');
  editable.contentEditable = true;
  editable.innerText = 'Click to write...';

  // Sanitize pasted text (no styles or colors)
  editable.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  // Delete One Note
  const deleteOne = document.createElement('button');
  deleteOne.textContent = '🗑️';
  deleteOne.onclick = () => note.remove();

  // Speak Note Text
  const speakBtn = document.createElement('button');
  speakBtn.textContent = '🔊 Speak';
  speakBtn.onclick = () => {
    const text = editable.innerText.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    editable.classList.add('speaking');
    utterance.onend = () => editable.classList.remove('speaking');
    speechSynthesis.speak(utterance);
  };

  // Voice-to-Text (SpeechRecognition)
  const micBtn = document.createElement('button');
  micBtn.textContent = '🎙️ Record';

  let recognition;
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    micBtn.onclick = () => {
      if (micBtn.classList.contains('recording')) {
        recognition.stop();
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎙️ Record';
      } else {
        recognition.start();
        micBtn.classList.add('recording');
        micBtn.textContent = '⏹️ Stop';

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          editable.innerText = transcript;
        };
      }
    };
  } else {
    micBtn.disabled = true;
    micBtn.textContent = '🎙️ Not Supported';
  }

  // Append to note
  note.appendChild(editable);
  note.appendChild(deleteOne);
  note.appendChild(speakBtn);
  note.appendChild(micBtn);
  container.appendChild(note);
}

// Add new note
addBtn.addEventListener('click', createNote);

// Delete all notes
deleteBtn.addEventListener('click', () => {
  container.innerHTML = '';
});

// Export notes to text file
exportBtn.addEventListener('click', () => {
  const notes = document.querySelectorAll('.note div[contenteditable]');
  const text = Array.from(notes).map(note => note.innerText.trim()).join('\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = 'doodle_notes.txt';
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
});
