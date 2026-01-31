import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine, FaUsers, FaHandshake, FaFileAlt, FaCheck, FaMoneyBillWave } from 'react-icons/fa';
import apiFetch from "../../utils/api";

const NewDashboard = () => {
  const [stats, setStats] = useState({
    today: 0,
    last7Days: 0,
    last30Days: 0,
    thisFinancialYear: 0,
    statusCounts: {},
    ratios: {
      leadsToMeeting: 0,
      meetingToDocuments: 0,
      documentsToBankerAcceptance: 0,
      bankerAcceptanceToSanction: 0,
      sanctionToDisbursement: 0
    },
    ratioCounts: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/cases/dashboard-stats", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        setStats(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, count, icon, gradient }) => (
    <div style={{
      background: gradient,
      border: "none",
      borderRadius: "12px",
      padding: "25px",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      minWidth: "200px",
      color: "white",
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "2.5em", marginBottom: "15px", opacity: 0.9 }}>
        {icon}
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1em", fontWeight: "500", opacity: 0.9 }}>
        {title}
      </h3>
      <div style={{ fontSize: "2.2em", fontWeight: "bold" }}>
        {count}
      </div>
    </div>
  );

  const RatioCard = ({ title, percentage, icon, gradient, description, numerator, denominator }) => (
    <div style={{
      background: gradient,
      border: "none",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      minWidth: "180px",
      color: "black",
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "2em", marginBottom: "10px", opacity: 0.9 }}>
        {icon}
      </div>
      <h4 style={{ margin: "0 0 5px 0", fontSize: "0.9em", fontWeight: "500", opacity: 0.9 }}>
        {title}
      </h4>
      <div style={{ fontSize: "1.8em", fontWeight: "bold", marginBottom: "5px" }}>
        {percentage}%
      </div>
      <div style={{ fontSize: "1.2em", fontWeight: "600", marginBottom: "5px", opacity: 0.9 }}>
        {denominator} : {numerator}
      </div>
      <div style={{ fontSize: "0.7em", opacity: 0.8 }}>
        {description}
      </div>
    </div>
  );

  const StatusCard = ({ status, count }) => {
    const getStatusColor = (status) => {
      const colors = {
        'Open': '#e3f2fd',
        'Meeting Done': '#f3e5f5',
        'Documentation Initiated': '#fff3e0',
        'Documentation In Progress': '#fff8e1',
        'Underwriting': '#e8f5e8',
        'One Pager': '#fce4ec',
        'Banker Review': '#e1f5fe',
        'Completed': '#e8f5e8',
        'Unknown': '#f5f5f5'
      };
      return colors[status] || '#f0f0f0';
    };

    const getStatusTextColor = (status) => {
      const colors = {
        'Open': '#1976d2',
        'Meeting Done': '#7b1fa2',
        'Documentation Initiated': '#f57c00',
        'Documentation In Progress': '#ff8f00',
        'Underwriting': '#388e3c',
        'One Pager': '#c2185b',
        'Banker Review': '#0288d1',
        'Completed': '#2e7d32',
        'Unknown': '#616161'
      };
      return colors[status] || '#424242';
    };

    return (
      <div style={{
        background: getStatusColor(status),
        border: `1px solid ${getStatusTextColor(status)}20`,
        borderRadius: "8px",
        padding: "18px",
        margin: "8px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s",
        cursor: "pointer"
      }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateX(5px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span style={{ fontWeight: "600", color: getStatusTextColor(status) }}>{status}</span>
        <span style={{
          background: getStatusTextColor(status),
          color: "black",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "0.9em",
          fontWeight: "bold",
          minWidth: "30px",
          textAlign: "center"
        }}>
          <a href={`/dashboard/overview?status=${status}`}>{count}</a>
        </span>
      </div>
    );
  };

  return (
    <div style={{
      padding: "30px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh"
    }}>
      <h2 style={{
        marginBottom: "40px",
        color: "white",
        textAlign: "center",
        fontSize: "2.5em",
        fontWeight: "300",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)"
      }}>
        Dashboard Overview
      </h2>

      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
          color: "white",
          fontSize: "1.2em"
        }}>
          Loading dashboard statistics...
        </div>
      ) : (
        <>
        {/* Time Period Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          marginBottom: "50px"
        }}>
          <StatCard
            title="Today"
            count={stats.today}
            icon={<FaCalendarDay />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            title="Last 7 Days"
            count={stats.last7Days}
          icon={<FaCalendarWeek />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          title="Last 30 Days"
          count={stats.last30Days}
          icon={<FaCalendarAlt />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          title="This Financial Year"
          count={stats.thisFinancialYear}
          icon={<FaChartLine />}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

      {/* Conversion Ratios */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h3 style={{
          marginBottom: "25px",
          color: "#333",
          fontSize: "1.8em",
          fontWeight: "600",
          textAlign: "center"
        }}>
          Lead Generation vs Disbursement Ratios
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <RatioCard
            title="Leads to Meeting"
            percentage={stats.ratios.leadsToMeeting}
            icon={<FaUsers />}
            gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
            description="Lead Conversion"
            numerator={stats.ratioCounts?.leadsToMeeting?.num || 0}
            denominator={stats.ratioCounts?.leadsToMeeting?.den || 0}
          />
          <RatioCard
            title="Meeting to Documents"
            percentage={stats.ratios.meetingToDocuments}
            icon={<FaHandshake />}
            gradient="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
            description="Documentation Rate"
            numerator={stats.ratioCounts?.meetingToDocuments?.num || 0}
            denominator={stats.ratioCounts?.meetingToDocuments?.den || 0}
          />
          <RatioCard
            title="Documents to Banker Acceptance"
            percentage={stats.ratios.documentsToBankerAcceptance}
            icon={<FaFileAlt />}
            gradient="linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)"
            description="Banker Approval"
            numerator={stats.ratioCounts?.documentsToBankerAcceptance?.num || 0}
            denominator={stats.ratioCounts?.documentsToBankerAcceptance?.den || 0}
          />
          <RatioCard
            title="Banker Acceptance to Sanction"
            percentage={stats.ratios.bankerAcceptanceToSanction}
            icon={<FaCheck />}
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            description="Sanction Rate"
            numerator={stats.ratioCounts?.bankerAcceptanceToSanction?.num || 0}
            denominator={stats.ratioCounts?.bankerAcceptanceToSanction?.den || 0}
          />
          <RatioCard
            title="Sanction to Disbursement"
            percentage={stats.ratios.sanctionToDisbursement}
            icon={<FaMoneyBillWave />}
            gradient="linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)"
            description="Disbursement Rate"
            numerator={stats.ratioCounts?.sanctionToDisbursement?.num || 0}
            denominator={stats.ratioCounts?.sanctionToDisbursement?.den || 0}
          />
        </div>
      </div>

      {/* Status Wise Breakdown */}
      {/* <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{
          marginBottom: "25px",
          color: "#333",
          fontSize: "1.8em",
          fontWeight: "600",
          textAlign: "center"
        }}>
          Cases by Status
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "15px"
        }}>
          {Object.entries(stats.statusCounts).map(([status, count]) => (
            <StatusCard key={status} status={status} count={count} />
          ))}
        </div>
      </div> */}
        </>
      )}
    </div>
  );
};

export default NewDashboard;