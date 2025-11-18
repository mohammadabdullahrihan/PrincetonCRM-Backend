const { passwordVerfication } = require('../../../emailTemplate/emailVerfication');
const { Resend } = require('resend');

// Ensure Setting model is loaded
require('../../../models/coreModels/Setting');

const sendMail = async ({
  email,
  name,
  link,
  idurar_app_email,
  subject = 'Verify your email | idurar',
}) => {
  const resend = new Resend(process.env.RESEND_API);

  const { data } = await resend.emails.send({
    from: idurar_app_email,
    to: email,
    subject,
    html: passwordVerfication({ name, link }),
  });

  return data;
};

module.exports = sendMail;
