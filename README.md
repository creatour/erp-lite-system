# ERP Lite System

## 📌 Project Path

C:\Users\nasro\Desktop\erp-lite-system

---

## 📌 Overview

This is a full-stack ERP (Enterprise Resource Planning) system built using modern web technologies. It simulates real-world ERP functionalities such as inventory management, order processing, and customer management.

---

## 🚀 Tech Stack

* Frontend: Next.js (React)
* Backend: Node.js + Express
* Database: MySQL
* Styling: Tailwind CSS

---

## 📂 Project Structure

C:\Users\nasro\Desktop\erp-lite-system
├── backend
│   ├── config
│   ├── controllers
│   ├── routes
│   ├── server.js
│   └── .env
│
├── app
├── components
├── lib
├── public
├── styles
└── README.md

---

## 📦 Features

### 1. Inventory Management

* Manage products (add, update, delete)
* Track stock levels
* SKU-based product system

### 2. Customer Management

* Store and manage customer data
* Email and contact validation

### 3. Order Management (Core ERP Logic)

* Create orders with multiple products
* Order lifecycle:

  * Pending
  * Completed
* Automatic total calculation
* Stock validation and deduction upon order confirmation

---

## 🔥 ERP Business Logic

* Orders are created with "pending" status
* Stock is only deducted when the order is confirmed
* Prevents negative stock (validation)
* Uses relational database structure:

  * orders
  * order_items
  * products
  * customers

---

## 🧠 Database Design

* Normalized relational schema
* Foreign key relationships
* Supports real ERP data flow

---

## 🔗 API Endpoints

### Products

* GET /api/products
* POST /api/products
* PUT /api/products/:id
* DELETE /api/products/:id

### Orders

* POST /api/orders
* POST /api/orders/confirm/:id
* GET /api/orders
* GET /api/orders/:id

### Customers

* GET /api/customers
* POST /api/customers

---

## 🛠️ Setup Instructions

### Backend (Path)

C:\Users\nasro\Desktop\erp-lite-system\backend
cd C:\Users\nasro\Desktop\erp-lite-system\backend

Run:
cd backend
npm install
npm run dev

---

### Frontend (Path)

C:\Users\nasro\Desktop\erp-lite-system

Run:
cd ..
npm install
npm run dev

---

## 🌐 URLs

* Frontend: http://localhost:3000
* Backend: http://localhost:4000

---

## 💡 Author Notes

This project was built to simulate real-world ERP development and demonstrate full-stack capabilities including backend logic, database design, and system integration.

### ACCOUNTS
            admin@erp.com      [Visible only for User Management]
            / admin123
            manager@erp.com    
            / admin123
            staff@erp.com
            / admin123