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

    var attachment_file_name = "temp_email_attachment_" + new Date().toString() + '.txt';

    var file = fs.createWriteStream(attachment_file_name);
    stream.pipe(file);

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'some.account@gmail.com',
            pass: 'password_goes_here'
        }
    });
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
            if(error){
                console.log(error);
                return;
            }

           
        }
        );
  	}); 
});