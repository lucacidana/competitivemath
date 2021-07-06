const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'alk9mm@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}, let me know how you get along with the app`,
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'alk9mm@gmail.com',
    subject: 'Email cancelation',
    text: `${name}, we're sorry to see you go, please tell us why did you leave`,
  })
}

const sendPasswordChangeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'alk9mm@gmail.com',
    text: `Hello ${name}, please confirm your requested password change`,
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
}
