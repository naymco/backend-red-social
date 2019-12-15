const { admin, db } = require("../utils/admin");

const config = require("../utils/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails
} = require("../utils/validate");

// Register users
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPass: req.body.confirmPass,
    handle: req.body.handle
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "blank-profile-picture-973460_1280.png";

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists)
        return res.status(404).json({ handle: "this handle is alredy taken" });
      else
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredencials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId
      };

      return db.doc(`/users/${newUser.handle}`).set(userCredencials);
    })
    .then(() => {
      return res.status(202).json({ token });
    })
    .catch(error => {
      console.error(error);
      if (error.code === "auth/email-already-in-use")
        return res.status(404).json({ email: "Email is alredy in use" });
      else return res.status(500).json({ error: error.code });
    });
};

// Login users
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(error => {
      console.error(error);
      if (error.code === "auth/wrong-password")
        return res
          .status(403)
          .json({ general: "Wrong credencials, please try again" });
      else return res.status(500).json({ error: error.code });
    });
};

// Add user details or profile
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.status(200).json({ message: "Details added successfully" });
    })
    .catch(error => {
      console.error(error);
      return res.status(404).json({ error: error.code });
    });
};

// Get own user details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};

  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.status(201).json(userData);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ error: error.code });
    });
};

// Upload a profile image for user
exports.uploadImage = (req, res) => {
  const Busboy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new Busboy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFilename;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== "image/jpeg" && mimetype !== "image/png")
      return res.status(404).join({ error: "Wrong file type submitted" });

    // my.image.png
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 3849387494879284.png
    imageFilename = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFilename);
    imageToBeUploaded = { filepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.status(201).json({ message: "Image uploaded successfully" });
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });

  busboy.end(req.rawBody);
};
