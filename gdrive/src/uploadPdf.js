var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var Spinner = require('cli-spinner').Spinner;
var shortUrl = '';
var tcolorBlue = '\x1b[36m';
var tcolorReset = '\x1b[0m';
var shortenUrl = require('./shortenUrl');

function uploadPDF(auth, file) {
  var config = require('../config/google-config.json');
  var service = google.drive({ version: 'v3', auth: auth });
  var spinner = new Spinner('Uploading PDF.. %s');
  // spinner.setSpinnerString('|/-\\');
  // spinner.start();

  service.files.create({
    resource: {
      name: file.name,
      mimeType: 'application/pdf',
      parents: [config.UploadFolder]
    },
    media: {
      mimeType: 'application/pdf',
      body: fs.createReadStream(file.path)
    }
  }, function (err, response) {
      if (err) {
        console.log('Error from API: \n', err);
        return;
      } else {
        console.log(tcolorBlue, '\n[API Response]\n', tcolorReset, response);
        var longUrl = 'https://drive.google.com/open?id=' + response.id;
        console.log(tcolorBlue, '\n[Long URL]\n', tcolorReset, longUrl);
        shortenUrl(longUrl)
        spinner.stop();
      }
  });

}

module.exports = uploadPDF;
