const nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
const path = require('path');
const {host, port, user, pass } = require('../config/mail.json')

const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
  });


  const handlebarOptions = {
    viewEngine: {
      extName: '.html',
      partialsDir: path.resolve('./src/resources/mail/'),
      layoutsDir: path.resolve('./src/resources/mail/'),
      defaultLayout: '',
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
  }
  transport.use('compile', hbs(handlebarOptions))


  module.exports = transport