// components/MissingInfoModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import apiFetch from "../utils/api";
import { toast } from "react-toastify";

export default function MissingInfoModal({ caseData, onSubmit }) {
  const [formData, setFormData] = useState({
    phonenumber: caseData.phonenumber || "",
    location: caseData.location || "",
    turnover: caseData.turnover || "",
    spocname: caseData.spocname || "",
    spocemail: caseData.spocemail || "",
    spocphonenumber: caseData.spocphonenumber || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


const handleSubmit = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await apiFetch(`/cases/${caseData.caseid}`, {
      method: "PUT",
      body: formData
    });
    if (!res || !res.message) throw new Error("Unexpected API response");
    toast.success(`✅ ${res.message}`);
    if (onSubmit) onSubmit(); // <- triggers refresh and modal close
  } catch (err) {
    const msg = err?.message || "Update failed. Try again.";
    setError(msg);
    toast.error(`❌ ${msg}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal show backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Complete Missing Case Info</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control name="phonenumber" value={formData.phonenumber} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control name="location" value={formData.location} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Turnover</Form.Label>
            <Form.Control name="turnover" value={formData.turnover} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>SPOC Name</Form.Label>
            <Form.Control name="spocname" value={formData.spocname} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>SPOC Email</Form.Label>
            <Form.Control name="spocemail" value={formData.spocemail} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>SPOC Phone</Form.Label>
            <Form.Control name="spocphonenumber" value={formData.spocphonenumber} onChange={handleChange} required />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
