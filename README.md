# Job Application Tracking System (ATS) Backend

## Table of Contents
1. [Project Overview](#project-overview)  
2. [Architecture](#architecture)  
3. [Application Workflow & State Transitions](#application-workflow--state-transitions)  
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)  
5. [Database Schema](#database-schema)  
6. [Setup Instructions](#setup-instructions)  
7. [Running the Application](#running-the-application)  
8. [Running Tests](#running-tests)  
9. [Postman Collection](#postman-collection)  

---

## Project Overview
The Job Application Tracking System (ATS) backend manages candidates, jobs, and applications in a company. Key features include:  
- Role-based access control (candidate, recruiter, hiring_manager).  
- Application stage workflow with strict state machine enforcement.  
- Asynchronous email notifications through a background worker.  
- Full audit trail of all application stage changes.

---

## Architecture

[ Client ] <--HTTP--> [ Express API Server ] <--MQ--> [ Background Worker (Email) ]
| ^
v |
[ MySQL Database ]---------------------------

markdown
Copy code

**Key points:**
- Express server handles REST API requests.  
- Authentication via JWT tokens.  
- Role-based access control enforced via middleware.  
- Application stage transitions validated by `ApplicationStateService`.  
- Emails queued to a message broker (Redis/RabbitMQ) for asynchronous processing.  

---

## Application Workflow & State Transitions

### Valid Stages:
`Applied → Screening → Interview → Offer → Hired`  
`Rejected` can be reached from any stage.

### State Transition Diagram:
Applied → Screening → Interview → Offer → Hired
│ │
└─────────────→ Rejected ←───┘

elixir
Copy code

---

## Role-Based Access Control (RBAC)

| Endpoint                            | Candidate | Recruiter | Hiring Manager |
|------------------------------------|:---------:|:---------:|:--------------:|
| POST /applications                  | ✅        | ❌        | ❌             |
| GET /applications/my-applications  | ✅        | ❌        | ❌             |
| GET /applications/:id               | ✅(own)   | ✅        | ✅             |
| PUT /applications/:id/stage         | ❌        | ✅        | ❌             |
| GET /applications/:id/history       | ✅(own)   | ✅        | ✅             |
| CRUD /jobs                          | ❌        | ✅        | ❌             |
| GET /applications/jobs-applications | ❌        | ✅        | ❌             |

---

## Database Schema

### Users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'recruiter', 'hiring_manager') NOT NULL,
  company_id INT,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
Companies
sql
Copy code
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL
);
Jobs
sql
Copy code
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open','closed') DEFAULT 'open',
  company_id INT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
Applications
sql
Copy code
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  candidate_id INT NOT NULL,
  stage ENUM('applied','screening','interview','offer','hired','rejected') NOT NULL DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (candidate_id) REFERENCES users(id)
);
Application History
sql
Copy code
CREATE TABLE application_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  previous_stage VARCHAR(50),
  new_stage VARCHAR(50),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);
ERD Diagram

+----------------+          +----------------+         +----------------+
|    USERS       |          |   COMPANIES    |         |     JOBS       |
+----------------+          +----------------+         +----------------+
| id (PK)        |◄---+     | id (PK)        |     +--►| id (PK)        |
| name           |     |    | name           |     |   | title          |
| email          |     +----|                |     |   | description    |
| password       |          +----------------+     |   | status         |
| role           |                                 +--►| company_id (FK)|
| company_id (FK)|--------------------------------------+----------------+
+----------------+

         +------------------+          +------------------------+
         |  APPLICATIONS    |          |  APPLICATION_HISTORY   |
         +------------------+          +------------------------+
         | id (PK)          |◄-------- | id (PK)                |
         | job_id (FK)      |          | application_id (FK)    |
         | candidate_id (FK)|          | previous_stage         |
         | stage            |          | new_stage              |
         | applied_at       |          | changed_at             |
         +------------------+          +------------------------+   

Setup Instructions
Clone the repository:

bash
Copy code
git clone <your-repo-url>
cd JobApplicationTrackingSystem
Install dependencies:

bash
Copy code
npm install
Setup environment variables in .env:

ini
Copy code
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ats_db
PORT=5000
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE_API_KEY=your-email-api-key
Create the database:

sql
Copy code
CREATE DATABASE ats_db;
Run provided SQL scripts to create tables and seed data.

Running the Application
Start the server:

bash
Copy code
npm run dev
Start the background worker for asynchronous emails:

bash
Copy code
node backend/worker.js
Access API at http://localhost:5000/.

Running Tests
bash
Copy code
npm test
Tests include unit tests for ApplicationStateService, RBAC middleware, and integration tests for API endpoints using mocha and chai.

Postman Collection
Import ATS_API_Collection.json into Postman to test all endpoints. Includes headers, JWT auth, request bodies, and example responses.

Notes:

Proper JWT tokens are required for endpoints with RBAC.

Application workflow strictly enforces valid stage transitions; invalid moves return HTTP 400 errors.

Email notifications are queued asynchronously and require the worker to be running.


