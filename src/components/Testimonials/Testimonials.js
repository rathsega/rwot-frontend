import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Particle from "../Particle";
import { useBackground } from "../../context/BackgroundContext";

const testimonials = [
  {
    name: 'A 80Cr T/O Pharma Industry MD',
    quote:
      "Have heard about them and well known for their service on time. Amused with their Loan against property service with plethora of options around. Well done!",
  },
  {
    name: 'CFO of a Prestigious Healthcare Industry',
    quote:
      "Private equity in less than 45 Working days and with EBIDTA Multiples of 22, Amazing services.",
  },
  {
    name: 'Sr VP of Finance Transportation and Services Sector',
    quote:
      "Has always being facing issues with Existing Working capital bank W.R.T Top-up, enhancement and quick services , once collaborated with RWOT the change in the banker in really quick time has helped us improving our top with improved quality services from the new banker.",
  },
  {
    name: 'MD of a 300Cr T/O Packaging Industry',
    quote:
      "ROI, IRR, NO one can beat what RWOT brings you on your table. Their volumetric business with the bankers keeping their game up. Good luck Surya and team RWOT.",
  },
  {
    name: 'MD of a 300Cr T/O Packaging Industry',
    quote:
      "Seamless disbursement and also even with few unexpected issues during pandemic, the assistant and advice I got to raise a private investment from RWOT has helped a lot, and the main reason for our sustainability today.",
  },
  {
    name: 'CFO of a Pharma Company',
    quote:
      "Seamless disbursement and also even with few unexpected issues during pandemic, the assistant and advice I got to raise a private investment from RWOT has helped a lot, and the main reason for our.",
  },
  {
    name: 'Shareholder of a Software Company',
    quote:
      "The new trend and fast forward phase of Auditing. Glad to see these youngsters proving to be in one stop solution for financial services and advices.",
  },
  {
    name: 'Fin Head of Retail and Wholesale Brand.',
    quote:
      "We would like to express our thanks for the work you have done for us over the past few weeks. Keep that positive spirit up and keep going. Good luck!",
  }
];

const transition = {
  duration: 0.8,
  ease: 'easeInOut', // <-- use a string instead of array
};

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];
  const next = testimonials[(index + 1) % testimonials.length];

  const { setBgMode } = useBackground();

  useEffect(() => {
    setBgMode("light");
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

  const handleClick = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div style={styles.container}>
      {/* Heading Wrapper */}
      <div style={styles.headerWrapper}>
        <h2 style={styles.title}>Client Testimonials</h2>
        <br />
        <p style={styles.subtitle}>We Believe in Community</p>
      </div>

      <Particle />
      {/* Blurred Next Testimonial */}
      <div style={styles.nextContainer}>
        <p style={{ ...styles.quote, ...styles.blurred }}>{next.quote}</p>
      </div>

      {/* Active Animated Testimonial */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          style={styles.currentContainer}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={transition}
        >
          <p style={styles.quote}>
            <span style={styles.highlight}>"{current.quote}"</span>
          </p>
          <div style={styles.author}>
            • {current.name}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Cursor pulse effect */}
      <motion.div
        style={styles.cursorPulse}
        onClick={handleClick}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [1, 0.85, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.svg
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={styles.arrowIcon}
          animate={{
            x: [0, 3, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </motion.svg>
      </motion.div>

      {/* Keyframes injection */}
      <style>
        {`
    @keyframes pulse {
      0% { transform: scale(1) translate(-50%, -50%); opacity: 0.3; }
      50% { transform: scale(1.2) translate(-50%, -50%); opacity: 0.1; }
      100% { transform: scale(1) translate(-50%, -50%); opacity: 0.3; }
    }
  `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    background: '#fff',
    color: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    overflow: 'hidden',
  },
  nextContainer: {
    position: 'absolute',
    top: '70%',
    left: '65%',
    transform: 'translateY(-50%)',
    maxWidth: '500px',
    opacity: 0.4,
    filter: 'blur(2px)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  currentContainer: {
    position: 'relative',
    maxWidth: '1000px',
    textAlign: 'left',
    zIndex: 3,
  },
  quote: {
    fontSize: '1.6rem',
    lineHeight: '1.8',
    fontWeight: 300,
    color: '#000',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
    zIndex: 3,
  },
  blurred: {
    fontSize: '1.3rem',
  },
  highlight: {
    fontWeight: 600,
    fontStyle: 'italic',
  },
  author: {
    marginTop: '20px',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    zIndex: 3,
  },
  cursorPulse: {
    position: 'absolute',
    width: '180px',
    height: '500px',
    borderRadius: '50%',
    top: '60%',
    left: '70%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255, 255, 255, 0.08)',
    animation: 'pulse 2s infinite',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  arrowIcon: {
    zIndex: 3,
  },
  headerWrapper: {
    position: 'absolute',
    top: '200px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    zIndex: 4,
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#000',
    marginBottom: '0.3rem',
  },

  subtitle: {
    fontSize: '1.1rem',
    color: '#000',
    fontWeight: '400',
    opacity: 0.9,
  },
};