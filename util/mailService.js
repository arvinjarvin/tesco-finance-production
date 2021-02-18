const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });

/**
 * Send a templated email
 * @param {Object} options Templated Email options
 * @param {String} options.toAddress The address to send the email to
 * @param {String} options.mailer The name of the service from which to send the email e.g 'noreply'
 * @param {String} options.template The AWS template name of the email to send
 * @param {Object} options.templateData The data to parse the template with
 */
exports.sendTemplatedEmail = async (options) => {
  const params = {
    Destination: {
      ToAddresses: [options.toAddress],
    },
    Source: `${options.mailer}@${process.env.SES_EMAIL_FROM}`,
    Template: options.template,
    TemplateData: JSON.stringify(options.templateData),
    ReplyToAddresses: [`support@${process.env.SES_EMAIL_FROM}`],
  };

  let mailPromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendTemplatedEmail(params)
    .promise();

  mailPromise
    .then(function (data) {
      return data;
    })
    .catch(function (err) {
      console.error(err);
    });
};
