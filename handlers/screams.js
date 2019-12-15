const { db } = require("../utils/admin");

exports.getAllScreams = (req, res) => {
  db.firestore()
    .collection("scream")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screamArray = [];
      data.forEach(doc => {
        screamArray.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt

          //...doc.data()
        });
      });
      return res.status(200).json(screamArray);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json(error);
    });
};

exports.postOneScream = (req, res) => {
    if (req.body.body.trim() === "")
        return res.status(400).json({ body: "Body must not be empty" });

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };

    db.collection("scream")
        .add(newScream)
        .then(doc => {
            res.status(200).json({ message: `document ${doc.id} created success` });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
}