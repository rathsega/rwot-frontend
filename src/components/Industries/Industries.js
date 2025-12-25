import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Modal } from "react-bootstrap";
import Particle from "../Particle";
import { useBackground } from "../../context/BackgroundContext";

// IMPORT IMAGES
import packagingImg from "../../Assets/filtered/Packaging.jpg"
import pharmaImg from "../../Assets/filtered/Pharma.jpg";
import consultancyImg from "../../Assets/filtered/Consultaancy.jpg";
import techImg from "../../Assets/filtered/Tech Industries.jpg";
import schoolsImg from "../../Assets/filtered/Schools and Colleges.jpg";
import rawMaterialImg from "../../Assets/filtered/Commodities .jpg";
import marketingImg from "../../Assets/filtered/Marketing E-commerce.jpg";
import constructionImg from "../../Assets/filtered/Constructions and Contractors.jpg";
import edtechImg from "../../Assets/filtered/Ed-tech Industries.jpg";
import healthcareImg from "../../Assets/filtered/Healthcare Industries .jpg";
import manufacturingImg from "../../Assets/filtered/Manufacturing Industries.jpg";
import retailImg from "../../Assets/filtered/Retail&Wholesale.jpg";
import solarImg from "../../Assets/filtered/Wind and solar industries.jpg";
import defenceImg from "../../Assets/filtered/Defence & Govt Sectors.jpg";
import fmcgImg from "../../Assets/filtered/FMCG.jpg";
import hotelsImg from "../../Assets/filtered/Entertainment and Lifestyle.jpg";
import oilgasImg from "../../Assets/filtered/Oil&Gas Industries.jpg";
import otherImg from "../../Assets/filtered/Venture capitalists_Seed Funding.jpg";

// INDUSTRY DESCRIPTIONS
const industryDescriptions = {
  "Packaging": "Solutions for modern packaging, from logistics to retail-ready.",
  "Pharma": "Advisory and finance for pharmaceutical growth and R&D.",
  "Consultancy": "Supporting firms with financial tools and planning.",
  "Tech Industries": "Tailored capital solutions for tech innovators.",
  "Schools and Colleges": "Institutional funding and infra planning support.",
  "Raw Material Trading": "Financing for commodity and raw material sourcing.",
  "Marketing/E-Commerce": "Fueling digital marketing and commerce platforms.",
  "Constructions/Contractors": "Structuring finance for infra and EPC players.",
  "Ed-Tech": "Growth capital and advisory for EdTech startups.",
  "Healthcare": "Healthcare infra and services focused financial aid.",
  "Manufacturing": "Process optimization and finance for production firms.",
  "Retail and Wholesale": "Structured solutions for inventory and scaling.",
  "Solar and Wind": "Green energy project finance and execution planning.",
  "Defence and Government Sectors": "Specialized funding paths for government projects.",
  "FMCG": "Fast-moving consumer goods distribution and market entry.",
  "Hotels and Motels": "Hospitality business structuring and support.",
  "Oil and Gas Industries": "Heavy industry funding and project planning.",
  "All other Industries": "Custom solutions for any unique industrial need."
};

const industryImages = {
  "Packaging": packagingImg,
  "Pharma": pharmaImg,
  "Consultancy": consultancyImg,
  "Tech Industries": techImg,
  "Schools and Colleges": schoolsImg,
  "Raw Material Trading": rawMaterialImg,
  "Marketing/E-Commerce": marketingImg,
  "Constructions/Contractors": constructionImg,
  "Ed-Tech": edtechImg,
  "Healthcare": healthcareImg,
  "Manufacturing": manufacturingImg,
  "Retail and Wholesale": retailImg,
  "Solar and Wind": solarImg,
  "Defence and Government Sectors": defenceImg,
  "FMCG": fmcgImg,
  "Hotels and Motels": hotelsImg,
  "Oil and Gas Industries": oilgasImg,
  "All other Industries": otherImg
};

const industriesList = Object.keys(industryDescriptions);

function Industries() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [popupIndustry, setPopupIndustry] = useState(null);
  const { setBgMode } = useBackground();

  // CREATE REFS FOR ALL VIDEOS
  const videoRefs = useRef([]);

  useEffect(() => {
    setBgMode("light");
    // Attempt to play all videos after mount
    videoRefs.current.forEach((video) => {
      if (video) {
        video.play().catch(() => { }); // avoid uncaught error if play is blocked
      }
    });
  }, [setBgMode]);

  return (
    <Container fluid style={{ backgroundColor: "#fff", paddingTop: "250px", paddingBottom: "80px" }}>
      <Particle />
      <Container>
        <h2 style={{ color: "#000", paddingBottom: "50px", textAlign: "center" }}>
          Our expertise spans across a range of industries to deliver tailor-made solutions.
        </h2>
        <Row style={{ justifyContent: "center" }}>
          {industriesList.map((industry, idx) => (
            <Col md={4} className="project-card" key={idx} style={{ padding: "20px" }}>
              <div
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  backgroundColor: "#111",
                  borderRadius: "16px",
                  boxShadow: hoveredIndex === idx
                    ? "0 0 24px rgba(0,0,0,0.2)"
                    : "0 0 8px rgba(0,0,0,0.05)",
                  transform: hoveredIndex === idx ? "scale(1.03) translateY(-5px)" : "scale(1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  color: "white",
                  overflow: "hidden",
                  height: "100%"
                }}
              >
                <video
                  ref={el => videoRefs.current[idx] = el}
                  src={industryImages[industry]}
                  style={{ width: "100%", height: "160px", objectFit: "cover" }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={industryImages[industry]}
                />
                <div style={{ padding: "15px" }}>
                  <h5 style={{ fontWeight: "bold" }}>{industry}</h5>
                  <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{industryDescriptions[industry]}</p>
                  {hoveredIndex === idx && (
                    <div
                      style={{
                        marginTop: "10px",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "10px",
                        backdropFilter: "blur(6px)"
                      }}
                    >
                      <button
                        style={{
                          background: "#ccc",
                          color: "#000",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
                          border: "none"
                        }}
                        onClick={() => setPopupIndustry(industry)}
                      >
                        Know more
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* POPUP MODAL */}
      <Modal
        show={popupIndustry !== null}
        onHide={() => setPopupIndustry(null)}
        centered
        size="lg"
        dialogClassName="zoom-out-popup"
      >
        {/* <div style={{ flex: 1 }}>
          <img
            src={industryImages[popupIndustry]}
            alt={popupIndustry}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}
          />
        </div> */}
        {popupIndustry && (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ flex: 1, padding: "20px" }}>
              <h4>{popupIndustry}</h4>
              <p>{industryDescriptions[popupIndustry]}</p>
              <button
                onClick={() => setPopupIndustry(null)}
                style={{
                  marginTop: "20px",
                  background: "#000",
                  color: "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CSS for Zoom-out animation */}
      <style>{`
        .zoom-out-popup .modal-dialog {
          animation: zoomOut 0.4s ease-in-out;
        }
        @keyframes zoomOut {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Container>
  );
}

export default Industries;

