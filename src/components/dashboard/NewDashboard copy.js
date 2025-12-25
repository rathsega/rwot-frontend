import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import apiFetch from "../../utils/api";
import dayjs from 'dayjs';

const NewDashboard = () => {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    last7Days: 0,
    last30Days: 0,
    thisFinancialYear: 0,
    statusCounts: {}
  });

  useEffect(() => {
    apiFetch("/cases", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        const casesData = res.cases || res;
        setCases(casesData);
        calculateStats(casesData);
      })
      .catch((err) => console.error(err));
  }, []);

  const calculateStats = (casesData) => {
    const now = dayjs();
    const today = now.startOf('day');
    const last7Days = now.subtract(7, 'day').startOf('day');
    const last30Days = now.subtract(30, 'day').startOf('day');
    
    // Financial year starts April 1st
    const currentYear = now.year();
    const financialYearStart = now.month() >= 3 
      ? dayjs(`${currentYear}-04-01`) 
      : dayjs(`${currentYear - 1}-04-01`);

    let todayCount = 0;
    let last7DaysCount = 0;
    let last30DaysCount = 0;
    let financialYearCount = 0;
    const statusCounts = {};

    casesData.forEach(case_ => {
      const caseDate = dayjs(case_.createddate || case_.date);
      
      // Count by time periods
      if (caseDate.isAfter(today)) todayCount++;
      if (caseDate.isAfter(last7Days)) last7DaysCount++;
      if (caseDate.isAfter(last30Days)) last30DaysCount++;
      if (caseDate.isAfter(financialYearStart)) financialYearCount++;

      // Count by status
      const status = case_.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    setStats({
      today: todayCount,
      last7Days: last7DaysCount,
      last30Days: last30DaysCount,
      thisFinancialYear: financialYearCount,
      statusCounts
    });
  };

  const StatCard = ({ title, count, icon, color = "#2979ff" }) => (
    <div style={{
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "20px",
      textAlign: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      minWidth: "200px"
    }}>
      <div style={{ color, fontSize: "2em", marginBottom: "10px" }}>
        {icon}
      </div>
      <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2em", color: "#333" }}>
        {title}
      </h3>
      <div style={{ fontSize: "2em", fontWeight: "bold", color }}>
        {count}
      </div>
    </div>
  );

  const StatusCard = ({ status, count }) => (
    <div style={{
      background: "#f8f9fa",
      border: "1px solid #dee2e6",
      borderRadius: "6px",
      padding: "15px",
      margin: "5px 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <span style={{ fontWeight: "500" }}>{status}</span>
      <span style={{ 
        background: "#007bff", 
        color: "white", 
        padding: "4px 8px", 
        borderRadius: "12px",
        fontSize: "0.9em"
      }}>
        {count}
      </span>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "30px", color: "#333" }}>Dashboard Overview</h2>
      
      {/* Time Period Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        marginBottom: "40px" 
      }}>
        <StatCard 
          title="Today" 
          count={stats.today} 
          icon={<FaCalendarDay />} 
          color="#28a745" 
        />
        <StatCard 
          title="Last 7 Days" 
          count={stats.last7Days} 
          icon={<FaCalendarWeek />} 
          color="#17a2b8" 
        />
        <StatCard 
          title="Last 30 Days" 
          count={stats.last30Days} 
          icon={<FaCalendarAlt />} 
          color="#ffc107" 
        />
        <StatCard 
          title="This Financial Year" 
          count={stats.thisFinancialYear} 
          icon={<FaChartLine />} 
          color="#6f42c1" 
        />
      </div>

      {/* Status Wise Breakdown */}
      <div style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>Cases by Status</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "10px" 
        }}>
          {Object.entries(stats.statusCounts).map(([status, count]) => (
            <StatusCard key={status} status={status} count={count} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;