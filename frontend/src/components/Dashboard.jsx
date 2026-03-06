import React, { useState } from 'react';

const IconUsers = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const IconCheck = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconX = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const IconQuestion = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;

export default function Dashboard({ dashboardData }) {
    const [modalType, setModalType] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    if (!dashboardData || Object.keys(dashboardData).length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="spinner"></div>
                <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading HR metrics...</div>
            </div>
        );
    }

    const listTitleMap = {
        total: "Total Workforce",
        present: "Present Today",
        absent: "Absent Today",
        unmarked: "Unmarked Today"
    };

    const getListToDisplay = () => {
        if (!modalType || !dashboardData) return [];
        switch (modalType) {
            case 'total': return dashboardData.total_list || [];
            case 'present': return dashboardData.present_list || [];
            case 'absent': return dashboardData.absent_list || [];
            case 'unmarked': return dashboardData.unmarked_list || [];
            default: return [];
        }
    };

    const listData = getListToDisplay();

    // Pagination Logic
    const totalPages = Math.ceil(listData.length / itemsPerPage);
    const paginatedList = listData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleOpenModal = (type) => {
        setModalType(type);
        setCurrentPage(1); // Reset page on new modal open
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="stats-grid">
            <div className="stat-card" onClick={() => handleOpenModal('total')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-text)' }}>
                    <IconUsers />
                </div>
                <div className="stat-info">
                    <div className="label">Total Workforce</div>
                    <div className="value">{dashboardData.total_employees || 0}</div>
                </div>
            </div>
            <div className="stat-card" onClick={() => handleOpenModal('present')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                    <IconCheck />
                </div>
                <div className="stat-info">
                    <div className="label">Present Today</div>
                    <div className="value">{dashboardData.present || 0}</div>
                </div>
            </div>
            <div className="stat-card" onClick={() => handleOpenModal('absent')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
                    <IconX />
                </div>
                <div className="stat-info">
                    <div className="label">Absent Today</div>
                    <div className="value">{dashboardData.absent || 0}</div>
                </div>
            </div>
            <div className="stat-card" onClick={() => handleOpenModal('unmarked')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                    <IconQuestion />
                </div>
                <div className="stat-info">
                    <div className="label">Unmarked Today</div>
                    <div className="value">{dashboardData.unmarked || 0}</div>
                </div>
            </div>

            {/* List Modal */}
            {modalType && (
                <div className="modal-backdrop" onClick={() => setModalType(null)}>
                    <div className="modal-content modal-lg animate-slide-in" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{listTitleMap[modalType]} ({listData.length})</h2>
                            <button className="btn-icon" onClick={() => setModalType(null)}>
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', padding: '1.5rem' }}>
                            {listData.length > 0 ? (
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-app)', zIndex: 1 }}>
                                            <tr>
                                                <th>Employee Name</th>
                                                <th>Email</th>
                                                <th>Department</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedList.map(emp => (
                                                <tr key={emp.id}>
                                                    <td>
                                                        <div className="employee-info">
                                                            <div className="employee-details">
                                                                <div className="name">{emp.full_name}</div>
                                                                <div className="id">ID: {emp.employee_id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{emp.email}</td>
                                                    <td><span className="badge badge-info">{emp.department ? emp.department.toUpperCase() : ''}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                                    No employees found in this category.
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, listData.length)} of {listData.length} entries
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
                </div>
            )}
        </div>
    );
}
