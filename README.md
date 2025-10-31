EduSpark – School Management Platform
Author

Amarjeev

Project Overview

EduSpark is a School Management Platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
It provides secure authentication, admin/student management, email notifications, and a scalable architecture for schools to manage data digitally and efficiently.

Why EduSpark?

EduSpark was created to simplify school operations by offering a centralized digital platform for administrators, teachers, and students.
It replaces manual processes with automated, secure, and user-friendly management tools.

How EduSpark Works
1. User Roles

Superadmin: Manages schools, admins, and global settings.

Admin: Handles students, teachers, exams, and daily school operations.

Student: Accesses personal details, marks, and notifications.

2. Authentication & Security

Secure login and registration system with role-based access.

Passwords are hashed and all sensitive data is protected with environment variables.

3. Backend Flow (Node.js + Express)

Handles API requests and communicates with MongoDB Atlas.

Integrates Brevo for email notifications and verification.

Manages file uploads and stores images securely on AWS S3.

4. Frontend Flow (React.js)

Clean and responsive UI built with React.js + Tailwind CSS.

Communicates with backend via Axios.

Displays real-time student profiles, marks, and notifications.

Deployment & Hosting

Backend: Deployed on Render for scalability and reliable uptime.

Frontend: Hosted on Cloudflare Pages for global CDN performance.

Domain & SSL: Managed via Cloudflare for secure HTTPS access.

Tech Stack

Backend:

Node.js & Express.js

MongoDB Atlas

Brevo (Email Service)

AWS S3 (Image Storage)

Render (Deployment)

Frontend:

React.js

Tailwind CSS

Axios

Cloudflare Pages (Hosting)

Cloudflare (DNS & SSL)

Key Features

Role-based authentication (Superadmin, Admin, Student)

Email notifications via Brevo

Student data and exam management

Secure file uploads (stored on AWS S3)

Environment-based configuration

Deployed backend on Render

Frontend hosted on Cloudflare Pages

Cloudflare handles domain routing and SSL
