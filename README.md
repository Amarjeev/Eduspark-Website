# 🎓 **EduSpark Frontend**

> **Eduspark Client Dashboard** — the main user interface for **students, teachers, and clients** to access personalized features and services.

---

## 👨‍💻 **Author**  
**Amarjeev**

---

## 🚀 **Project Overview**  
**EduSpark** is a **School Management Platform** built with the **MERN stack** (MongoDB, Express, React, Node.js).  
It provides **secure authentication**, **admin and student management**, **email notifications**, and a **scalable architecture** with a professional frontend and backend.

---

## 💡 **Why EduSpark?**  
EduSpark was created to **simplify school management** by offering a **centralized digital platform** for administrators, teachers, and students.  
Many schools struggle with **manual handling of student data, exam marks, and notifications** — EduSpark provides a **secure, digital, and organized solution**.

---

## ⚙️ **How EduSpark Works (Concept & Flow)**  

### 🧑‍🤝‍🧑 **1. User Roles**
- **Superadmin:** Manages schools, admins, and oversees the platform.  
- **Admin:** Handles students, teachers, exams, and daily operations.  
- **Student:** Views personal information, marks, and notifications.

---

### 🔐 **2. Authentication & Security**
- Users register/login using **secure credentials**.  
- **Role-based access control** ensures privacy and data protection.  
- Passwords and sensitive data are stored safely.  
- Authentication handled via **JWT + HTTP-only cookies**.

---

### 🖥️ **3. Backend Flow (Node.js + Express)**
- Handles all **API requests** from the frontend.  
- Connects with **MongoDB Atlas** to store and retrieve data.  
- Sends **email notifications** via **Brevo (SendinBlue)**.  
- Stores **images and documents** on **AWS S3**.  

---

### 💻 **4. Frontend Flow (React.js + Tailwind CSS)**
- Developed with **React.js** and styled using **Tailwind CSS**.  
- API requests handled via **Axios**.  
- Displays live student data, notifications, and results.  
- Hosted on **Cloudflare Pages** with **SSL security**.  

---

### 🌐 **5. Deployment & Hosting**
- 🧩 **Backend:** Render  
- 🖼️ **Frontend:** Cloudflare Pages  
- 🔒 **Domain & SSL:** Managed via Cloudflare  

---

## 🧠 **Tech Stack**

### 🖥️ **Backend**
- **Node.js + Express.js**  
- **MongoDB Atlas**  
- **Brevo (Email Service)**  
- **AWS EC2 (Deployment)**  

### 💻 **Frontend**
- **React.js**  
- **Tailwind CSS**  
- **Axios (API Communication)**  
- **Cloudflare Pages (Hosting)**  
- **AWS S3 (File Storage)**  

---

## ✨ **Key Features**
- 🔑 **Admin & Superadmin authentication**  
- 📧 **Email notifications** via Brevo  
- 🧾 **Student profile and data management**  
- 🧮 **Exam marks entry and retrieval**  
- 🖼️ **Profile image uploads** stored on AWS S3  
- 🛡️ **Secure backend** using environment variables  
- 🚀 **Backend deployed** on Render  
- 🌍 **Frontend hosted** on Cloudflare Pages  
- 🔒 **SSL & DNS managed** by Cloudflare  

---

## ⚙️ **Deployment Details**

### 🧩 **Backend (Render / AWS EC2)**
1. Node.js + Express APIs connected to **MongoDB Atlas**.  
2. Uses **Brevo** for transactional emails.  
3. Stores files in **AWS S3**.

### 🔐 **Environment Variables**

#### **Frontend (.env)**
```env
VITE_API_URL=your_backend_api_url
VITE_APP_NAME=EduSpark
VITE_SECRET_KEY=eduspark_secret_key_2025
```

#### **Backend (.env)**
```env
MONGO_URI=your_mongo_connection_string
BREVO_API_KEY=your_brevo_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
JWT_SECRET=your_jwt_secret
```

---

## 🌍 **Live Website**
🔗 [https://www.eduspark.space](https://www.eduspark.space)

---

## 🌱 **Personal Note — My First Project**
> This is my **first full-stack project**, built completely from scratch.  
> I know there might be **bugs and performance issues**, but every step of this journey has been a **learning experience**.  
> With each new project, I aim to **improve my code quality, structure, and performance**.  
>  
> 💪 **Mistakes are part of progress — every bug I fix makes me a better developer!**  
>  
> 🚀 **EduSpark is not just a project — it’s the beginning of my developer journey.**
