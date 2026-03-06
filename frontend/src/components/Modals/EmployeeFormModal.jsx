import React, { useState, useEffect } from 'react';

const IconX = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function EmployeeFormModal({ isOpen, onClose, onSave, employee }) {
    const defaultForm = { employee_id: "", full_name: "", email: "", department: "" };
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill form if editing
    useEffect(() => {
        if (employee) {
            setForm(employee);
        } else {
            setForm(defaultForm);
        }
    }, [employee, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!form.employee_id.trim()) {
            newErrors.employee_id = "Employee ID is required";
        } else if (!/^\d{7}$/.test(form.employee_id)) {
            newErrors.employee_id = "Employee ID must be exactly 7 digits";
        }

        if (!form.full_name.trim()) newErrors.full_name = "Full Name is required";
        if (!form.department.trim()) newErrors.department = "Department is required";
        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email format";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const success = await onSave(form);
        setIsSubmitting(false);

        if (success) {
            setForm({ employee_id: "", full_name: "", email: "", department: "" });
            setErrors({});
            onClose();
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content animate-slide-in">
                <div className="modal-header">
                    <h2 className="modal-title">{employee ? 'Edit Employee' : 'Onboard New Employee'}</h2>
                    <button className="btn-icon" onClick={onClose}><IconX /></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Employee ID <span className="text-danger">*</span></label>
                            <input
                                className={`form-control ${errors.employee_id ? 'is-invalid' : ''}`}
                                placeholder="e.g. 1234567"
                                value={form.employee_id}
                                onChange={e => { setForm({ ...form, employee_id: e.target.value }); if (errors.employee_id) setErrors({ ...errors, employee_id: null }); }}
                            />
                            {errors.employee_id && <div className="invalid-feedback">{errors.employee_id}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name <span className="text-danger">*</span></label>
                            <input
                                className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                                placeholder="Enter full legal name"
                                value={form.full_name}
                                onChange={e => { setForm({ ...form, full_name: e.target.value }); if (errors.full_name) setErrors({ ...errors, full_name: null }); }}
                            />
                            {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address <span className="text-danger">*</span></label>
                            <input
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                type="email"
                                placeholder="email@company.com"
                                value={form.email}
                                onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: null }); }}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department <span className="text-danger">*</span></label>
                            <input
                                className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                                placeholder="e.g. Engineering, Sales"
                                value={form.department}
                                onChange={e => { setForm({ ...form, department: e.target.value }); if (errors.department) setErrors({ ...errors, department: null }); }}
                            />
                            {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                        </div>

                        <div className="modal-footer" style={{ marginTop: '2rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (employee ? 'Save Changes' : 'Create Employee')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
