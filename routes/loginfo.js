const LogInfo = require("../models/LogInfo");
// Example logging function
const logActivity = async (action, description,status, userId) => {
    try {
        const logEntry = new LogInfo({
            action,
            description,
            status,
            userId: userId // Optional: pass user ID if applicable
        });
        await logEntry.save();
    } catch (error) {
        console.error("Error logging activity:", error);
    }
}

module.exports = logActivity;