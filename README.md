# ACTIVITY 7 - NestJS Project Management System Backend

This is the **NestJS backend** for the Project Management System.  
It allows users to register and log in, manage projects and tasks, upload task completion proofs, handle events, tickets, check-ins, announcements, and export data.  
Admins can manage organizers, view all users, and control access. Organizers can create projects, assign tasks, and post announcements. Attendees can view and register for events, see tickets, and check-in for events.

---

## **Technologies Used**

- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT Authentication (passport-jwt)
- Multer (for file uploads)
- Swagger (OpenAPI) for API documentation
- Class-validator & Class-transformer (for validation)
- Axios (for HTTP requests from frontend)
- TailwindCSS (optional, for frontend styling)

---

## **Setup & Installation**

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd ACTIVITY7

Install dependencies
    npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs @nestjs/platform-express multer @nestjs/serve-static @nestjs/typeorm typeorm mysql2 class-validator class-transformer axios @nestjs/swagger swagger-ui-express

Install TypeScript types
    npm i --save-dev @types/passport-jwt @types/multer

Install Tailwind CSS for frontend styling
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p

to run frontend:
    npm run dev

to run backend:
    npm run start


