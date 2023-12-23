var nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

exports.email = async (to, subject, text) => {
  const transporterDetails = smtpTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: true,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const transporter = nodeMailer.createTransport(transporterDetails);

  const options = {
    from: process.env.MAILER_USER,
    to: to.toString(),
    subject: subject.toString(),
    text: text.toString(),
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      return false;
    } else {
      return true;
    }
  });
};
