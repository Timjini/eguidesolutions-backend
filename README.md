# E-GuideSolutions Backend

## Overview
The **E-GuideSolutions** backend powers the live stream guided tours platform, providing services for both the **mobile app** and the **admin dashboard**. This backend is built using **Node.js** and integrates with several technologies to support authentication, live streaming, file storage, and more.

## Features
- **User Authentication:** Uses **JWT** for secure authentication.
- **Database:** MongoDB for scalable and efficient data storage.
- **Live Streaming:** Generates **Agora channel tokens** for real-time guided tours.
- **File Upload:** Supports **Amazon S3** for media file storage.
- **Testing:** Uses **Jest** for unit and integration testing.
- **Email Notifications:** Integrated with **SendGrid** for sending emails.

## Tech Stack
- **Node.js** - Backend runtime
- **Express.js** - Web framework for handling API requests
- **MongoDB (Mongoose ORM)** - NoSQL database
- **JSON Web Token (JWT)** - Secure user authentication
- **Agora SDK** - Live streaming token generation
- **AWS S3** - File storage
- **Jest** - Testing framework
- **SendGrid** - Email delivery service
- **Docker** - Containerized deployment
- **Docker Compose** - Multi-container orchestration