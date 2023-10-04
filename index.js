import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import twilio from "twilio";
import axios from "axios";

const app = express();
const port = 3030;

dotenv.config();

import firestore from "./src/firebase.js";

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
const route = express.Router();
app.use("/", route);

app.listen(port, () => {
  //console.log(`Express backend is listening at http://localost:${port}....`)
});

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

route.post("/send-mail", (req, res) => {
  const { to } = req.body;

  console.log("send email", to);
  const verificationCode = Math.floor(Math.random() * 90000) + 10000;
  const userData = {
    phone: to,
    verifCode: verificationCode.toString(),
  };

  firestore.addVerificationData(userData, (result) => {
    if (result == "success") {
      console.log("Registered on the database");
    } else {
      console.log("error");
    }
  });

  client.messages
    .create({
      body: `Please confirm your verification code ${verificationCode} and type this on your app.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    })
    .then((message) => {
      console.log(message.sid);
      res.status(200).send({ message: "Mail send", message_id: message.sid });
    });
});

app.post("/sendInvitation", (req, res) => {
  const { from, to } = req.body;

  firestore.addInvitation(from, to, async (result) => {
    if (result == "success") {
      /* After Successfull data Addition send deep link also */
      const url =
        "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" +
        process.env.WEB_API_KEY;

      const param = {
        dynamicLinkInfo: {
          domainUriPrefix: "https://prtnr.page.link",
          link: "https://prtnr.page.link/V9Hh?email=" + to,
        },
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(param),
      };
      try {
        let response = await axios.post(url, param);

        client.messages.create({
          body: `Hey! Your partner sends you an invitation link: ${response.data.shortLink}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to,
        });

        res.status(200).json({
          toSms: to,
          deep_link: response.data.shortLink,
          success: true,
        });
        return res;
      } catch (err) {
        console.log(err);
        res.status(500).json({ msg: `Internal Server Error`, success: false });
      }
    } else {
      console.log(result);
      return res.status(500).json({ error: result });
    }
  });
});

route.post("/confirm-verification", (req, res) => {
  const { phone, verifCode } = req.body;
  console.log(phone, verifCode);
  firestore.getRegisteredCode(phone, (user) => {
    console.log(user);
    if (user["data"] == "true") {
      if (verifCode == user["verification_code"]) {
        console.log("Your phone number is verified");
        res
          .status(200)
          .send({ message: "Your phone number is verified", title: "true" });
      } else {
        console.log("Verification Code is not valid.");
        res.status(200).send({
          message: "Verification Code is not valid.",
          title: "failed",
        });
      }
    } else {
      console.log("Your phone number is not verified, Please retry.");
      res.status(200).send({
        message: "Your phone number is not verified, Please retry.",
        title: "not exist",
      });
    }
  });
  firestore.formatCollection(phone, (result) => {
    if (result == "success") {
      console.log("Deleted");
    } else {
      console.log(result);
    }
  });
});
