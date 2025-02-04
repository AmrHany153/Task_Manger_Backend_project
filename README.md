# Task Manger App

### started at: 2024/12/24# Task_Manger_Backend_project
# Task Management System API 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust backend API for task management with role-based access control and group collaboration features.

## Features ✨

- 🔐 **Authentication System**
  - Session-based auth using Passport.js
  - 5 User Roles: Admin, Owner, Moderator, Member, User

- 🗃️ **Hybrid Database Architecture**
  - MySQL: Core data (Users, Tasks, Groups)
  - MongoDB: Group memberships and (permissions coming soon!)

- 🛡️ **Advanced Validation**
  - Request validation with express-validator
  - Async database checks
  - Custom error handling

- 📊 **Complex Query Support**
  - Filter tasks by: user, status, group
  - Pagination-ready endpoints

## Tech Stack 💻

| Component       | Technology |
|-----------------|------------|
| Runtime         | Node.js 18 |
| Framework       | Express 4  |
| SQL Database    | MySQL 8    |
| NoSQL Database  | MongoDB 6  |
| ORM/ODM         | Mongoose, mysql2 |
| Authentication  | Passport.js, express-session |
| Validation      | express-validator |

## API Documentation 📚

[![Run in Postman](https://run.pstmn.io/button.svg)](https://god.gw.postman.com/run-collection/REPLACE_WITH_YOUR_ID)

**Core Endpoints**:
- `POST /auth/login` - User login
- `POST /groups` - Create new group (Requires User role)
- `PATCH /groups/addMember` - Add group member (Requires Moderator+)
- `GET /tasks?status=:id&group=:id` - Filter tasks

(the full documentation is coming soon!)

## Installation 🛠️

```bash
# Clone repository
git clone https://github.com/AmrHany153/Task_Manger_Backend_project.git
cd task-manager-api

# Install dependencies
npm install 

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Initialize databases
mysql -u root -p < database/setup.sql

# Start development server
npm run dev

