import React, { useState, useEffect } from "react";
import MeetingDone from "./Tabs/MeetingDone";
import DocumentationInitiated from "./Tabs/DocumentationInitiated";
import DocumentationInProgress from "./Tabs/DocumentationInProgress";
import Underwriting from "./Tabs/Underwriting";
import OnePager from "./Tabs/OnePager";
import Pending from "./Tabs/Pending";
import Open from "./Tabs/Open";
import Accept from "./Tabs/Accept";
import Reject from "./Tabs/Reject";
import Pd from "./Tabs/Pd";
import Login from "./Tabs/Login";
import Sanctioned from "./Tabs/Sanctioned";
import Disbursement from "./Tabs/Disbursement";
import Done from "./Tabs/Done";
import Cold from "./Tabs/Cold";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import NoRequirement from "./Tabs/NoRequirement";

export default function OperationsDashboard() {
    const [activeTab, setActiveTab] = useState("Meeting Done");
    const [meetingDone, setMeetingDone] = useState([]);
    const [documentationInitiated, setDocumentationInitiated] = useState([]);
    const [documentationInProgress, setDocumentationInProgress] = useState([]);
    const [underwriting, setUnderwriting] = useState([]);
    const [onePager, setOnePager] = useState([]);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshToken, setRefreshToken] = useState(false);
    const [currentCaseId, setCurrentCaseId] = useState(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [selectedBanks, setSelectedBanks] = useState([]);
    const [bankList, setBankList] = useState([]);
    const [pending, setPending] = useState([]);
    const [open, setOpen] = useState([]);
    const [accept, setAccept] = useState([]);
    const [reject, setReject] = useState([]);
    const [pd, setPd] = useState([]);
    const [login, setLogin] = useState([]);
    const [sanctioned, setSanctioned] = useState([]);
    const [disbursement, setDisbursement] = useState([]);
    const [done, setDone] = useState([]);
    const [cold, setCold] = useState([]);
    const [noRequirement, setNoRequirement] = useState([]);

    const checkBankAssignmentStatus = (bankAssignments, status) => {
        if (!bankAssignments || bankAssignments.length === 0) return true;
        return bankAssignments.some(assignment => assignment.status?.toLowerCase() === status);
    }

    // Check if case is cold (inactive for more than 48 hours)
    const isColdCase = (caseItem) => {
        return caseItem.status.toLowerCase() !== "open" && caseItem.status.toLowerCase() !== "no requirement" &&  caseItem.status.toLowerCase() !== "done" && caseItem.status.toLowerCase() !== "rejected" && caseItem.status.toLowerCase() !== "meeting done" &&
            caseItem.status_updated_on &&
            dayjs().diff(dayjs(caseItem.status_updated_on), "hour") > 48;
    };

    useEffect(() => {
        setLoading(true);
        setError("");
        apiFetch("/cases", {
            method: "GET",
            token
        })
            .then((res) => {
                const arr = Array.isArray(res) ? res : res.cases || [];

                // Filter cold cases first
                let coldCases = arr.filter(item => isColdCase(item));
                setCold(coldCases);

                // Filter remaining cases (excluding cold cases)
                const activeCases = arr.filter(item => !isColdCase(item));

                let meetingDone = activeCases.filter(item => item.status?.toLowerCase() === "meeting done");
                setMeetingDone(meetingDone);

                let documentationInitiated = activeCases.filter(item => item.status?.toLowerCase() === "documentation initiated");
                setDocumentationInitiated(documentationInitiated);

                let documentationInProgress = activeCases.filter(item => item.status?.toLowerCase() === "documentation in progress" || item.status?.toLowerCase() === "documentation initiated");
                setDocumentationInProgress(documentationInProgress);

                let underwriting = activeCases.filter(item => item.status?.toLowerCase() === "underwriting");
                setUnderwriting(underwriting);

                let onePager = activeCases.filter(item => (["one pager"].includes(item.status?.toLowerCase()) || (["banker review"].includes(item.status?.toLowerCase()) && (checkBankAssignmentStatus(item?.bank_assignments, "pending") || checkBankAssignmentStatus(item?.bank_assignments, "accept") || checkBankAssignmentStatus(item?.bank_assignments, "open")))));
                setOnePager(onePager);

                let pending = activeCases.filter(item => ["banker review"].includes(item.status?.toLowerCase()) && checkBankAssignmentStatus(item?.bank_assignments, "pending"));
                setPending(pending);

                let done = activeCases.filter(item => ["done"].includes(item.status?.toLowerCase()) && checkBankAssignmentStatus(item?.bank_assignments, "done"));
                setDone(done);

                let open = activeCases.filter(item => ["banker review"].includes(item.status?.toLowerCase()) && checkBankAssignmentStatus(item?.bank_assignments, "open"));
                setOpen(open);

                let accept = activeCases.filter(item => ["banker review", "one pager"].includes(item.status?.toLowerCase()) && checkBankAssignmentStatus(item?.bank_assignments, "accept"));
                setAccept(accept);

                let reject = activeCases.filter(item => ["rejected"].includes(item.status?.toLowerCase()) && checkBankAssignmentStatus(item?.bank_assignments, "rejected"));
                setReject(reject);

                let pd = activeCases.filter(item => ["pd"].includes(item.status?.toLowerCase()));
                setPd(pd);

                let login = activeCases.filter(item => ["login"].includes(item.status?.toLowerCase()));
                setLogin(login);

                let sanctioned = activeCases.filter(item => ["sanctioned"].includes(item.status?.toLowerCase()));
                setSanctioned(sanctioned);

                let disbursement = activeCases.filter(item => ["disbursed"].includes(item.status?.toLowerCase()));
                setDisbursement(disbursement);

                let noRequirement = activeCases.filter(item => item.status?.toLowerCase() === "no requirement");
                setNoRequirement(noRequirement);
            })
            .catch((err) => setError(err.message || "Failed to fetch cases"))
            .finally(() => setLoading(false));
    }, [token, refreshToken]);

    const handleRefresh = () => {
        setRefreshToken(prev => !prev);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleShare = async (caseid) => {
        setCurrentCaseId(caseid);
        setSelectedBanks([]);
        await fetchBanks();
        setShowBankModal(true);
    };

    const fetchBanks = async () => {
        try {
            const res = await apiFetch("/banks", { credentials: "include" });
            setBankList(res?.banks || []);
        } catch {
            toast.error("Failed to load banks");
        }
    };

    return (
        <div className="dashboard">
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === "Meeting Done" ? "active" : ""}`}
                    onClick={() => handleTabChange("Meeting Done")}
                >
                    Meeting Done ({meetingDone.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Documentation In Progress" ? "active" : ""}`}
                    onClick={() => handleTabChange("Documentation In Progress")}
                >
                    Documentation In Progress ({documentationInProgress.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Underwriting" ? "active" : ""}`}
                    onClick={() => handleTabChange("Underwriting")}
                >
                    Underwriting ({underwriting.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "One Pager" ? "active" : ""}`}
                    onClick={() => handleTabChange("One Pager")}
                >
                    One Pager ({onePager.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Login" ? "active" : ""}`}
                    onClick={() => handleTabChange("Login")}
                >
                    Login ({login.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Pd" ? "active" : ""}`}
                    onClick={() => handleTabChange("Pd")}
                >
                    PD ({pd.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Sanctioned" ? "active" : ""}`}
                    onClick={() => handleTabChange("Sanctioned")}
                >
                    Sanctioned ({sanctioned.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Disbursement" ? "active" : ""}`}
                    onClick={() => handleTabChange("Disbursement")}
                >
                    Disbursement ({disbursement.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "Done" ? "active" : ""}`}
                    onClick={() => handleTabChange("Done")}
                >
                    Done ({done.length})
                </button>

                <button
                    className={`tab-button ${activeTab === "Reject" ? "active" : ""}`}
                    onClick={() => handleTabChange("Reject")}
                >
                    Reject ({reject.length})
                </button>

                <button
                    className={`tab-button ${activeTab === "Cold" ? "active" : ""}`}
                    onClick={() => handleTabChange("Cold")}
                >
                    Cold ({cold.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "No Requirement" ? "active" : ""}`}
                    onClick={() => handleTabChange("No Requirement")}
                >
                    No Requirement ({noRequirement.length})
                </button>
            </div>
            <div className="tab-content">
                {activeTab === "Meeting Done" && <MeetingDone cases={meetingDone} handleRefresh={handleRefresh} />}
                {activeTab === "Documentation In Progress" && <DocumentationInProgress cases={documentationInProgress} handleRefresh={handleRefresh} />}
                {activeTab === "Underwriting" && <Underwriting cases={underwriting} handleRefresh={handleRefresh} />}
                {activeTab === "One Pager" && <OnePager cases={onePager} handleRefresh={handleRefresh} />}
                {activeTab === "Pending" && <Pending cases={pending} handleRefresh={handleRefresh} />}
                {activeTab === "Open" && <Open cases={open} handleRefresh={handleRefresh} />}
                {activeTab === "Accept" && <Accept cases={accept} handleRefresh={handleRefresh} />}
                {activeTab === "Reject" && <Reject cases={reject} handleRefresh={handleRefresh} />}
                {activeTab === "Login" && <Login cases={login} handleRefresh={handleRefresh} />}
                {activeTab === "Pd" && <Pd cases={pd} handleRefresh={handleRefresh} />}
                {activeTab === "Sanctioned" && <Sanctioned cases={sanctioned} handleRefresh={handleRefresh} />}
                {activeTab === "Disbursement" && <Disbursement cases={disbursement} handleRefresh={handleRefresh} />}
                {activeTab === "Done" && <Done cases={done} handleRefresh={handleRefresh} />}
                {activeTab === "Cold" && <Cold cases={cold} handleRefresh={handleRefresh} />}
                {activeTab === "No Requirement" && <NoRequirement cases={noRequirement} handleRefresh={handleRefresh} />}
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        </div>
    );
}