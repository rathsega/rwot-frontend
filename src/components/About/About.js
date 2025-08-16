import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Particle from "../Particle";
import { BsFillStarFill, BsCurrencyDollar, BsClockFill, BsShieldLockFill } from "react-icons/bs";
import { useBackground } from "../../context/BackgroundContext";

const leftCardData = [
  {
    title: "Quality In Our DNA",
    text: "Our partnership with Worlds Top Notch Financial Institutions and banks along with the service providers, with immense expertise in consulting and advisory, pool of well-trained financil experts and quality assurance processes at each stage of disbursement execution along with hassle free transactions delivered to you.",
    img: <BsFillStarFill />
  },
  {
    title: "Right Price",
    text: "Our Analysing and Underwriting ensures and sources the final apt lender for you which reduces, minimal or zero rework. We have taken advantage of economies of scale, wherever possible, to get you right price.At RWOT there is solution and bridge for all sorts of financial requirements at right prices and right place.",
    img: <BsCurrencyDollar />
  },
  {
    title: "Hassle Free and On Time",
    text: "Our world class leads management processes, customer onbording process for documents and requirements and Commission based delivery model for financiers ensures transactions being done hassle-free on-time. You need to just select from curated financial options, product and move-in.On Time Every time",
    img: <BsClockFill />
  },
  {
    title: "Transparency",
    text: "Our in-house Team of experts brings out the requirements and ROI management coupled with detailed level pricing which brings in transparency in what we do.We don’t believe in hidden charges. We at RWOT involves clarity with investment firms and clients about the fees, indeed is the major key in lending businesses.",
    img: <BsShieldLockFill />
  }
];

const rightCardData = [
  {
    title: "On Time Service",
    text: "In Addition to offering impeccable financial solutions and services, we are the company that guarantees service delivery on time every time."
  },
  {
    title: "A Team Of Professionals.",
    text: "RWOT is a Synergy of Financial Planners, Ex- Bankers, Wealth management advisors, Financial advisors, CAs, Investment experts, VCs traders and deal makers."
  },
  {
    title: "Analyze Your Business.",
    text: "Structured, Curated Infinite No of solutions in front of you, post analyzing your business and financials. Every investor has his own expertise in one businesses."
  }
];

function About() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");
  const { setBgMode } = useBackground();

  useEffect(() => {
    setBgMode("dark");
  }, [setBgMode]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const fadeDuration = 500;
    const interval = setInterval(() => {
      setFadeState("fade-out");
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rightCardData.length);
        setFadeState("fade-in");
      }, fadeDuration);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fadeStyles = {
    transition: "opacity 0.5s ease-in-out",
    opacity: fadeState === "fade-in" ? 1 : 0
  };

  const card = rightCardData[currentIndex];

  return (
    <Container fluid style={{ backgroundColor: "#000", minHeight: "100vh", overflowX: "hidden" }}>
      <Particle />
      <Container fluid style={{ position: "relative", paddingTop: "15vh", paddingBottom: "0px" }}>
        <Row>
          {/* Left Column with Main Cards */}
          <Col md={4} style={{ paddingLeft: "10%" }}>
            <div style={{ position: "absolute", paddingTop: "5%", maxWidth: "800px" }}>
              {[0, 1].map((startIndex) => (
                <Row
                  key={startIndex}
                  style={{ marginBottom: "20px", marginLeft: "10px", marginRight: "-10px" }}
                >
                  {[1, 2].map((offset) => {
                    const i = startIndex + offset;
                    const item = leftCardData[i];
                    if (!item) return null;

                    // Alternate styles
                    const isDark = i % 2 === 0;
                    const bgColor = isDark ? "#1c1c1c" : "#ffffff";
                    const textColor = isDark ? "white" : "black";
                    const iconColor = isDark ? "#828282" : "#828282";

                    return (
                      <Col key={i} md={6}>
                        <Card
                          style={{
                            borderRadius: "16px",
                            overflow: "hidden",
                            backgroundColor: bgColor,
                            color: textColor,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            marginBottom: "20px",
                            transition: "transform 0.3s",
                            cursor: "pointer",
                            height: "100%",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <Card.Body>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "60px",
                                marginBottom: "10px",
                                borderRadius: "12px",
                              }}
                            >
                              {React.cloneElement(item.img, { size: 36, color: iconColor })}
                            </div>
                            <Card.Title style={{ fontWeight: "bold", fontSize: "1rem" }}>{item.title}</Card.Title>
                            <Card.Text style={{ fontSize: "0.85rem" }}>{item.text}</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ))}
            </div>
          </Col>

          {/* Right Floating Cards */}
          <Col md={7} style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 200, right: 30, width: "100%", maxWidth: "360px" }}>
              <Card
                style={{
                  ...fadeStyles,
                  borderRadius: "20px",
                  backgroundColor: card.bgColor || "#fff",
                  color: "#333",
                  padding: "20px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s, opacity 0.5s ease-in-out",
                  cursor: "pointer",
                  height: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Card.Body style={{ padding: 0 }}>
                  <Card.Title style={{ fontWeight: "600", fontSize: "1rem" }}>{card.title}</Card.Title>
                  <Card.Text style={{ fontSize: "1rem" }}>{card.text}</Card.Text>
                </Card.Body>
              </Card>
              {/* CEO's Message Placeholder */}
              <p
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "1.2rem",
                  fontFamily: "Roboto, Arial, sans-serif", // updated here
                  whiteSpace: "pre-wrap",
                  textAlign: "left",
                  marginTop: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <span style={{ color: "#000", paddingTop: "20px", paddingLeft: "10px" }}>
                  "Our Goal is to be at the heart of financial services industry and help businesses grow across the globe reaching that trillion market."
                </span>
                <br /><br/>
                <footer className="blockquote-footer">Besetti Suryavansi, CEO Of RWOT</footer>
              </p>

            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default About;