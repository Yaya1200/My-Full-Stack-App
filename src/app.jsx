import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Access from "./account";
import Subject from "./subject";

function App() {
  return (
    <Routes>
        <Route path="/" element={<Access />} />
      <Route path="/subject" element={<Subject />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

