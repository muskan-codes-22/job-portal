import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDatabase from './config/database.js';
import Job from './models/Job.js';
import User from './models/User.js';

const recruiterEmail = 'recruiter@careernest.local';
const applicantEmail = 'rohitjaintrainer@gmail.com';

const sampleJobs = [
  {
    seedKey: 'apple-frontend-developer',
    title: 'Frontend Developer',
    companyName: 'Apple',
    companyLogoUrl: '',
    location: 'Hyderabad',
    employmentType: 'Full-time',
    skills: ['React', 'CSS', 'Tailwind CSS', 'Responsive Design'],
    salary: { min: 28000, max: 56000, currency: 'INR' },
    description: 'AI ko prompt dena hai and output paste karna hai VS Code me',
    aboutCompany: 'Company information will be shared by the recruiter soon.',
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
  },
  {
    seedKey: 'it-software-engineer-bengaluru',
    title: 'Software Engineer',
    companyName: 'Northstar Labs',
    companyLogoUrl: '',
    description: 'Build and maintain web services and APIs with a collaborative product engineering team.',
    aboutCompany: 'Northstar Labs crafts modern developer platforms and cloud infrastructure tooling.',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'REST API'],
    salary: { min: 800000, max: 1400000, currency: 'INR' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    seedKey: 'it-backend-developer-hyderabad',
    title: 'Backend Developer',
    companyName: 'Blue Oak Systems',
    companyLogoUrl: '',
    description: 'Design reliable backend services, data models, and integrations for growing products.',
    aboutCompany: 'Blue Oak Systems builds high-performance financial data engines.',
    location: 'Hyderabad, Telangana',
    employmentType: 'Full-time',
    skills: ['Node.js', 'Express', 'MongoDB', 'API design', 'Docker'],
    salary: { min: 900000, max: 1600000, currency: 'INR' },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    seedKey: 'it-react-intern-jaipur',
    title: 'React Developer Intern',
    companyName: 'Paperplane Technologies',
    companyLogoUrl: '',
    description: 'Build and improve user-facing application features while learning from experienced developers.',
    aboutCompany: 'Paperplane Technologies empowers young developers through impactful internships.',
    location: 'Jaipur, Rajasthan',
    employmentType: 'Internship',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    salary: { min: 15000, max: 25000, currency: 'INR' },
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
];

try {
  await connectDatabase();
  await Job.init();

  const defaultPassword = await bcrypt.hash('password123', 12);

  let recruiter = await User.findOne({ email: recruiterEmail });
  if (!recruiter) {
    recruiter = await User.create({
      name: 'CareerNest Recruiter',
      email: recruiterEmail,
      password: defaultPassword,
      role: 'recruiter',
    });
  }

  let applicant = await User.findOne({ email: applicantEmail });
  if (!applicant) {
    applicant = await User.create({
      name: 'Rohit Jain',
      email: applicantEmail,
      password: defaultPassword,
      role: 'applicant',
    });
  } else {
    applicant.name = 'Rohit Jain';
    await applicant.save();
  }

  for (const item of sampleJobs) {
    const { seedKey, ...job } = item;
    await Job.findOneAndUpdate(
      { seedKey },
      {
        ...job,
        recruiter: recruiter._id,
        status: 'open',
        seedKey,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded users & jobs successfully.`);
} catch (error) {
  console.error('Job seed failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
