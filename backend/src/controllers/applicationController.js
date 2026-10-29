import Application from '../models/Application.js';
import Job from '../models/Job.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

export async function createApplication(req, res, next) {
  try {
    const job = await Job.findOne({ _id: req.body.jobId, status: 'open' });
    if (!job) return res.status(404).json({ message: 'Open job not found' });

    let resume;
    if (req.file) {
      const file = await uploadToCloudinary(
        req.file.buffer,
        'job-portal/resumes',
        'raw',
        req.file.mimetype
      );
      resume = { url: file.secure_url, publicId: file.public_id };
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || '',
      resume,
    });
    res.status(201).json({ application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }
    next(error);
  }
}

export async function listApplications(req, res, next) {
  try {
    if (req.user.role === 'applicant') {
      const applications = await Application.find({ applicant: req.user._id })
        .populate('job')
        .sort({ createdAt: -1 });
      return res.json({ applications: applications.filter((item) => item.job) });
    }

    // Recruiter or Admin
    const jobQuery = req.user.role === 'admin' ? {} : { recruiter: req.user._id };
    if (req.query.jobId) {
      jobQuery._id = req.query.jobId;
    }

    const recruiterJobs = await Job.find(jobQuery).select('_id');
    const jobIds = recruiterJobs.map((j) => j._id);

    const filter = { job: { $in: jobIds } };
    if (req.query.jobId) {
      filter.job = req.query.jobId;
    }

    const applications = await Application.find(filter)
      .populate('job', 'title companyName location')
      .populate('applicant', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (req.user.role !== 'admin' && !application.job.recruiter.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not permitted' });
    }
    application.status = req.body.status;
    await application.save();
    res.json({ application });
  } catch (error) {
    next(error);
  }
}
