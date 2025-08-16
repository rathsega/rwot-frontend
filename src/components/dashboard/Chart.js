function Chart() {
  return (
    <div style={{
      width: "100%",
      height: 170,
      background: "linear-gradient(90deg,#eaf2ff 70%, #fff 100%)",
      borderRadius: 12,
      marginBottom: 14
    }}>
      {/* ChartJS or Recharts goes here */}
      <svg width="100%" height="100%">
        <polyline
          fill="none"
          stroke="#7558fa"
          strokeWidth="3"
          points="30,140 60,120 90,90 130,100 170,60 200,90 250,80 300,120 340,50"
        />
        <polyline
          fill="none"
          stroke="#ff36ae"
          strokeWidth="3"
          points="30,100 60,90 90,130 130,70 170,90 200,40 250,110 300,70 340,100"
        />
      </svg>
    </div>
  );
}