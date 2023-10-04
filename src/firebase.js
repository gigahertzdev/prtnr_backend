import { db } from "./firebase-config.js";
import {
  doc,
  collection,
  addDoc,
  where,
  query,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const addVerificationData = async (userData, callback) => {
  console.log(userData);
  try {
    const docRef = await addDoc(collection(db, "Verification"), {
      email: userData.email,
      verification_code: userData.verifCode,
    });
    userData.userRefId = docRef.id;
    callback("success");
  } catch (error) {
    callback("error");
  }
};

const getRegisteredCode = async (emailId, callback) => {
  let user = { data: "false" };
  try {
    const userRef = collection(db, "Verification");
    const q = query(userRef, where("email", "==", emailId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((document) => {
      user = document.data();
      user["data"] = "true";
    });
    callback(user);
  } catch (error) {
    callback(null);
  }
};

const formatCollection = async (emailId, callback) => {
  try {
    const userRef = collection(db, "Verification");
    const q = query(userRef, where("email", "==", emailId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      console.log(document.id);
      await deleteDoc(doc(db, "Verification", document.id));
    });
    callback("success");
  } catch (error) {
    callback(error);
  }
};

const addInvitation = async (fromEmail, toEmail, callback) => {
  try {
    const docRef = await addDoc(collection(db, "Invitations"), {
      fromEmail: fromEmail,
      toEmail: toEmail,
    });
    callback("success");
  } catch (error) {
    callback(error);
  }
};

export default {
  addVerificationData,
  getRegisteredCode,
  formatCollection,
  addInvitation,
};
