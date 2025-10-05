// Feedback function
import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "owa.*******.com",
  port: ****,
  secure: false,
});

// Export directly with sendMail function
export const sendMail = async (mailOptions) => {
  return transporter.sendMail(mailOptions);
};
