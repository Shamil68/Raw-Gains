const multer = require('multer');
// const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const handleUploads = (fieldName, maxCount) => {
    return upload.array(fieldName, maxCount);
};

const handleMultipleUploads = upload.array("images", 10);
const uploadProfilePicture = upload.single('profilePicture');


module.exports = {handleMultipleUploads,uploadProfilePicture};