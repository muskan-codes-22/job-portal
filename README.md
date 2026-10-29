# Job Portal

Full-stack starter for a multi-role job application portal: **Admin**, **Recruiter**, and **Applicant**.

## Start

1. Copy both `.env.example` files to `.env` and supply your values.
2. Run `npm install` in both `frontend` and `backend`.
3. Run `npm run dev` in each folder.

## Sample IT job listings

The backend uses the MongoDB connection string in `backend/.env` (`MONGODB_URI`).
MongoDB creates the database and collections when the application first writes data.
After configuring the backend `.env`, run `npm run seed` from the `backend` folder
to create the demo recruiter and add sample IT listings. The seed command is safe to
run again and updates its own listings instead of duplicating them. The sample jobs
are for development and are not real openings.
