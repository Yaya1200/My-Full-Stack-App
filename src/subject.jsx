import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './subject.css';
import List1 from "./list";
import AddIcon from '@mui/icons-material/Add';
import Zoom from '@mui/material/Zoom';
import HighlightIcon from '@mui/icons-material/Highlight';
import axios from "axios";

function Subject() {
  const [inputs, setinputs] = useState({ title: "", subject: "", content: "" });
  const [arrayinput, setarrayinput] = useState([]);
  const [isexpanded, setisexpanded] = useState(false);
    
  function setinputvalues(event) {
    const { name, value } = event.target;
    setinputs((pre) => ({ ...pre, [name]: value }));
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/data`);
        setarrayinput(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  async function addarray() {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/data`, inputs);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/data`);
      setarrayinput(response.data);
      setinputs({ title: "", subject: "", content: "" });
    } catch (error) {
      console.error("Error", error);
    }
  }

  async function deleteitems(id1) {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/data/${id1}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/data`);
      setarrayinput(response.data);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  }

  function expanded() {
    setisexpanded(true);
  }

  return (
    <div className="p-3 mb-2 min-vh-100 bg-warning-subtle text-warning-emphasis">
      <div className="col-md-10">
        <div className="font-monospace mb-3" style={{ width: '6rem' }}>
          <HighlightIcon /> notes
        </div>

        <div className="col-12 col-md-6">
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="subjectInput"
              placeholder="Subject"
              name="subject"
              value={inputs.subject}
              onChange={setinputvalues}
              onClick={expanded}
            />
            <label htmlFor="subjectInput">Subject</label>
          </div>

          {isexpanded && (
            <>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="titleInput"
                  placeholder="Title"
                  name="title"
                  value={inputs.title}
                  onChange={setinputvalues}
                />
                <label htmlFor="titleInput">Title</label>
              </div>

              <div className="form-floating mb-3">
                <textarea
                  className="form-control"
                  placeholder="Content"
                  id="contentInput"
                  style={{ height: '100px' }}
                  name="content"
                  value={inputs.content}
                  onChange={setinputvalues}
                ></textarea>
                <label htmlFor="contentInput">Content</label>
              </div>

              <Zoom in={isexpanded}>
                <button
                  onClick={addarray}
                  type="button"
                  className="btn btn-outline-info d-block ms-auto">
                  <AddIcon />
                </button>
              </Zoom>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {arrayinput.map((values) => (
          <List1
            key={values._id}
            id1={values._id}
            title={values.title}
            subject={values.subject}
            content={values.content}
            ondelete={() => deleteitems(values._id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Subject;
