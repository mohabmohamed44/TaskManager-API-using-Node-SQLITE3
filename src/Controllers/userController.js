const {userService} = require("../services/userService");


const uploadProfilePicture = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        // Debug logging
        console.log("Content-Type:", req.headers['content-type']);
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("Request files:", req.files);

        if (!file) {
            return res.status(400).json({
                error: "Bad Request",
                message: "No file uploaded. Please upload an image file with the field name 'profilePicture'",
                debug: {
                    contentType: req.headers['content-type'],
                    bodyKeys: req.body ? Object.keys(req.body) : [],
                    hasFile: !!req.file,
                    hasFiles: !!req.files
                }
            });
        }

        const result = await userService.uploadProfilePicture(userId, file);

        res.status(200).json({
            message: "Profile Picture Updated Successfully",
            data: result
        })
    } catch (error) {   
        next(error);
    }
}

module.exports = { uploadProfilePicture };