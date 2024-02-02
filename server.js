
// require in needed packages and files
const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    err ? res.status(500).send('Error reading file') : res.json(JSON.parse(data));
  });
});

// post route for when a new note is created
app.post("/api/notes", (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error reading file');
    }

    // Parse the existing JSON data into an array
    const existingData = JSON.parse(data);

    // Generate a new random UUID using uuidv4()
    const newNote = {
      id: uuidv4(), 
      title: req.body.title,
      text: req.body.text
    };

    // Push the new data into the array
    existingData.push(newNote);

    // Convert the modified array back to JSON
    const updatedData = JSON.stringify(existingData);

    // Write the updated data back to the file
    fs.writeFile('./db/db.json', updatedData, (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error writing to file');
      }

      res.json({ message: 'Note added successfully' });
    });
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const noteIdToDelete = req.params.id;

  // Read the existing data from the file
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error reading file');
    }

    // Parse the existing JSON data into an array
    const existingData = JSON.parse(data);

    // Find the index of the note with the specified id
    const indexToDelete = existingData.findIndex(note => note.id === noteIdToDelete);

    if (indexToDelete !== -1) {
      // Remove the note from the array
      existingData.splice(indexToDelete, 1);

      // Convert the modified array back to JSON
      const updatedData = JSON.stringify(existingData);

      // Write the updated data back to the file
      fs.writeFile('./db/db.json', updatedData, (err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Error writing to file');
        }
        res.json({ message: 'Note deleted successfully' });
      });
    } else {
      res.status(404).send('Note not found');
    }
  });
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
