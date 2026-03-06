from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    department = Column(String, nullable=False)

    attendance = relationship("Attendance", back_populates="employee", cascade="all, delete")

class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("employee_id", "date", name="unique_attendance_per_day"),)

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)

    employee_id = Column(Integer, ForeignKey("employees.id"))
    employee = relationship("Employee", back_populates="attendance")