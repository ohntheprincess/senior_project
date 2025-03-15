import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { to, subject, text } = await request.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const recipients = to.split(",");
    const sendPromises = [];

    for (let i = 0; i < recipients.length; i += 2) {
      const toList = recipients.slice(i, i + 2).join(",");
      const mailOptions = {
        from: `"EV Car Support" <${process.env.EMAIL_USER}>`,
        to: toList,
        subject: subject,
        text: text,
      };

      sendPromises.push(
        transporter.sendMail(mailOptions).catch(error => {
          console.error(`Error sending to ${toList}:`, error);
          return { status: 'rejected', reason: error };
        })
      );
    }

    const results = await Promise.allSettled(sendPromises);
    const failedEmails = results.filter(result => result.status === 'rejected');

    if (failedEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "ส่งอีเมลสำเร็จทั้งหมด!" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          message: `ส่งอีเมลสำเร็จ ${results.length - failedEmails.length}/${results.length}`,
          errors: failedEmails.map(e => e.reason.response)
        }),
        { status: 207 } // Multi-Status
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" }),
      { status: 500 }
    );
  }
}