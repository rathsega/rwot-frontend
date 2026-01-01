import * as XLSX from "xlsx";

const getByRole = (lead, role) => {
  if (!lead?.assignments) return "";
  const found = lead.assignments.find(a => (a.assigned_to_role || a.assigned_to_role === 0) && (a.assigned_to_role || '').toString().toLowerCase() === role.toLowerCase()) ||
    lead.assignments.find(a => (a.assigned_to_role || '').toString().toLowerCase() === role.toLowerCase());
  return (found && (found.assigned_to_name || found.assigned_to_name === 0)) ? found.assigned_to_name : "";
};

const toDateString = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  } catch (e) {
    return "";
  }
};

const toTimeString = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toISOString().slice(11, 16);
  } catch (e) {
    return "";
  }
};

const firstDocumentDate = (docs = []) => {
  if (!Array.isArray(docs) || docs.length === 0) return "";
  const candidates = docs.map(d => d.uploadedat || d.uploadedAt || d.createdAt || d.received_at || d.receivedAt || d.date || null).filter(Boolean);
  if (candidates.length === 0) return "";
  const dates = candidates.map(c => new Date(c)).filter(d => !isNaN(d));
  if (dates.length === 0) return "";
  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  return earliest.toISOString().slice(0, 10);
};

export const mapLeadForExport = (lead, index = 0) => {
  const bankAssignments = Array.isArray(lead.bank_assignments) ? lead.bank_assignments : [];

  const telecaller = getByRole(lead, 'Telecaller');
  const kam = getByRole(lead, 'KAM');
  const operations = getByRole(lead, 'Operations');

  const createdDate = toDateString(lead.createddate || lead.createdDate || lead.created_at || lead.created_at);
  const createdTime = lead.time || toTimeString(lead.createddate || lead.createdDate);

  const meetingScheduleDate = toDateString(lead.date || lead.meetingDate || lead.meeting_date);
  const meetingDoneDate = toDateString(lead.status_updated_on || lead.meeting_done_date || lead.meetingDoneDate);

  const documentsReceivedDate = firstDocumentDate(lead.documents || []);

  const onePagerDoc = (lead.documents || []).find(d => (d.docname || '').toLowerCase().includes('one pager') || (d.docname || '').toLowerCase().includes('one-pager') || (d.docname || '').toLowerCase().includes('onepager'));
  const onePagerCreatedDate = onePagerDoc ? toDateString(onePagerDoc.uploadedat || onePagerDoc.uploadedAt || onePagerDoc.createdAt || onePagerDoc.date) : (lead.one_pager_created_date ? toDateString(lead.one_pager_created_date) : "");
  const onePagerStatus = lead.one_pager_status || lead.onePagerStatus || (onePagerDoc ? 'Created' : 'Not Created');

  const sentToNoOfBanker = bankAssignments.length;
  const listOfBanker = bankAssignments.map(b => b.bank_name || b.bankname || b.name || '').filter(Boolean).join(' | ');
  const loginDates = bankAssignments.map(b => (b.login_date || b.loginDate || b.loginAt || '')).filter(Boolean).join(' | ');
  const listOfBankersViewDocuments = bankAssignments.map(b => {
    const docs = Array.isArray(b.documents) ? b.documents.map(d => d.docname || d.name).filter(Boolean).join(', ') : '';
    return (b.bank_name || b.bankname || b.name || '') + (docs ? ` (${docs})` : '');
  }).filter(Boolean).join(' | ');
  const bankersLogged = bankAssignments.filter(b => b.loggedIn || b.login_date || b.loginDate || b.loginAt);
  const noOfBankersLogin = bankersLogged.length;
  const listOfBankerLogin = bankersLogged.map(b => b.bank_name || b.bankname || b.name || '').filter(Boolean).join(' | ');

  const sanctionStatus = lead.sanction_status || lead.sanctionStatus || (bankAssignments.find(b => b.sanctionStatus) ? bankAssignments.find(b => b.sanctionStatus).sanctionStatus : '');
  const dateOfSanctionLetter = toDateString(lead.sanction_date || lead.sanctionDate || (bankAssignments.find(b => b.sanctionDate) ? bankAssignments.find(b => b.sanctionDate).sanctionDate : ''));
  const disbursalDate = toDateString(lead.disbursal_date || lead.disbursalDate || (bankAssignments.find(b => b.disbursalDate) ? bankAssignments.find(b => b.disbursalDate).disbursalDate : ''));

  return {
    'Sl.no': index + 1,
    'Case Id': lead.caseid || '',
    'RWOT ID': lead.id || '',
    'Telecaller Name': telecaller || '',
    'Kam Name': kam || '',
    'Operations POC': operations || '',
    'Created Date': createdDate,
    'Created Time': createdTime,
    'Created by': lead.createdby || lead.created_by || '',
    'Meeting Schedule Date': meetingScheduleDate,
    'Meeting Done Date': meetingDoneDate,
    'Customer Name': lead.clientname || lead.customerName || lead.companyname || '',
    'Product': lead.productname || lead.product || '',
    'Value Bucket': lead.turnover || lead.value_bucket || '',
    'Documents Received Date': documentsReceivedDate,
    'One Pager created Date': onePagerCreatedDate,
    'One Pager Status': onePagerStatus,
    'Sent to No of Banker': sentToNoOfBanker,
    'Login Dates': loginDates,
    'List of Banker': listOfBanker,
    'List of Bankers View Documents': listOfBankersViewDocuments,
    'No of Bankers login': noOfBankersLogin,
    'List of banker login': listOfBankerLogin,
    'Status of Sanction Letter': sanctionStatus,
    'Date of Sanction Letter': dateOfSanctionLetter,
    'disbursal date': disbursalDate
  };
};

export const exportLeadsToExcel = (leads = [], filename = 'leads.xlsx') => {
  const data = (leads || []).map((l, idx) => mapLeadForExport(l, idx));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, filename);
};

export default { mapLeadForExport, exportLeadsToExcel };
