import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteCard from "./list";

function Subject() {
  const [note, setNote] = useState({ title: "", subject: "", content: "" });
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadNotes() {
      try {
        const response = await axios.get(`${apiUrl}/api/notes`, { withCredentials: true });
        setNotes(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/");
        } else {
          setError("Unable to load notes");
        }
      }
    }

    loadNotes();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    if (!note.subject || !note.title || !note.content) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/notes`, note, { withCredentials: true });
      setNotes((prev) => [response.data, ...prev]);
      setNote({ title: "", subject: "", content: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save note.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/notes/${id}`, { withCredentials: true });
      setNotes((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError("Unable to delete note.");
    }
  };

  const handleLogout = async () => {
    await axios.post(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true });
    navigate("/");
  };

  return (
    <main className="subject-page">
      <header className="subject-header">
        <div>
          <h1>Smart Study Notes</h1>
          <p>Capture your subjects, titles, and ideas in one place.</p>
        </div>
        <button className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="note-form-card">
        <h2>Create a note</h2>

        <form onSubmit={handleSave} className="note-form">
          <input
            name="subject"
            type="text"
            placeholder="Subject"
            value={note.subject}
            onChange={handleChange}
          />
          <input
            name="title"
            type="text"
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
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-button">
            Save note
          </button>
        </form>
      </section>

      <section className="notes-grid">
        {notes.length === 0 ? (
          <div className="empty-state">No notes yet. Add your first note.</div>
        ) : (
          notes.map((item) => (
            <NoteCard key={item._id} note={item} onDelete={() => handleDelete(item._id)} />
          ))
        )}
      </section>
    </main>
  );
}

export default Subject;
