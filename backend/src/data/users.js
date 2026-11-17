import { hashPassword } from "../utils/password.js";

const DEMO_PASSWORD = "Password@123";
const passwordHash = hashPassword(DEMO_PASSWORD);

const studentNames = [
  "Aditya Sharma", "Pooja Iyer", "Rahul Desai", "Sneha Patil", "Mohammed Faiz",
  "Neha Gupta", "Arjun Nair", "Divya Krishnan", "Siddharth Rao", "Ishita Banerjee",
  "Karan Malhotra", "Ritika Sharma", "Vivek Menon", "Ananya Bose", "Harsh Vardhan",
  "Priyanka Reddy", "Nikhil Jain", "Sakshi Verma", "Rohit Kulkarni", "Tanya Kapoor",
];

export const students = studentNames.map((fullName, index) => ({
  id: index + 1,
  fullName,
  email: `${fullName.split(" ")[0].toLowerCase()}.${fullName.split(" ")[1].toLowerCase()}@student.internshipjunction.com`,
  phone: `+91 9${String(800000000 + index * 1234567).slice(0, 9)}`,
  role: "student",
  passwordHash,
  avatarUrl: null,
  headline: index % 3 === 0 ? "Aspiring Full-Stack Developer" : index % 3 === 1 ? "Data Enthusiast" : "Learning Product Design",
  createdAt: new Date(Date.now() - (index + 20) * 86400000).toISOString(),
}));

export const mentorNames = [
  "Aarav Mehta", "Priya Nair", "Rohan Verma", "Sneha Kulkarni", "Imran Sheikh",
  "Ananya Reddy", "Karthik Iyer", "Meera Joshi", "Vikram Singh", "Fatima Ansari",
];

export const mentorUsers = mentorNames.map((fullName, index) => ({
  id: 100 + index + 1,
  fullName,
  email: `${fullName.split(" ")[0].toLowerCase()}.${fullName.split(" ")[1].toLowerCase()}@mentor.internshipjunction.com`,
  phone: `+91 7${String(700000000 + index * 9876543).slice(0, 9)}`,
  role: "mentor",
  passwordHash,
  avatarUrl: null,
  headline: "Industry Mentor",
  mentorId: index + 1,
  createdAt: new Date(Date.now() - (index + 60) * 86400000).toISOString(),
}));

export const adminUsers = [
  {
    id: 900,
    fullName: "InternshipJunction Admin",
    email: "admin@internshipjunction.com",
    phone: "+91 9000000001",
    role: "admin",
    passwordHash,
    avatarUrl: null,
    headline: "Platform Administrator",
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
  {
    id: 901,
    fullName: "InternshipJunction Super Admin",
    email: "superadmin@internshipjunction.com",
    phone: "+91 9000000002",
    role: "super_admin",
    passwordHash,
    avatarUrl: null,
    headline: "Platform Owner",
    createdAt: new Date(Date.now() - 220 * 86400000).toISOString(),
  },
];

export const demoCredentials = {
  student: { email: students[0].email, password: DEMO_PASSWORD },
  mentor: { email: mentorUsers[0].email, password: DEMO_PASSWORD },
  admin: { email: adminUsers[0].email, password: DEMO_PASSWORD },
  superAdmin: { email: adminUsers[1].email, password: DEMO_PASSWORD },
};

export const initialUsers = [...students, ...mentorUsers, ...adminUsers];
