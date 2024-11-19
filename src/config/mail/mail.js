import nodemailer from "nodemailer";

export default async function sendEmail(
 mailOptions = {}
) {
  
  try {
    
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,    
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    
    await transporter.sendMail(mailOptions);  

  } catch (error) {
    throw new Error(error);
  }

}