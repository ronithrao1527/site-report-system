import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [dateTime, setDateTime] = useState("");

  const [formData, setFormData] = useState({
    siteName: "",
    engineerName: "",
    expenses: "",
    completion: "",
    remarks: "",
    requiredMaterial: ""
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setDateTime(new Date().toLocaleString("en-IN"));
    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      data.append("dateTime", dateTime);

      if (photo) {
        data.append("photo", photo);
      }

      await axios.post(
          "https://site-report-backend.onrender.com/submit-report",
          data
      );

      setMessage("✅ Report Submitted Successfully");

      setFormData({
        siteName: "",
        engineerName: "",
        expenses: "",
        completion: "",
        remarks: "",
        requiredMaterial: ""
      });

      setPhoto(null);
      setPreview(null);

    } catch (error) {

      console.error(error);

      setMessage("❌ Submission Failed");

    } finally {

      setLoading(false);
    }
  };

  return (
      <div className="container">

        <h1>🏗 Site Daily Report</h1>

        <p className="subtitle">
          Submit daily site progress, expenses and material requirements
        </p>

        {message && (
            <div className="status-box">
              {message}
            </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>Date & Time</label>
          <input
              type="text"
              value={dateTime}
              readOnly
          />

          <label>Site Name</label>
          <input
              type="text"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              required
          />

          <label>Engineer Name</label>
          <input
              type="text"
              name="engineerName"
              value={formData.engineerName}
              onChange={handleChange}
              required
          />

          <label>Work Expenses (₹)</label>
          <input
              type="number"
              name="expenses"
              value={formData.expenses}
              onChange={handleChange}
              required
          />

          <label>Work Completion (%)</label>
          <input
              type="number"
              name="completion"
              value={formData.completion}
              onChange={handleChange}
              min="0"
              max="100"
              required
          />

          <label>Remarks</label>
          <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
          />

          <label>Required Material</label>
          <textarea
              name="requiredMaterial"
              value={formData.requiredMaterial}
              onChange={handleChange}
          />

          <label>Upload Site Photo</label>

          <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
          />

          {preview && (
              <div className="preview-container">
                <img
                    src={preview}
                    alt="Preview"
                    className="preview-image"
                />
              </div>
          )}

          <button
              type="submit"
              disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>

        </form>

      </div>
  );
}

export default App;