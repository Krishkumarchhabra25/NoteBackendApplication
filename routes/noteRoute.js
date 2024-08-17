const express = require("express");
const { addNote, updateNote, getAllNotes, getNote, deleteNote, updatePinnedStatus } = require("../Controllers/noteController");
const { authenticateToken } = require("../utilites");

const router = express.Router();

router.post("/add-note", authenticateToken, addNote);
router.put("/update-note/:noteId", authenticateToken, updateNote);
router.get("/get-all-notes", authenticateToken, getAllNotes);
router.get("/get-note/:noteId", authenticateToken, getNote);
router.delete("/delete-note/:noteId", authenticateToken, deleteNote);
router.put("/update-pinned-status/:noteId", authenticateToken, updatePinnedStatus);

module.exports = router;
