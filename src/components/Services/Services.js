import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import service1 from "../../Assets/Services/Business loans.jpg";
import service2 from "../../Assets/Services/capital_market.jpeg";
import service3 from "../../Assets/Services/Loan against property.jpg";
import service4 from "../../Assets/Services/Bridge financing.jpg";
import service5 from "../../Assets/Services/Working capital.jpg";
import service6 from "../../Assets/Services/Pari passu.jpg";
import service7 from "../../Assets/Services/Lease rentals discounting.jpg";
import service8 from "../../Assets/Services/Project funding.jpg";
import service9 from "../../Assets/Services/Machinary funding.jpg";
import service10 from "../../Assets/Services/Mergers and Acquistions.jpg";
import service11 from "../../Assets/Services/NPA.jpg";
import service12 from "../../Assets/Services/Inventory financing.jpg";
import service13 from "../../Assets/Services/Channel partner financing.jpg";
import service14 from "../../Assets/Services/non_fund.jpg";
import service15 from "../../Assets/Services/Equity.jpg";
import service16 from "../../Assets/Services/Venture capital.jpg";
import service17 from "../../Assets/Services/BSE AND NSE Services.jpg";
import service18 from "../../Assets/Services/Accountying and auditing.jpg";
import { useBackground } from "../../context/BackgroundContext";

const servicesList = [
  {
    imgPath: service1,
    title: "Business Loans(Unsecured)",
    description:
      "An unsecured business loan allows a business owner, sole trader or limited company to access finance without having to use company assets as security.",
  },
  {
    imgPath: service2,
    title: "Capital markets",
    description:
      "The part of a financial system concerned with raising capital by dealing in Listed Unlisted shares, bonds, Non convertible debentures and other long-term investments.",
  },
  {
    imgPath: service3,
    title: "Loan against property",
    description:
      "A secured loan product that can be useful for both salaried individuals as well as businesses. The loan gets sanctioned once you mortgage your residential or commercial property.",
  },
  {
    imgPath: service4,
    title: "Bridge Financing",
    description:
      "Short term private funding from High Net worth individuals. Large Quantum and Attractive Rate of Interests. Disbursement in 3-4 days.",
  },
  {
    imgPath: service5,
    title: "Working Capital",
    description:
      "A Working Capital Loan is one that is availed of to fund the day-to-day operations of a business. CC & OD Facilities, Term loans.",
  },
  {
    imgPath: service6,
    title: "Pari pasu",
    description:
      "When multiple lenders jointly finance the same assets, this is referred to as co-lending. A 'pari-passu' agreement establishes how sums will be allocated between each creditor.",
  },
  {
    imgPath: service7,
    title: "Lease Rental Discounting",
    description:
      "Lease Rental Discounting is a tool to acquire loans from banks using rental receipts as collateral. Based on long-term cashflow.",
  },
  {
    imgPath: service8,
    title: "Project Funding",
    description:
      "The process of obtaining financial resources for implementing a specific project. This can come from government grants, investors, or loans.",
  },
  {
    imgPath: service9,
    title: "Machinery Financing",
    description:
      "A credit facility to buy, lease, repair, or upgrade machinery. Enables productivity and efficiency without compromising working capital.",
  },
  {
    imgPath: service10,
    title: "Mergers & Acquisitions",
    description:
      "Consolidating companies or assets to stimulate growth, gain competitive advantages, or increase market share.",
  },
  {
    imgPath: service11,
    title: "OTS/NPA/Stressed Assets Liquidation",
    description:
      "OTS is used by lenders to recover dues from individuals with a default history by agreeing to a lower one-time settlement.",
  },
  {
    imgPath: service12,
    title: "Inventory Financing",
    description:
      "Short-term loan or revolving credit to purchase inventory. The products serve as collateral for the loan.",
  },
  {
    imgPath: service13,
    title: "Channel Partners Financing",
    description:
      "Provides distributors with financing against invoices. Enables cash discounts and immediate corporate payments.",
  },
  {
    imgPath: service14,
    title: "Non Fund Based Limits",
    description:
      "Facilitating BGs and LCs for work orders and as an investment tool.",
  },
  {
    imgPath: service15,
    title: "Private Equity",
    description:
      "An investor buys a stake in a private company with the aim of increasing its value before selling.",
  },
  {
    imgPath: service16,
    title: "Venture Capital/Seed Funding",
    description:
      "Investment in startups with strong growth potential. Investors expect high returns on investment.",
  },
  {
    imgPath: service17,
    title: "SME, BSE, NSE IPO Services",
    description:
      "We help with valuation, investment bankers, and advisory services for public listings.",
  },
  {
    imgPath: service18,
    title: "Accounting and Auditing",
    description:
      "Our team of CAs provides efficient, hassle-free accounting and auditing services with clarity and precision.",
  },
];

function Services() {
  const { setBgMode } = useBackground();

  useEffect(() => {
    setBgMode("dark");
  }, [setBgMode]);

  return (
    <Container fluid style={{ backgroundColor: "#000", minHeight: "100vh", overflowX: "hidden", paddingTop: "200px" }}>
      <Particle />
      <Container>
        <h1 style={{ color: "white" }}>
          Services <strong>We Provide</strong>
        </h1>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          {servicesList.map((service, idx) => (
            <Col md={4} className="project-card" key={idx}>
              <ProjectCard
                imgPath={service.imgPath}
                isBlog={false}
                title={<span style={{ color: "white" }}>{service.title}</span>}
                description={<span style={{ color: "white" }}>{service.description}</span>}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
}

export default Services;
