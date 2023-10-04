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
  try {
    const docRef = await addDoc(collection(db, "Verification"), {
      phone: userData.phone,
      verification_code: userData.verifCode,
    });
    userData.userRefId = docRef.id;
    callback("success");
  } catch (error) {
    callback("error");
  }
};

const getRegisteredCode = async (phone, callback) => {
  let user = { data: "false" };
  try {
    const userRef = collection(db, "Verification");
    const q = query(userRef, where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      user = document.data();
      user["data"] = "true";
    });
    callback(user);
  } catch (error) {
    callback(null);
  }
};

const formatCollection = async (phone, callback) => {
  try {
    const userRef = collection(db, "Verification");
    const q = query(userRef, where("phone", "==", phone));
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
      fromNumber: fromEmail,
      toNumber: toEmail,
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
