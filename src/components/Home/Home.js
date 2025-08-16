import React, { useEffect } from "react";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Particle from "../Particle";
import heroVideo from "../../Assets/hero-background.mp4";
import { useBackground } from "../../context/BackgroundContext";

const Home = () => {
  const navigate = useNavigate();
  const { setBgMode } = useBackground();

  useEffect(() => {
    setBgMode("transparent");
  }, [setBgMode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate("/about");
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <section>
      <Container fluid className="home-section" id="home">
        {/* Background Video */}
        <div className="video-background">
          <video autoPlay muted loop playsInline>
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
        <Particle />

        <Container className="home-content">
          <Row>
            <Col md={12}>
              <h1 className="hero-title">
                We Help
                <strong> Growing Business</strong>
              </h1>

              <div className="carousel-wrapper">
                <Carousel controls={false} indicators={false} interval={3000} pause={false}>
                  <Carousel.Item>
                    <p className="carousel-text">
                      Connecting People
                      <br />
                      Connecting The World
                      <br />
                      Connecting The Universe
                    </p>
                  </Carousel.Item>
                  <Carousel.Item>
                    <p className="carousel-text">
                      We help you manage assets and provide financial advice.
                    </p>
                  </Carousel.Item>
                  <Carousel.Item>
                    <p className="carousel-text">
                      Leave money issues with us and focus on your core business.
                    </p>
                  </Carousel.Item>
                </Carousel>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Responsive CSS */}
      <style jsx="true">{`
        .home-section {
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .video-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          overflow: hidden;
        }
        .video-background video {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
        }
        .home-content {
          position: relative;
          z-index: 1;
          padding-top: 6vh;
          padding-bottom: 6vh;
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-title {
          font-size: 3.25rem;
          font-weight: 700;
          line-height: 1.1;
          color: #fff;
          text-shadow: 0 2px 16px rgba(0,0,0,0.12);
          margin-bottom: 1.5rem;
        }
        .carousel-wrapper {
          padding-top: 30px;
          padding-left: 50px;
        }
        .carousel-text {
          font-size: 2.25rem;
          font-weight: 500;
          color: #fff;
          text-shadow: 0 1px 8px rgba(0,0,0,0.12);
        }

        /* --- RESPONSIVE STYLES --- */
        @media (max-width: 992px) {
          .hero-title {
            font-size: 2.3rem;
          }
          .carousel-text {
            font-size: 1.35rem;
          }
          .carousel-wrapper {
            padding-left: 0;
          }
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 1.7rem;
          }
          .carousel-text {
            font-size: 1.1rem;
          }
          .carousel-wrapper {
            padding-left: 0;
            padding-top: 20px;
          }
          .home-content {
            padding-top: 4vh;
            padding-bottom: 4vh;
          }
        }
        @media (max-width: 576px) {
          .hero-title {
            font-size: 1.2rem;
          }
          .carousel-text {
            font-size: 0.93rem;
          }
          .home-content {
            min-height: 40vh;
          }
        }
      `}</style>
    </section>
  );
};

export default Home;
