import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import Toast from './components/Toast';

// Modals
import EmployeeFormModal from './components/Modals/EmployeeFormModal';
import AttendanceModal from './components/Modals/AttendanceModal';

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // UI State
  const [toast, setToast] = useState({ message: '', type: '' });

  // Custom Modal State
  const [attModalState, setAttModalState] = useState({ isOpen: false, employee: null });
  const [empModalState, setEmpModalState] = useState({ isOpen: false, employee: null }); // null means Add, object means Edit

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, dashRes] = await Promise.all([
        axios.get(`${API}/employees`),
        axios.get(`${API}/dashboard`)
      ]);
      setEmployees(empRes.data);
      setDashboard(dashRes.data);
    } catch (err) {
      showToast("Failed to fetch server data. Check if backend is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  const manualRefresh = () => {
    fetchAllData();
    setRefreshTrigger(prev => prev + 1);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Logic to add or update an employee from the modal
  const saveEmployee = async (formData) => {
    const isEditing = !!formData.id;

    if (employees.some(emp => emp.email.toLowerCase() === formData.email.toLowerCase() && emp.id !== formData.id)) {
      showToast("An employee with this email already exists.", "error");
      return false;
    }

    try {
      if (isEditing) {
        await axios.put(`${API}/employees/${formData.id}`, formData);
        showToast(`Employee ${formData.full_name} updated successfully.`);
      } else {
        await axios.post(`${API}/employees`, formData);
        showToast(`Employee ${formData.full_name} added correctly.`);
      }
      fetchAllData();
      return true; // Used to tell modal to close
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to save employee";
      showToast(msg, "error");
      return false;
    }
  };

  // Logic to delete an employee
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${API}/employees/${id}`);
      showToast("Employee deleted permanently.", "success");
      fetchAllData();
    } catch (err) {
      showToast("Failed to delete employee.", "error");
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Mount */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close sidebar on mobile when navigating
        }} />
      </div>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="topbar-title">Organization Workspace</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-outline btn-sm" onClick={manualRefresh} title="Refresh Data" disabled={loading}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16" className={loading ? 'spinner' : ''} style={loading ? { animation: 'spinner 1s linear infinite' } : {}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="hide-on-mobile">Refresh</span>
            </button>
            <div className="user-profile">
              <span>Admin Control Panel</span>
              <div className="avatar">A</div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="content-container animate-fade-in">
            {activeTab === 'dashboard' && (
              <>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>HR Overview</h1>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>High-level statistics for your organization's attendance and workforce.</p>
                </div>
                {loading ? <div className="spinner" style={{ marginTop: '3rem' }}></div> : <Dashboard dashboardData={dashboard} />}
                {/* On Dashboard, let's also render the directory so it's a unified view as before, if preferred, or they just navigate. The assignment allowed one simple view. We'll show an overview. */}
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => setActiveTab('directory')}>Manage Employee Records &rarr;</button>
                </div>
              </>
            )}

            {activeTab === 'directory' && (
              <Directory
                employees={employees}
                loading={loading}
                refreshTrigger={refreshTrigger}
                onAddEmployee={() => setEmpModalState({ isOpen: true, employee: null })}
                onEditEmployee={(emp) => setEmpModalState({ isOpen: true, employee: emp })}
                onViewAttendance={(emp) => setAttModalState({ isOpen: true, employee: emp })}
                onDeleteEmployee={deleteEmployee}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals placed outside main flow */}
      <EmployeeFormModal
        isOpen={empModalState.isOpen}
        employee={empModalState.employee}
        onClose={() => setEmpModalState({ isOpen: false, employee: null })}
        onSave={saveEmployee}
      />

      <AttendanceModal
        isOpen={attModalState.isOpen}
        onClose={() => setAttModalState({ isOpen: false, employee: null })}
        employee={attModalState.employee}
        showToast={showToast}
        refreshDashboard={fetchAllData}
      />
    </div>
  );
}