import { sendMail } from "../utils/mailer.js";

export const sendFeedback = async (req, res) => {
  const { betreff, feedback } = req.body;
  console.log("reference: ", betreff);
  console.log("feedback: ", feedback);

  //Check if subject and feedback are present
  if (!betreff || !feedback) {
    return res.status(400).json({ error: "Subject and message are required." });
  }

  //Send email
  try {
    await sendMail({
      from: '"Feedback App" <*********@*******.com>',
      to: "*********@*********.com",
      subject: betreff,
      text: feedback,
    });

    //Answer if successful
    res.status(200).json({ message: "Feedback sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Email could not be sent" });
  }
};
