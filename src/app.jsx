
import React from "react";
import { Routes, Route } from "react-router-dom";
import Access from "./account"; 
import Subject from "./subject"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Access />} />  
      <Route path="/subject" element={<Subject />} />
    </Routes>
  );
}

export default App;

