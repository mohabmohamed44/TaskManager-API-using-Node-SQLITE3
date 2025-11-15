const nodemailer = require("nodemailer");

class EmailConfig {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }

  async sendTaskReminder(email, task) {
    const html = `
      <h2>Task Reminder</h2>
      <p>This is a reminder for your task:</p>
      <h3>${task.title}</h3>
      <p>${task.description || "No description"}</p>
      <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Reminder: ${task.title}`,
      html,
      text: `Reminder for task: ${task.title}`,
    });
  }
}

module.exports = new EmailConfig();
