import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaEye, FaEdit, FaHandshake, FaBan, FaPhoneAlt, 
    FaCommentDots, FaUserTie, FaExclamationTriangle 
} from 'react-icons/fa';
import dayjs from 'dayjs';
import './CaseCard.css';

// Card background colors for variety
const cardColors = [
    { bg: '#EFF6FF', border: '#BFDBFE', accent: '#3B82F6' },  // Blue
    { bg: '#F0FDF4', border: '#BBF7D0', accent: '#22C55E' },  // Green
    { bg: '#FFFBEB', border: '#FDE68A', accent: '#F59E0B' },  // Amber
    { bg: '#FDF2F8', border: '#FBCFE8', accent: '#EC4899' },  // Pink
    { bg: '#F5F3FF', border: '#DDD6FE', accent: '#8B5CF6' },  // Purple
    { bg: '#ECFEFF', border: '#A5F3FC', accent: '#06B6D4' },  // Cyan
    { bg: '#FFF7ED', border: '#FED7AA', accent: '#F97316' },  // Orange
    { bg: '#F0FDFA', border: '#99F6E4', accent: '#14B8A6' },  // Teal
];

/**
 * Unified CaseCard Component - Clean, minimal design
 * Shows status on top, client name prominently, and icon actions
 */
const CaseCard = ({ 
    caseData, 
    actions = ['view'],
    onCardClick,
    showKam = false,
    colorIndex = 0
}) => {
    const navigate = useNavigate();
    const colors = cardColors[colorIndex % cardColors.length];

    // Check if case is stale (no update for 48+ hours and not Open)
    const isStale = caseData.status !== "Open" && 
        caseData.status_updated_on &&
        dayjs().diff(dayjs(caseData.status_updated_on), "hour") > 48;

    const handleCardClick = (e) => {
        if (e.target.closest('.card-action-btn')) return;
        
        if (onCardClick) {
            onCardClick(caseData);
        } else {
            navigate(`/dashboard/case/${caseData.caseid}`);
        }
    };

    const assignedKam = caseData?.assignments?.find(a => a.assigned_to_role === "KAM")?.assigned_to_name;

    // Predefined action button configurations
    const actionConfig = {
        view: { icon: FaEye, tooltip: 'View Details', color: '#3b82f6' },
        edit: { icon: FaEdit, tooltip: 'Edit', color: '#f59e0b' },
        meeting: { icon: FaHandshake, tooltip: 'Meeting Done', color: '#10b981' },
        reject: { icon: FaBan, tooltip: 'No Requirement', color: '#ef4444' },
        call: { icon: FaPhoneAlt, tooltip: 'Call', color: '#8b5cf6' },
        comment: { icon: FaCommentDots, tooltip: 'Add Comment', color: '#6366f1' },
    };

    const renderAction = (action, idx) => {
        let IconComponent, tooltip, color, onClick;

        if (typeof action === 'string') {
            const config = actionConfig[action];
            if (!config) return null;
            IconComponent = config.icon;
            tooltip = config.tooltip;
            color = config.color;
            onClick = (e) => {
                e.stopPropagation();
                if (action === 'view') {
                    navigate(`/dashboard/case/${caseData.caseid}`);
                }
            };
        } else {
            IconComponent = action.icon || FaEye;
            tooltip = action.tooltip || 'Action';
            color = action.color || '#6b7280';
            onClick = (e) => {
                e.stopPropagation();
                action.onClick?.(caseData, e);
            };
        }

        return (
            <button
                key={idx}
                className="card-action-btn"
                style={{ 
                    backgroundColor: `${color}20`,
                    color: color
                }}
                onClick={onClick}
                title={tooltip}
            >
                <IconComponent size={16} />
            </button>
        );
    };

    return (
        <div 
            className={`case-card ${isStale ? 'stale' : ''}`}
            style={{
                backgroundColor: colors.bg,
                borderColor: colors.border
            }}
            onClick={handleCardClick}
        >
            {/* Stale Warning */}
            {isStale && (
                <div className="stale-indicator" title="No update for 48+ hours">
                    <FaExclamationTriangle size={12} />
                </div>
            )}

            {/* Status Badge - Top */}
            <div className="status-row">
                <span 
                    className="status-tag"
                    style={{ backgroundColor: colors.accent }}
                >
                    {caseData.status || 'Open'}
                </span>
            </div>

            {/* Client Name - Main Focus */}
            <h3 className="client-name">
                {caseData.clientname || caseData.companyname || 'Unknown Client'}
            </h3>

            {/* KAM Badge */}
            {showKam && assignedKam && (
                <div className="kam-info">
                    <FaUserTie size={12} />
                    <span>{assignedKam}</span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="card-actions">
                {actions.map(renderAction)}
            </div>
        </div>
    );
};

export default CaseCard;
