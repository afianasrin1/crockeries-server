const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const port = process.env.PORT || 5000;
//new
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8gtonc3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send("unauthorized access");
//   }

//   const token = authHeader.split(" ")[1];
//   console.log(token);
//   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: "forbidden access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

async function run() {
  try {
    // const crockeriesCollection = client
    //   .db("crockeriesGallery")
    //   .collection("crockeries");
    // app.get("/jwt", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   if (user) {
    //     const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
    //       expiresIn: "24h",
    //     });
    //     return res.send({ crockeriesToken: token });
    //   }
    //   res.status(403).send({ crockeriesToken: "" });
    // });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("crockeriesGallery server is running");
});

app.listen(port, () => console.log(`crockeriesGallery running on ${port}`));
