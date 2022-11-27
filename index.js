const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("crockeries server is running now ");
});
app.listen(port, () => {
  console.log("port is running", port);
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8gtonc3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unAuthorized");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  const crockeriesCollections = client
    .db("crockeriesGallery")
    .collection("crockeries");
  const categoriesCollections = client
    .db("crockeriesGallery")
    .collection("categories");
  const usersCollections = client.db("crockeriesGallery").collection("users");
  const ordersCollections = client.db("crockeriesGallery").collection("orders");

  // verify admin
  const verifyAdmin = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await usersCollections.findOne(query);

    if (user?.role !== "Admin") {
      return res.status(403).send({ message: "forbidden access" });
    }
    next();
  };
  // verify seller
  const verifySeller = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await usersCollections.findOne(query);

    if (user?.role !== "seller") {
      return res.status(403).send({ message: "forbidden access" });
    }
    next();
  };
  // verify buyer
  const verifyBuyer = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await usersCollections.findOne(query);

    if (user?.role !== "buyer") {
      return res.status(403).send({ message: "forbidden access" });
    }
    next();
  };

  //   here is post method starts
  app.post("/orders", async (req, res) => {
    const order = req.body;
    const query = {
      productId: order.productId,
      buyerEmail: order.buyerEmail,
      productImage: order.productImage,
    };
    const alreadyOrder = await ordersCollections.findOne(query);
    if (alreadyOrder) {
      return res.send({ message: "You already buy this product" });
    }
    const result = await ordersCollections.insertOne(order);
    res.send(result);
  });
  app.post("/crockeries", verifyJWT, verifySeller, async (req, res) => {
    const product = req.body;
    const result = await furnitureCollections.insertOne(product);
    res.send(result);
  });
  app.post("/users", async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const alreadyUser = await usersCollections.findOne(query);
    if (alreadyUser) {
      return res.send({ acknowledged: true });
    }
    const result = await usersCollections.insertOne(user);
    res.send(result);
  });
  //   here is post method ends

  //   here is get method starts
  app.get("/users/admin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    const user = await usersCollections.findOne(query);
    res.send({ isAdmin: user?.role === "Admin" });
  });
  app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      return res.status(403).send({ message: "forbidden access" });
    }
    const result = await usersCollections.find({}).toArray();
    res.send(result);
  });
  app.get("/users/sellers", verifyJWT, verifyAdmin, async (req, res) => {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      return res.status(403).send({ message: "forbidden access" });
    }
    const sellers = await usersCollections.find({}).toArray();
    const seller = sellers.filter((seller) => seller.role === "seller");
    res.send(seller);
  });
  app.get("/users/buyers", verifyJWT, verifyAdmin, async (req, res) => {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      return res.status(403).send({ message: "forbidden access" });
    }
    const sellers = await usersCollections.find({}).toArray();
    const seller = sellers.filter((seller) => seller.role === "buyer");
    res.send(seller);
  });

  app.get("/user/:email", verifyJWT, async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const result = await usersCollections.findOne(query);
    res.send(result);
  });
  app.get("/users/seller/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    const user = await usersCollections.findOne(query);
    res.send({ isSeller: user?.role === "seller" });
  });
  app.get("/users/buyer/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    const user = await usersCollections.findOne(query);
    res.send({ isBuyer: user?.role === "buyer" });
  });
  app.get("/jwt", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await usersCollections.findOne(query);
    if (user) {
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5d",
      });
      return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: "" });
  });

  app.get("/categories", async (req, res) => {
    const query = {};
    const result = await categoriesCollections.find(query).toArray();
    res.send(result);
  });
  app.get("/crockeries", async (req, res) => {
    const query = {};
    const result = await crockeriesCollections.find(query).toArray();
    res.send(result);
  });

  app.get("/categoriesProducts/:id", async (req, res) => {
    const { id } = req.params;
    const query = { categoryName: id };
    const result = await crockeriesCollections.find(query).toArray();
    res.send(result);
  });
  app.get("/crockeries/:id", async (req, res) => {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await crockeriesCollections.findOne(query);
    res.send(result);
  });
  //   here is get method ends

  //   here is put method starts

  //   here is put method ends

  //   here is delete method starts
  app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const email = req.query.email;
    const query = { _id: ObjectId(id) };
    const user = await usersCollections.findOne(query);
    if (
      user.email === email ||
      user.role === "Admin" ||
      user.email === "afia@gmail.com"
    ) {
      return res.send({
        message: "You Can't delete admin but Owner Can delete everything",
      });
    }
    const result = await usersCollections.deleteOne(query);
    res.send(result);
  });
  //   here is delete method ends
}
run().catch((err) => {
  console.log(err);
});
