import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteCard from "./list";

function Subject() {
  const [note, setNote] = useState({
    title: "",
    subject: "",
    content: "",
  });

  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* =========================
     LOAD NOTES
  ========================= */
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await axios.get("/api/notes", { withCredentials: true });

        setNotes(res.data);
      } catch (err) {
        console.log("Load notes error:", err.response?.status);

        if (err.response?.status === 401) {
          navigate("/");
        } else {
          setError("Unable to load notes");
        }
      }
    };

    loadNotes();
  }, [navigate]);

  /* =========================
     INPUT HANDLER
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================
     SAVE NOTE
  ========================= */
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!note.subject || !note.title || !note.content) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await axios.post("/api/notes", note, { withCredentials: true });

      setNotes((prev) => [res.data, ...prev]);
      setNote({ title: "", subject: "", content: "" });
    } catch (err) {
      console.log("Save error:", err.response?.status);
      setError(err.response?.data?.error || "Unable to save note.");
    }
  };

  /* =========================
     DELETE NOTE
  ========================= */
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`, { withCredentials: true });

      setNotes((prev) =>
        prev.filter((n) => n._id !== id)
      );
    } catch (err) {
      setError("Unable to delete note.");
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });

      navigate("/");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <main className="subject-page">
      <header className="subject-header">
        <div>
          <h1>Smart Study Notes</h1>
          <p>Capture your ideas in one place.</p>
        </div>

        <button
          className="secondary-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* CREATE NOTE */}
      <section className="note-form-card">
        <h2>Create a note</h2>

        <form onSubmit={handleSave} className="note-form">
          <input
            name="subject"
            placeholder="Subject"
            value={note.subject}
            onChange={handleChange}
          />

          <input
            name="title"
            placeholder="Title"
            value={note.title}
            onChange={handleChange}
          />

          <textarea
            name="content"
            placeholder="Content"
            value={note.content}
            onChange={handleChange}
          />

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button type="submit" className="primary-button">
            Save Note
          </button>
        </form>
      </section>

      {/* NOTES LIST */}
      <section className="notes-grid">
        {notes.length === 0 ? (
          <div className="empty-state">
            No notes yet. Create your first one.
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDelete={() => handleDelete(note._id)}
            />
          ))
        )}
      </section>
    </main>
  );
}

export default Subject;