import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const IconX = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function AttendanceModal({ isOpen, onClose, employee, showToast, refreshDashboard }) {
    if (!isOpen || !employee) return null;

    const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
    const [attendance, setAttendance] = useState({ date: new Date().toISOString().split('T')[0], status: "Present" });
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    useEffect(() => {
        if (isOpen) {
            setAttendance({ date: new Date().toISOString().split('T')[0], status: "Present" });
            setActiveTab('mark');
            setDateFilter('');
            setCurrentPage(1);
        }
    }, [isOpen, employee]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await axios.get(`${API}/attendance/${employee.id}`);
            // Sort by date descending
            setHistory(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (err) {
            showToast("Failed to fetch history.", "error");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleMark = async (e) => {
        e.preventDefault();
        if (!attendance.date) {
            showToast("Please select a date.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.post(`${API}/attendance`, {
                ...attendance,
                employee_id: employee.id
            });
            showToast(`Successfully marked ${attendance.status} for ${attendance.date}`, "success");
            setAttendance(prev => ({ ...prev, date: '' }));
            refreshDashboard(); // ensure the home dash totals reflect the new attendance
            // switch to history to show it
            setActiveTab('history');
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to mark attendance.";
            showToast(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Bonus functionality
    const filteredHistory = dateFilter
        ? history.filter(item => item.date === dateFilter)
        : history;

    // Pagination Logic
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDateFilterChange = (e) => {
        setDateFilter(e.target.value);
        setCurrentPage(1); // Reset to page 1 when filtering
    };

    const totalPresent = history.filter(item => item.status === "Present").length;

    return (
        <div className="modal-backdrop">
            <div className="modal-content modal-lg animate-slide-in">
                <div className="modal-header">
                    <h2 className="modal-title">Attendance: {employee.full_name}</h2>
                    <button className="btn-icon" onClick={onClose}><IconX /></button>
                </div>

                <div className="modal-tabs">
                    <button className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`} onClick={() => setActiveTab('mark')}>
                        Mark Attendance
                    </button>
                    <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        View History
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'mark' && (
                        <form onSubmit={handleMark}>
                            <div className="form-group">
                                <label className="form-label">Review Date</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={attendance.date}
                                    onChange={e => setAttendance({ ...attendance, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-control"
                                    value={attendance.status}
                                    onChange={e => setAttendance({ ...attendance, status: e.target.value })}
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>
                            <div className="modal-footer" style={{ marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Logging...' : 'Log Attendance'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'history' && (
                        <div className="history-section">
                            <div className="history-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <div className="bonus-stat text-success" style={{ fontWeight: '600' }}>
                                    Total Present Days: {totalPresent}
                                </div>
                                <div className="filter-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <label className="text-muted" style={{ fontSize: '0.875rem' }}>Filter by Date:</label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={dateFilter}
                                        style={{ padding: '0.4rem', width: 'auto', fontSize: '0.85rem' }}
                                        onChange={handleDateFilterChange}
                                    />
                                    {dateFilter && (
                                        <button type="button" className="btn-icon" style={{ color: 'var(--danger-text)' }} onClick={() => setDateFilter('')}>
                                            <IconX />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                <table className="data-table">
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-app)', zIndex: 1 }}>
                                        <tr>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingHistory ? (
                                            <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                        ) : paginatedHistory.length > 0 ? (
                                            paginatedHistory.map(rec => (
                                                <tr key={rec.id}>
                                                    <td>{rec.date}</td>
                                                    <td>
                                                        <span className={`badge ${rec.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                                                            {rec.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendance records found for this page.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {!loadingHistory && filteredHistory.length === 0 && (
                                <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)", backgroundColor: "#f8fafc", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-light)" }}>
                                    No attendance records found.
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0 0' }}>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            Prev
                                        </button>

                                        <button
                                            className="btn btn-outline btn-sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
