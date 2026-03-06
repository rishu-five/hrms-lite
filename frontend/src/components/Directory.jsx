import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const IconPlus = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconTrash = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconX = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconEdit = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;

export default function Directory({ employees, loading, refreshTrigger, onAddEmployee, onViewAttendance, onDeleteEmployee, onEditEmployee }) {

    const [filterDate, setFilterDate] = useState('');
    const [dailyAttendance, setDailyAttendance] = useState({});
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [totalPresentCounts, setTotalPresentCounts] = useState({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // professional norm for typical dashboard views

    useEffect(() => {
        fetchAllAttendance();
    }, [refreshTrigger]);

    const fetchAllAttendance = async () => {
        try {
            const res = await axios.get(`${API}/attendance`);
            const counts = {};
            res.data.forEach(att => {
                if (att.status === 'Present') {
                    counts[att.employee_id] = (counts[att.employee_id] || 0) + 1;
                }
            });
            setTotalPresentCounts(counts);
        } catch (err) {
            console.error("Failed to fetch all attendance", err);
        }
    };

    useEffect(() => {
        if (filterDate) {
            fetchDailyAttendance();
        } else {
            setDailyAttendance({});
        }
    }, [filterDate]);

    const fetchDailyAttendance = async () => {
        setLoadingAttendance(true);
        try {
            const res = await axios.get(`${API}/attendance?date=${filterDate}`);
            const map = {};
            res.data.forEach(att => map[att.employee_id] = att.status);
            setDailyAttendance(map);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
    };

    // Pagination Logic
    const totalPages = Math.ceil(employees.length / itemsPerPage);
    const paginatedEmployees = employees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Reset to page 1 if searching/filtering happens (in future or if date filtering affects total count)
    // currently filterDate doesn't hide employees, just shows different status.

    return (
        <div className="panel animate-fade-in">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="panel-title">Employee Directory</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className="text-muted" style={{ fontSize: '0.875rem' }}>Filter by Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            style={{ width: 'auto', padding: '0.4rem' }}
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                        {filterDate && (
                            <button className="btn-icon" onClick={() => setFilterDate('')}>
                                <IconX />
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={onAddEmployee}>
                        <IconPlus /> Add Employee
                    </button>
                </div>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Contact</th>
                            <th>Department</th>
                            {filterDate ? <th>Status on {filterDate}</th> : <th>Total Present</th>}
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading || loadingAttendance ? (
                            <tr>
                                <td colSpan={filterDate ? 5 : 4} style={{ textAlign: "center", padding: "3rem" }}>
                                    <div className="spinner"></div>
                                    <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Loading records...</div>
                                </td>
                            </tr>
                        ) : paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="employee-info">
                                            <div className="employee-avatar">{getInitials(emp.full_name)}</div>
                                            <div className="employee-details">
                                                <div className="name">{emp.full_name}</div>
                                                <div className="id">ID: {emp.employee_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{emp.email}</td>
                                    <td><span className="badge badge-info">{emp.department ? emp.department.toUpperCase() : ''}</span></td>
                                    {filterDate ? (
                                        <td>
                                            {dailyAttendance[emp.id] === 'Present' ? (
                                                <span className="badge badge-success">Present</span>
                                            ) : dailyAttendance[emp.id] === 'Absent' ? (
                                                <span className="badge badge-danger">Absent</span>
                                            ) : (
                                                <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}>Unmarked</span>
                                            )}
                                        </td>
                                    ) : (
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                                                {totalPresentCounts[emp.id] || 0} {totalPresentCounts[emp.id] === 1 ? 'Day' : 'Days'}
                                            </span>
                                        </td>
                                    )}
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => onEditEmployee(emp)} title="Edit Employee Info">
                                                <IconEdit />
                                            </button>
                                            <button className="btn btn-outline btn-sm" onClick={() => onViewAttendance(emp)}>
                                                Attendance
                                            </button>
                                            <button className="btn btn-danger-outline btn-sm" onClick={() => {
                                                window.confirm(`Are you sure you want to delete ${emp.full_name}?`) && onDeleteEmployee(emp.id);
                                            }}>
                                                <IconTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={filterDate ? 5 : 4} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                                    No employees found. Click "Add Employee" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, employees.length)} of {employees.length} entries
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handlePageChange(page)}
                                style={{ minWidth: '32px' }}
                            >
                                {page}
                            </button>
                        ))}

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
    );
}
