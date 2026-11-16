# FindIt – Campus Lost and Found Management Portal

A web-based Campus Lost and Found Management Portal designed to help students and faculty report, search, and recover lost belongings within the campus environment.

## Project Overview

FindIt is a centralized digital platform that simplifies the process of reporting and recovering lost items in a college or university. Instead of relying on physical notice boards, WhatsApp groups, or manual announcements, users can report lost and found items through a single platform.

The system allows users to submit item details, upload images, browse reported items, and connect with the respective owners to facilitate item recovery.

## Objectives

- Provide a centralized platform for campus lost and found management.
- Allow students to report lost and found belongings.
- Enable users to search and browse reported items.
- Reduce the time required to recover lost belongings.
- Maintain organized records of lost and found items.
- Provide a secure and user-friendly interface.

## Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Web
- Spring Security (if configured)
- JWT Authentication (if configured)

### Database
- MySQL

### Development Tools
- Visual Studio Code
- MySQL Workbench
- Postman
- Maven
- Git and GitHub

## Key Features

- **User Authentication:** User registration and login.
- **Lost Item Reporting:** Users can report items they have lost.
- **Found Item Reporting:** Users can submit details of items they have found.
- **Item Browsing:** View available lost and found listings.
- **Search Functionality:** Search for items using relevant information.
- **Item Management:** Manage submitted item records.
- **Database Integration:** Store and retrieve application data using MySQL.
- **REST API Integration:** Connect the React frontend with the Spring Boot backend.

## System Architecture

FindIt follows a client-server architecture.

1. **Frontend:** React provides the user interface and handles user interactions.
2. **Backend:** Spring Boot processes requests and implements business logic.
3. **Database:** MySQL stores user accounts and item information.
4. **API Communication:** REST APIs enable communication between the frontend and backend.

## Project Structure

```text
FindIt/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── ...
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- Java JDK
- Apache Maven
- MySQL Server
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/aryan08123/FindIt.git
```

Navigate to the project directory:

```bash
cd FindIt
```

### 2. Configure the Database

Open MySQL Workbench and create the database:

```sql
CREATE DATABASE findit_db;
```

Configure your database credentials in the backend's `application.properties` file.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/findit_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. Run the Backend

Navigate to the backend directory:

```bash
cd backend
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will typically run at:

```text
http://localhost:8080
```

### 4. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will typically run at:

```text
http://localhost:3000
```

If your project uses a different start script, refer to the `package.json` file.

## Application Workflow

1. A user registers or logs into the FindIt platform.
2. The user reports a lost item or submits a found item.
3. The application sends the information to the Spring Boot backend.
4. The backend processes the request and interacts with the MySQL database.
5. Users browse or search the available item listings.
6. Relevant item information helps users identify and recover their belongings.

## Future Enhancements

- Real-time notifications for matching lost and found items.
- Advanced search with category-based filtering.
- Image-based item recognition.
- Location-based item tracking within campus.
- Admin dashboard for monitoring reports.
- Email notifications for successful item matches.
- Improved claim verification and recovery management.
