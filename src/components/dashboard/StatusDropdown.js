import React from 'react';

const StatusDropdown = ({ onStatusChange }) => (
  <div className="status-dropdown-cute">
    <select defaultValue="" onChange={e => onStatusChange(e.target.value)}>
      <option value="" disabled>Change Status</option>
      <option value="Meeting Done">Meeting Done</option>
      <option value="Document Initiated">Document Initiated</option>
    </select>
  </div>
);

export default StatusDropdown;