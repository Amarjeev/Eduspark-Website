# eduspark-frontend
Eduspark client dashboard — the main user interface for students and clients to access personalized features and services
=======
# EduSpark – School Management Platform

## Author  
**Amarjeev**  

## Project Overview  
EduSpark is a **School Management Platform** built with the MERN stack.  
It provides **secure authentication, admin and student management, email notifications**, and a scalable architecture with professional frontend and backend.  

---

## Why EduSpark?  
EduSpark was created to **simplify school management** by providing a **centralized platform** for administrators, teachers, and students.  
Many schools struggle with managing **student data, exam marks, notifications, and admin tasks manually**. EduSpark solves this by offering a **digital, organized, and secure system**.  

---

## How EduSpark Works (Concept & Flow)  

1. **User Roles**  
   - **Superadmin:** Can manage schools, admins, and oversee the platform.  
   - **Admin:** Manages students, teachers, exams, and daily school operations.  
   - **Student:** Views personal information, marks, and notifications.  

2. **Authentication & Security**  
   - Users register/login using **secure credentials**.  
   - Passwords and sensitive data are stored securely, backend ensures **role-based access**.  

3. **Backend Flow (Node.js + Express)**  
   - Handles all **API requests** from the frontend.  
   - Communicates with **MongoDB Atlas** to store and retrieve data.  
   - Sends **emails via Brevo** for notifications and verification.  
   - Stores **images and uploaded files on AWS S3**.  

4. **Frontend Flow (React.js)**  
   - User-friendly interface built with React.js and Tailwind CSS.  
   - Sends API requests via **Axios** to the backend.  
   - Displays real-time data like student profiles, exam marks, and notifications.  
   - Hosted on **AWS S3** and secured with **Cloudflare** domain/SSL.  

5. **Deployment & Hosting**  
 - Backend → hosted on Render
 - Frontend → hosted on Cloudflare Pages
 - Domain + SSL → managed by Cloudflare 
---

## Tech Stack  

**Backend:**  
- Node.js & Express.js  
- MongoDB Atlas  
- Brevo (Email service)  
- AWS EC2 (Deployment)  

**Frontend:**  
- React.js  
- Tailwind CSS  
- Axios (API communication)  
- AWS S3 (Hosting & Image Storage)  
- Cloudflare (Domain & DNS)  

---

## Key Features  
- Admin & Superadmin authentication  
- Email notifications via Brevo  
- Student profile & data management  
- Exam marks entry and retrieval  
- Profile image uploads stored on **AWS S3**  
- Secure backend with environment variables  
- Backend deployed on **AWS EC2**  
- Frontend hosted on **AWS S3 bucket**  
- Domain & SSL configured via **Cloudflare**  

---

## Deployment Details  

**Backend (AWS EC2):**  
1. Node.js + Express APIs running on AWS EC2  
2. Connected to MongoDB Atlas  
3. Environment variables:  
   ```env
   MONGO_URI=your_mongo_connection_string
   BREVO_API_KEY=your_brevo_api_key
