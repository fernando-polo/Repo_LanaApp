# LanaApp 🏧
A fullstack personal finance application built with React, FastAPI, and MySQL.

## 📌 Description
LanaApp is a personal finance application that allows users to track their income, expenses, and budgets in a structured and intuitive way.

It provides real-time insights into spending behavior, supports recurring payments, and notifies users when they are close to exceeding their budget limits.

This project was built to simulate a real-world financial system, with a strong focus on backend architecture, data consistency, and user experience.


## 📦 Tech Stack
**Frontend:** React, JavaScript (ES6+), HTML, CSS  
**Backend:** FastAPI (Python)  
**Database:** MySQL  
**Authentication:** JWT, bcrypt  
**Tools:** Git, Postman


## 🫆 Features
- User authentication (register, login, password recovery)
- Secure password hashing using bcrypt
- JWT-based session management
- Create, edit, and filter financial transactions
- Category-based budget management
- Alerts when spending exceeds 80% of a budget
- Scheduled and recurring payments
- Automatic transaction generation for fixed payments
- Push notifications and reminders
- Financial dashboard with visual summaries and insights


## ⚙️ How it works
The application follows a client-server architecture where the React frontend communicates with a FastAPI backend via REST APIs.

- Authentication is handled using JWT tokens and secure password hashing
- The backend manages core financial entities such as users, transactions, budgets, and scheduled payments
- Each transaction triggers real-time updates to balances and budget tracking
- Background tasks handle recurring payments by automatically generating transactions
- Notifications are triggered when spending thresholds are reached

The dashboard aggregates and processes financial data to provide meaningful insights into user behavior.


## 🚀 Project Scope
This project was developed as an end-to-end financial management system, covering:

- Requirement analysis (functional and non-functional)
- REST API design and endpoint definition
- Database modeling and data relationships
- User flow and interface design
- System architecture and process design

It reflects how a real-world fintech application can be structured and implemented.


## 📚 What I learned
- Designing and building RESTful APIs with FastAPI
- Implementing secure authentication using JWT and password hashing
- Modeling relational data and managing it with MySQL
- Handling background tasks and asynchronous processes
- Translating system requirements into scalable technical solutions
- Improving backend architecture and code organization
