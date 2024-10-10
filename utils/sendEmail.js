
import nodeMailer from 'nodemailer';



export const sendEmail = async ({ email, subject, message }) => {
  
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    cc:'ankit.jain@revoltmotors.com',
    subject: subject,
    html: message
  };

  const result = await transporter.sendMail(options);
  return result;
}