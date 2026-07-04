import React from "react";

function NoteCard({ note, onDelete }) {
  return (
    <article className="note-card">
      <div className="note-header">
        <span className="note-subject">{note.subject}</span>
        <button className="delete-button" onClick={onDelete}>
          Delete
        </button>
      </div>
      <h3>{note.title}</h3>
      <p>{note.content}</p>
    </article>
  );
}

export default NoteCard;
