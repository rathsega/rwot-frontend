
import React, { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import Particle from "../Particle";
import { useBackground } from "../../context/BackgroundContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

function Contact() {
  const { setBgMode } = useBackground();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBgMode("dark");
  }, [setBgMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${baseUrl}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      alert(data.message);
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      console.log("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Container
        fluid
        style={{
          backgroundColor: "#000",
          color: "#fff",
          minHeight: "100vh",
          overflowX: "hidden",
          paddingTop: "150px",
          paddingBottom: "50px",
          position: "relative",
          zIndex: 1,
        }}
      >
<div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
<Particle />
</div>

        <div
          className="contact-wrapper"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "30px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left Section */}
          <div className="contact-left" style={{ maxWidth: "450px", flex: "1" }}>
            <h2 style={{ fontWeight: "bold" }}>Let's Connect</h2>
            <p>The best Financial advice we can give to someone who’s overwhelmed with their finances is:</p>
            <p style={{ fontStyle: "italic" }}>Ask for help</p>
            <p>Email:</p>
            <a href="mailto:ceosurya.besetti@myrwot.com" style={{ color: "#fff", display: "block" }}>
              ceosurya.besetti@myrwot.com
            </a>
            <a href="mailto:operations@myrwot.com" style={{ color: "#fff", display: "block" }}>
              operations@myrwot.com
            </a>
            <br />
            <p>Mobile:</p>
            <a href="tel:9565369369" style={{ color: "#fff", display: "block" }}>
              9565369369
            </a>
            <a href="tel:9063451369" style={{ color: "#fff", display: "block" }}>
              9063451369
            </a>
          </div>

          {/* Right Section */}
          <div
            className="contact-right"
            style={{
              maxWidth: "500px",
              flex: "1",
              backgroundColor: "#111",
              padding: "30px",
              borderRadius: "10px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <form onSubmit={handleSubmit} className="contact-form" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="name"
                placeholder="Name *"
                required
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                required
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
              />
              <textarea
                name="message"
                placeholder="Message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <Button
                type="submit"
                variant="light"
                disabled={isSubmitting}
                style={{ color: "#fff", fontSize: "14px", marginBottom: "15px" }}
              >
                {isSubmitting ? "Sending..." : "SUBMIT"}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Reusable input style
const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  backgroundColor: "#222",
  color: "#fff",
};

export default Contact;

