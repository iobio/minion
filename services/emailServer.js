/*
*  emailServer
*  author:  Tony Di Sera, Dec 2014
*  
*  This server emails a note along with a file attachement (streamed to this server).
*
*/
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var server = BinaryServer({port: 7068});
server.on('connection', function(client){
    client.on('stream', function(stream, meta){

        var timestamp = new Date().getTime();

        // Save the input stream to a file.  (Can't get nodemailer to work with the
        // input stream for some reason.)
        var attachment_file_name = './emailServer_attachment' + timestamp + '.txt';
        var attachment_file = fs.createWriteStream(attachment_file_name);
        stream.pipe(attachment_file);

        stream.on('data', function(data){
        });

        stream.on('end', function() {
            // Configure nodemailer to use the gmail smtp server
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'someaccount@gmail.com',
                    pass: 'enter_password_here'
                }
            });

            // Send the email.  Fill in the email address from, email address to,
            // subject, note.  Attach the file that was streamed.
            transporter.sendMail(
                {
                    from:    meta.from,
                    to:      meta.to,
                    subject: meta.subject,
                    html:    meta.note,
                    attachments: [
                        {   
                            filename: meta.filename,
                            path: attachment_file_name
                        }
                    ]
                }, function(error, response){
                    // Now delete the termpory file
                    fs.unlink(attachment_file_name, function (err) {
                        if (err) {
                            console.log("unable to delete temp file " + attachment_file_name);
                            console.log(err.toString());
                        } 
                    });

                    if(error){
                        console.log(error);
                        return;
                    }
                } 
            );

        });




    });


});
