// Selectors for elements in the /notes route
let noteTitle, noteText, saveNoteBtn, newNoteBtn, noteList;

// Select DOM elements if the page is '/notes'
if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Helper functions to show or hide an element
const show = (elem) => { elem.style.display = 'inline'; };
const hide = (elem) => { elem.style.display = 'none'; };

// This object will store the currently active note (one being edited or viewed)
let activeNote = {};

// Function to get notes from the server
const getNotes = () => fetch('/api/notes', { method: 'GET', headers: { 'Content-Type': 'application/json' } });

// Function to save a note to the server
const saveNote = (note) => fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) });

// Function to delete a note from the server
const deleteNote = (id) => fetch(`/api/notes/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });

// Function to display the active note in the input fields for viewing or editing
const renderActiveNote = () => {
  // If there's an active note, make input fields readonly and populate them with note data, else make them editable and empty
  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
    hide(saveNoteBtn);
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
    show(saveNoteBtn);
  }
};

// Function to handle saving a note when the save button is clicked
const handleNoteSave = () => {
  const newNote = { title: noteTitle.value, text: noteText.value };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Function to handle deleting a note when the delete button is clicked
const handleNoteDelete = (e) => {
  e.stopPropagation();
  const noteId = JSON.parse(e.target.parentElement.getAttribute('data-note')).id;
  if (activeNote.id === noteId) activeNote = {};
  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Function to handle setting the active note when a note is clicked in the list
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Function to handle creating a new note
const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

// Function to show the save button only when both fields have text
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) hide(saveNoteBtn);
  else show(saveNoteBtn);
};

// Function to render the list of notes on the sidebar
const renderNoteList = async (notes) => {
  let jsonNotes =   await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Helper function to create a new list item for a note
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);
      liEl.append(delBtnEl);
    }

    return liEl;
  };

  // If there are no notes, create a list item stating there are no saved notes
  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  // Create a list item for each note
  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);
    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Function to get the notes and render them on the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

// If on the /notes page, add event listeners to buttons and input fields
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

// Initially get and render notes when the page loads
getAndRenderNotes();

