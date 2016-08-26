/*
*  emailServer
*  author:  Tony Di Sera, Dec 2014
*  
*  This server emails a note along with a file attachment (streamed to this server).
*
*/
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var server = BinaryServer({port: 7068});
server.on('connection', function(client){
    client.on('stream', function(stream, meta){

        var sendEmail = function() {

            // Use oauth2 autentication
            var user         = 'email_address_goes_here';
            var clientId     = 'client_id_goes_here';
            var clientSecret = 'client_secret_goes_here';
            var accessToken  = 'access_token_goes_here';
            var refreshToken = 'refresh_token_goes_here';

            var nodemailer = require('nodemailer');
            var generator = require('xoauth2').createXOAuth2Generator({
                user: user,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken
            });


            // listen for token updates (if refreshToken is set)
            // you probably want to store these to a db
            generator.on('token', function(token){
                console.log('New token for %s: %s', token.user, token.accessToken);
                accessToken = token.accessToken;
            });

            // login
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    xoauth2: generator
                }
            });


            // Configure nodemailer to use the gmail smtp server
            /*
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'gene.iobio.feedback@gmail.com',
                    pass: 'jeans-paving-apron'
                }
            });
            */

            // Send the email.  Fill in the email address from, email address to,
            // subject, note.  Attach the file that was streamed.
            var emailObject = {
                from:    meta.from,
                to:      meta.to,
                subject: meta.subject,
                html:    meta.body
            };
            if (meta.filename) {
                emailObject.attachments = [
                    {   
                        filename: meta.filename,
                        path: attachment_file_name
                    }
                ];
            }


            transporter.sendMail( emailObject, function(error, response) {
                if (meta.filename) {
                    // Now delete the temporary file that is the attachment
                    fs.unlink(attachment_file_name, function (err) {
                        if (err) {
                            console.log("emailServer.js: unable to delete temp file " + attachment_file_name);
                            console.log(err.toString());
                        } 
                    });

                }
                if(error){
                    console.log(error);
                    return;
                }
            });
        };
        
        if (meta.filename) {
            // Save the input stream to a file.  (Can't get nodemailer to work with the
            // input stream for some reason.)
            var timestamp = new Date().getTime();
            var attachment_file_name = './emailServer_attachment' + timestamp + '.txt';
            var attachment_file = fs.createWriteStream(attachment_file_name);
            stream.pipe(attachment_file);
            stream.on('data', function(data){
            });
            stream.on('end', function() {
                sendEmail();
            });            
        } else {
            sendEmail();
        }



    });
});
