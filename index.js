import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer'
import fetch from 'node-fetch';
const app = express()
const port = 3030

dotenv.config();

import firestore from './src/firebase.js'


app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
// const route = express.Router();


let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
  }
});

app.get('/test', (req, res) => {
  return res.send('Server is working..')
})

app.get('/deeplink', (req, res) => {

  /*const api_key = 'AIzaSyAFJLSFjkMgLHjSiltBoBGuXG0Z8-dvuYI';
  const url = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=' + api_key;

  const xhttp = new XMLHttpRequest();

    xhttp.open("GET", url, false);
    xhttp.send();

    const response = JSON.parse(xhttp.responseText);

    console.log(response);*/

    fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(data => console.log(data));

  return res.send('Testing.......')
})





app.get(`/checkdeep`, async function (req, res) {
//	const url =
	//	'https://jsonplaceholder.typicode.com/todos/1';
    const api_key = 'AIzaSyAFJLSFjkMgLHjSiltBoBGuXG0Z8-dvuYI';
    const url = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=' + api_key;
  

   
    const options = {
		method: 'POST',
		 headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
//       "Content-Type": "application/x-www-form-urlencoded",

		// 	'X-RapidAPI-Key': 'your-rapidapi-key'
//    'Accept': 'application/json, text/plain, */*',
    
    body: JSON.stringify({
      "dynamicLinkInfo": {
        "domainUriPrefix": "https://prtnr.page.link",
        "link": "https://prtnr.page.link/V9Hh?email=sany@gmail.com",
      }
    })
   
		 }
	};
	// promise syntax
/*	fetch(url, options)
		.then(res => res.json())
		.then(json => console.log(json))
		.catch(err => console.error('error:' + err));*/
	try {
		let response = await fetch(url, options);
		response = await response.text();
		res.status(200).json({"data":response});
    return res;
	} catch (err) {
		console.log(err);
		res.status(500).json({msg: `Internal Server Error`});
	}
 // return res.send('Testing.......')

});


app.post('/send-mail', (req, res) => {
  const {to} = req.body;
  const verificationCode = Math.floor(Math.random() * 90000) + 10000;
  const mailOptions = {
    from: "gigahertzdev@gmail.com",
    to,
    subject: "Hi, Thanks for using Prtnr",
    text: `Please confirm your verification code ${verificationCode} and type this on your app.`
  };
  const userData = {
    email: to,
    verifCode: verificationCode.toString(),
  };
  console.log(userData);
  firestore.addVerificationData(userData, (result) => {
    if(result == 'success') {
      console.log("Registered on the database");
    } else {
      console.log("error")
    }
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
      }
      res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
});



app.post('/confirm-verification', (req, res) => {
  const {email, verifCode} = req.body;
  firestore.getRegisteredCode(email, (user) => {
    if (user['data'] == 'true') {
      if (verifCode == user['verification_code']) {
        console.log("Your email address verified");
        res.status(200).send({ message: "Your email address verified", title: "true"});
      } else {
        console.log("Verification Code is not valid.");
        res.status(200).send({ message: "Verification Code is not valid.", title: "failed"})
      }
    }
    else {
      console.log("Your email is not verified, Please retry.");
      res.status(200).send({ message: "Your email is not verified, Please retry.", title: "not exist"})
    }
  })
  firestore.formatCollection(email, (result) => {
    if (result == "success") {
      console.log("Deleted");
    } else {
      console.log(result);
    }
  })
});


app.post('/sendInvitation', (req, res) => {
  const {fromEmail, toEmail}  = req.body;

  firestore.addInvitation(fromEmail, toEmail, (result) => {
    if(result == 'success') {
      console.log("Saved invitation successfully.");
      return res.send({success: true});
    } else {
      console.log(result);
      return res.status(500).json({ error: result });
    }
  });
})

// app.use('/', route);

app.listen(port, () => {
  console.log(`Express backend is listening at http://localost:${port}....`)
})