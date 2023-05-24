// Required libraries
const PORT = process.env.PORT || 3001; // setting the port to environment port or 3001
const fs = require('fs'); // file system library
const path = require('path'); // path library

const express = require('express'); // express library
const app = express(); // creating express app

// Load existing notes from file
const allNotes = require('./db/db.json'); 

// Middleware setup
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(express.json()); // to parse JSON bodies
app.use(express.static('public')); // to serve static files from the 'public' directory

// API endpoints
app.get('/api/notes', (req, res) => { // returning all notes
    res.json(allNotes.slice(1)); // excluding the first element which is used to store next ID
});

// Route for root path
app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, './public/index.html')); // serving the index.html
});

// Route for notes page
app.get('/notes', (req, res) => { 
    res.sendFile(path.join(__dirname, './public/notes.html')); // serving the notes.html
});

// Fallback route
app.get('*', (req, res) => { // handling any unmatched routes
    res.sendFile(path.join(__dirname, './public/index.html')); // serving the index.html
});

// Function to create a new note
function createNewNote(body, notesArray) {
    const newNote = body; 
    if (!Array.isArray(notesArray))
        notesArray = []; // making sure notesArray is an array
    
    if (notesArray.length === 0)
        notesArray.push(0); // initializing with 0 if array is empty

    body.id = notesArray[0]; // assigning the id for new note
    notesArray[0]++; // incrementing the id for next note

    notesArray.push(newNote); // adding the new note to array
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesArray, null, 2) // updating the JSON file with new notes array
    );
    return newNote; // returning the new note
}

// API endpoint to create a new note
app.post('/api/notes', (req, res) => {
    const newNote = createNewNote(req.body, allNotes); // creating new note from request body
    res.json(newNote); // sending the new note as response
});

// Function to delete a note
function deleteNote(id, notesArray) {
    for (let i = 0; i < notesArray.length; i++) {
        let note = notesArray[i];

        if (note.id == id) { // finding the note with the requested id
            notesArray.splice(i, 1); // removing the note from array
            fs.writeFileSync(
                path.join(__dirname, './db/db.json'),
                JSON.stringify(notesArray, null, 2) // updating the JSON file with the modified notes array
            );

            break;
        }
    }
}

// API endpoint to delete a note
app.delete('/api/notes/:id', (req, res) => {
    deleteNote(req.params.id, allNotes); // deleting the note with requested id
    res.json(true); // sending true as response
});

// Starting the server
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)}); // console log
