import multer from 'multer';

const storage = multer.memoryStorage();

const resumeFilter = (req, file, callback) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  callback(null, allowed.includes(file.mimetype));
};

const imageFilter = (req, file, callback) => {
  callback(null, file.mimetype.startsWith('image/'));
};

export const uploadResume = multer({
  storage,
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('resume');

export const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB as specified in UI
}).single('avatar');
