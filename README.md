🎓 EduSpark Frontend

Eduspark Client Dashboard — the main user interface for students, teachers, and clients to access personalized features and services.

👨‍💻 Author

Amarjeev

🚀 Project Overview

EduSpark is a modern School Management Platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
This frontend repository powers the student, teacher, and admin dashboards, offering a fast, secure, and responsive experience across all devices.

💡 Why EduSpark?

Many schools still rely on manual systems for managing students, exams, and communications.
EduSpark brings automation and efficiency through a centralized digital platform, simplifying management for admins, teachers, and students alike.

🧭 System Roles & Flow
👑 Superadmin

Manages schools and admin users

Oversees the entire EduSpark ecosystem

🧑‍🏫 Admin

Handles teachers, students, exams, and academic operations

Manages attendance, notifications, and data records

🎓 Student

Views personal details, marks, and updates

Interacts through a personalized dashboard

🔐 Authentication & Security

Secure JWT-based authentication

HTTP-only cookies for safe token storage

Role-based access control

All data exchanges occur over HTTPS

Uses environment variables for sensitive keys

🧩 Frontend Architecture (React.js + Tailwind CSS)

Built with React.js (Vite setup)

Tailwind CSS for modern UI design

Axios for backend communication

React Router DOM for route management

Hosted securely on Cloudflare Pages

☁️ Deployment & Infrastructure
Component	Platform	Description
Backend	Render	Node.js + Express REST API
Frontend	Cloudflare Pages	React.js dashboard for students and admins
Database	MongoDB Atlas	Cloud-hosted database
Email Service	Brevo (SendinBlue)	Email notifications & verifications
File Storage	AWS S3	Stores profile images and uploads
Domain + SSL	Cloudflare	Custom domain & SSL management
⚙️ Environment Variables (Frontend)

Place these in your .env file at the project root:

VITE_SECRET_KEY= .........


🧠 Tech Stack Summary

Frontend:

⚛️ React.js (Vite)

🎨 Tailwind CSS

🔗 Axios

🌐 Cloudflare Pages

Backend:

🟢 Node.js + Express.js

☁️ MongoDB Atlas

📩 Brevo (Email Service)

🪣 AWS S3 (Storage)

✨ Key Features

Dynamic dashboards for Admin, Teacher, and Student

Secure authentication system (JWT + Cookies)

Email notifications via Brevo

Profile image uploads to AWS S3

Real-time data synchronization

Optimized for performance using Vite

Cloudflare-secured deployment with SSL

🌍 Live Deployment

🔗 https://www.eduspark.space
