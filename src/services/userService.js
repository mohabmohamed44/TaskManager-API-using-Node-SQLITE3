const supabase = require("../config/database");
const userRepository = require("../Repositories/userRepository");
const { v4: uuid } = require("uuid");


const userService = {
    async getAllUsers(excludeUserId) {
        return await userRepository.getAll(excludeUserId);
    },

    async uploadProfilePicture(userId, file) {
        const fileName = `${userId}-${uuid()}.png`;

        const {data, error} = await supabase.storage
            .from("Images")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw error;

        const {data: publicUrl} = supabase.storage
            .from("Images")
            .getPublicUrl(fileName);
        
        await userRepository.uploadProfilePicture(userId, publicUrl.publicUrl);

        return {imageUrl: publicUrl.publicUrl};
    }
};

module.exports = { userService };