const cron = require("node-cron");
const tokenBlacklistRepository = require("../Repositories/tokenBlackListRepository");

class CronJobs {
    start() {
        cron.schedule("0 0 * * *", async () => {
            try {
                console.log("🧹 Running token cleanup job...");
                const count = await tokenBlacklistRepository.removeExpiredTokens();
                console.log(`✅ Cleaned up ${count} expired tokens`);
            } catch(error) {
                console.error("❌ Token cleanup job failed:", error);
            }
        });
        console.log("Cron job started..");
    }
}

module.exports = new CronJobs();