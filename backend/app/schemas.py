from pydantic import BaseModel, EmailStr, Field
from datetime import date
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    employee_id: str = Field(..., pattern=r"^\d{7}$", description="Must be exactly 7 numeric digits")

class EmployeeResponse(EmployeeBase):
    id: int
    class Config:
        orm_mode = True

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus

class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    status: AttendanceStatus
    class Config:
        orm_mode = True