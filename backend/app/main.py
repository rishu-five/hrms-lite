from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .database import SessionLocal, engine
from .models import Base, Employee, Attendance
from .schemas import *

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    from datetime import date
    today = date.today()
    employees = db.query(Employee).all()
    
    present_records = db.query(Attendance).filter(Attendance.status=="Present", Attendance.date==today).all()
    absent_records = db.query(Attendance).filter(Attendance.status=="Absent", Attendance.date==today).all()
    
    present_emp_ids = {r.employee_id for r in present_records}
    absent_emp_ids = {r.employee_id for r in absent_records}
    
    present_list = [emp for emp in employees if emp.id in present_emp_ids]
    absent_list = [emp for emp in employees if emp.id in absent_emp_ids]
    unmarked_list = [emp for emp in employees if emp.id not in present_emp_ids and emp.id not in absent_emp_ids]
    
    return {
        "total_employees": len(employees),
        "present": len(present_list),
        "absent": len(absent_list),
        "unmarked": len(unmarked_list),
        "total_list": employees,
        "present_list": present_list,
        "absent_list": absent_list,
        "unmarked_list": unmarked_list
    }

@app.post("/api/employees", response_model=EmployeeResponse, status_code=201)
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    existing_email = db.query(Employee).filter(Employee.email == emp.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email address already exists")

    db_emp = Employee(**emp.dict())
    db.add(db_emp)
    try:
        db.commit()
        db.refresh(db_emp)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    return db_emp

@app.put("/api/employees/{id}", response_model=EmployeeResponse)
def update_employee(id: int, emp: EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = db.query(Employee).filter(Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    # Check if the desired email is taken by SOMEONE ELSE
    existing_email = db.query(Employee).filter(Employee.email == emp.email, Employee.id != id).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email address already exists")

    db_emp.employee_id = emp.employee_id
    db_emp.full_name = emp.full_name
    db_emp.email = emp.email
    db_emp.department = emp.department

    try:
        db.commit()
        db.refresh(db_emp)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    
    return db_emp

@app.get("/api/employees", response_model=list[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()

@app.delete("/api/employees/{id}", status_code=204)
def delete_employee(id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()

@app.post("/api/attendance", response_model=AttendanceResponse, status_code=201)
def mark_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == att.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db_att = Attendance(**att.dict())
    db.add(db_att)
    try:
        db.commit()
        db.refresh(db_att)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")
    return db_att

@app.get("/api/attendance/{employee_id}", response_model=list[AttendanceResponse])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    return db.query(Attendance).filter(Attendance.employee_id == employee_id).all()

@app.get("/api/attendance", response_model=list[AttendanceResponse])
def get_all_attendance(date: str = None, db: Session = Depends(get_db)):
    from datetime import datetime
    query = db.query(Attendance)
    if date:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        query = query.filter(Attendance.date == date_obj)
    return query.all()