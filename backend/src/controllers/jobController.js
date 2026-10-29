import Job from '../models/Job.js';

export async function listJobs(req, res, next) {
  try {
    const { keyword, location, employmentType } = req.query;
    const query = { status: 'open' };

    if (keyword) {
      query.$or = ['title', 'companyName', 'description', 'skills'].map((field) => ({
        [field]: { $regex: keyword, $options: 'i' },
      }));
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (employmentType && employmentType !== 'Any type') query.employmentType = employmentType;

    const jobs = await Job.find(query).sort({ createdAt: -1 }).populate('recruiter', 'name email');
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
}

export async function getJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job });
  } catch (error) {
    next(error);
  }
}

export async function getMyJobs(req, res, next) {
  try {
    const query = req.user.role === 'admin' ? {} : { recruiter: req.user._id };
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
}

function normalizeJobPayload(body) {
  const payload = { ...body };
  if (typeof payload.skills === 'string') {
    payload.skills = payload.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (payload.minSalary !== undefined || payload.maxSalary !== undefined) {
    payload.salary = {
      min: payload.minSalary ? Number(payload.minSalary) : payload.salary?.min || 0,
      max: payload.maxSalary ? Number(payload.maxSalary) : payload.salary?.max || 0,
      currency: 'INR',
    };
  }
  return payload;
}

export async function createJob(req, res, next) {
  try {
    const payload = normalizeJobPayload(req.body);
    const job = await Job.create({
      ...payload,
      recruiter: req.user._id,
    });
    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.user.role !== 'admin' && !job.recruiter.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not your job post' });
    }

    const payload = normalizeJobPayload(req.body);
    Object.assign(job, payload);
    await job.save();
    res.json({ job });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.user.role !== 'admin' && !job.recruiter.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not your job post' });
    }
    await job.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
