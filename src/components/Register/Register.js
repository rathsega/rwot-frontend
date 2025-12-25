import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import Particle from "../Particle";
import Footer from "../Footer";
import { useBackground } from "../../context/BackgroundContext";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function Register() {
  const {setUser} = useAuth();
  const { setBgMode } = useBackground();
  const navigate = useNavigate();

  useEffect(() => { setBgMode("light"); }, [setBgMode]);

  // State for toggling forms and values
  const [showLogin, setShowLogin] = useState(false);
  const [poc, setPoc] = useState("");
  const [login, setLogin] = useState({ login: "", password: "" });
  const [signup, setSignup] = useState({
    email: "",
    company: "",
    phone: "",
    pocname: "",
    pocphone: "",
    password: "",
    terms: false,
  });
  const [fade, setFade] = useState("fade-in");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle form animation
  const toggleForm = () => {
    setFade("fade-out");
    setTimeout(() => {
      setShowLogin(s => !s);
      setFade("fade-in");
      setError("");
      setSuccess("");
      setLoading(false);
    }, 300);
  };

  // Signup Handler
const handleSignup = async e => {
  e.preventDefault();
  setError(""); setSuccess(""); setLoading(true);

  try {
    if (!signup.terms) throw new Error("Please accept the Terms of Use & Privacy Policy.");

    await apiFetch("/auth/register", {
      method: "POST",
      body: {
        email: signup.email,
        company: signup.company,
        phone: signup.phone,
        pocname: signup.pocname,
        pocphone: signup.pocphone,
        password: signup.password,
        rolename: 'Individual'
      }
    });

    setSuccess("Registration successful! Please log in.");
    setSignup({
      email: "", company: "", phone: "", pocname: "",
      pocphone: "", password: "", terms: false
    });
    setPoc("");
    setTimeout(toggleForm, 1200); // show login form after short delay
  } catch (err) {
    console.error("Signup error:", err);
    setError(err.message || "Signup failed");
  }
  setLoading(false);
};

// Login Handler
const handleLogin = async e => {
  e.preventDefault();
  setError(""); setSuccess(""); setLoading(true);

  try {
    // Perform login
const userDetails = await apiFetch("/auth/login", {
      method: "POST",
      body: {
        login: login.login,
        password: login.password
      }
    });

    //set userDetails.user in AuthContext
    if (!userDetails?.user) throw new Error(userDetails?.error || "Login failed");
    console.log("User logged in:", userDetails.user);
    // Update AuthContext user state
    setUser(userDetails.user);

    //store token in localstorage
    localStorage.setItem("token", userDetails.token);

    // Fetch user info
    const userInfo = await apiFetch("/auth/me");
    if (!userInfo?.user) throw new Error("Failed to fetch user info");

    if (userInfo.user) {
        setUser(userInfo.user);
        localStorage.setItem("userDetails", JSON.stringify(userInfo.user));
      } else {
        setUser(null);
      }

    setSuccess("Login successful! Redirecting...");

    // 🔁 Role-based navigation
    const roleToPath = {
      Admin: "/dashboard/admin",
      UW: "/dashboard/underwriting",
      Operations: "/dashboard/operations",
      Telecaller: "/dashboard/telecallers",
      KAM: "/dashboard/kam",
      Banker: "/dashboard/banker",
      Individual: "/dashboard/client"
    };

    const targetPath = roleToPath[userInfo.user.rolename] || "/dashboard";
    navigate(targetPath);

  } catch (err) {
    console.error("Login failed:", err);
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  // Styles
  const cardStyle = {
    boxShadow: "0 8px 30px 0 rgba(38,47,73,0.13)",
    borderRadius: 20,
    background: "#fff",
    border: "1.5px solid #ecedf6",
    minWidth: 330,
    maxWidth: 1200,
    width: "100%",
    margin: "auto",
    padding: "0",
    position: "relative",
    minHeight: 540,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden"
  };
  const innerContentStyle = {
    flex: "1 1 44%",
    padding: "50px 44px 36px 44px",
    minWidth: 360,
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  };
  const infoContentStyle = {
    flex: "1 1 56%",
    background: "#f8fafd",
    padding: "50px 52px 36px 52px",
    borderLeft: "1.5px solid #ecedf6",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 380
  };
  const fadeStyles = {
    transition: "opacity 0.3s",
    opacity: fade === "fade-in" ? 1 : 0,
    pointerEvents: fade === "fade-in" ? "all" : "none"
  };

  return (
    <div style={{
      display: "flex",
      backgroundColor: "#fff",
      flexDirection: "column",
      minHeight: "100vh",
      paddingTop: "100px"
    }}>
      <Container fluid style={{ flex: 1, padding: "40px 0" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%",
          height: "100%", zIndex: 0, pointerEvents: "none"
        }}>
          <Particle />
        </div>
        <Row className="justify-content-center align-items-center py-5 px-md-5">
          <Col md={10} style={{ display: "flex", justifyContent: "center" }}>
            <div style={cardStyle}>
              <div style={innerContentStyle}>
                <div style={{ ...fadeStyles, width: "100%" }}>
                  {!showLogin ? (
                    <>
                      <h2 className="mb-4 text-center" style={{ fontWeight: 700 }}>
                        Registration Form
                      </h2>
                      {error && <Alert variant="danger">{error}</Alert>}
                      {success && <Alert variant="success">{success}</Alert>}
                      <Form onSubmit={handleSignup}>
                        <Form.Group controlId="formEmail" className="mt-4">
                          <Form.Control
                            type="email"
                            placeholder="Email"
                            required
                            value={signup.email}
                            onChange={e => setSignup(s => ({ ...s, email: e.target.value }))}
                          />
                        </Form.Group>
                        <Form.Group controlId="formCompany" className="mt-4">
                          <Form.Control
                            type="text"
                            placeholder="Company Name"
                            required
                            value={signup.company}
                            onChange={e => setSignup(s => ({ ...s, company: e.target.value }))}
                          />
                        </Form.Group>
                        <Form.Group controlId="formContact" className="mt-4">
                          <Form.Control
                            type="text"
                            placeholder="Contact Number"
                            required
                            value={signup.phone}
                            onChange={e => setSignup(s => ({ ...s, phone: e.target.value }))}
                          />
                        </Form.Group>
                        <Form.Group controlId="formPoc" className="mt-4">
                          <Form.Select
                            value={poc}
                            onChange={e => {
                              setPoc(e.target.value);
                              setSignup(s => ({ ...s, pocname: e.target.value }));
                            }}
                            required
                          >
                            <option value="">Select Point of Contact</option>
                            <option value="MD">MD</option>
                            <option value="CEO">CEO</option>
                            <option value="CFO">CFO</option>
                            <option value="Accountant">Accountant</option>
                          </Form.Select>
                        </Form.Group>
                        {poc && (
                          <>
                            <Form.Group controlId="formPocName" className="mt-4">
                              <Form.Control
                                type="text"
                                placeholder="POC Name"
                                required
                                value={signup.pocname}
                                onChange={e => setSignup(s => ({ ...s, pocname: e.target.value }))}
                              />
                            </Form.Group>
                            <Form.Group controlId="formPocNumber" className="mt-4">
                              <Form.Control
                                type="text"
                                placeholder="POC Number"
                                required
                                value={signup.pocphone}
                                onChange={e => setSignup(s => ({ ...s, pocphone: e.target.value }))}
                              />
                            </Form.Group>
                          </>
                        )}
                        <Form.Group controlId="formPassword" className="mt-4">
                          <Form.Control
                            type="password"
                            placeholder="Password (exactly 10 characters)"
                            required
                            value={signup.password}
                            onChange={e => setSignup(s => ({ ...s, password: e.target.value }))}
                            maxLength={10}
                          />
                        </Form.Group>
                        <Form.Group controlId="formCheckbox" className="mt-4">
                          <Form.Check
                            type="checkbox"
                            label="I accept the Terms of Use & Privacy Policy."
                            checked={signup.terms}
                            onChange={e => setSignup(s => ({ ...s, terms: e.target.checked }))}
                            required
                          />
                        </Form.Group>
                        <div className="d-grid mt-4">
                          <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Raise"}
                          </Button>
                        </div>
                      </Form>
                      <div className="text-center mt-4" style={{ fontSize: 15 }}>
                        Already have an account?{" "}
                        <span
                          style={{
                            color: "#2e71fa",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontWeight: 600
                          }}
                          onClick={toggleForm}
                        >
                          Login
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="mb-4 text-center" style={{ fontWeight: 700 }}>
                        Login
                      </h2>
                      {error && <Alert variant="danger">{error}</Alert>}
                      {success && <Alert variant="success">{success}</Alert>}
                      <Form onSubmit={handleLogin}>
                        <Form.Group controlId="loginEmail" className="mt-4">
                          <Form.Control
                            type="text"
                            placeholder="Email, Username or Phone"
                            value={login.login}
                            onChange={e => setLogin({ ...login, login: e.target.value })}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="loginPassword" className="mt-4">
                          <Form.Control
                            type="password"
                            placeholder="Password"
                            value={login.password}
                            onChange={e => setLogin({ ...login, password: e.target.value })}
                            required
                          />
                        </Form.Group>
                        <div className="d-grid mt-4">
                          <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Login"}
                          </Button>
                        </div>
                      </Form>
                      <div className="text-center mt-4" style={{ fontSize: 15 }}>
                        Don&apos;t have an account?{" "}
                        <span
                          style={{
                            color: "#2e71fa",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontWeight: 600
                          }}
                          onClick={toggleForm}
                        >
                          Raise
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* RIGHT: Info Content */}
              <div style={infoContentStyle}>
                <h4 style={{ fontWeight: 700, color: "#1c295a", marginBottom: 12 }}>
                  <strong>DID YOU KNOW THAT</strong>
                </h4>
                <p><strong>We are trusted by more than 1800 clients</strong></p>
                <p>
                  When casting around for financial advisory or services for their organizations,
                  72% of business leaders consider “Trust in the company (the advisor)” to be of
                  the utmost importance, according to Five9’s Customer Service Index 2022 report.
                  That an increase from last year’s number at 62%, and it trumps both the costing
                  of the financial product and TAT for the disbursement.
                </p>
                <p>
                  Even if the price is right and the service is good, if the customer doesn’t trust
                  the company—or the people within the company—the likelihood of making the sale
                  is low.
                </p>
                <p>
                  And, we can say with immense pleasure and with great confidence in our heart,
                  we at RWOT believe, that the main agenda of our services shall be adhere to
                  Loyalty, Trust worthy, Transparent, TAT Adherence and Cost efficiency to the
                  customer experience.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
      <style>{`
        .fade-in { opacity: 1; transition: opacity 0.3s; }
        .fade-out { opacity: 0; transition: opacity 0.3s; pointer-events: none; }
      `}</style>
    </div>
  );
}

export default Register;