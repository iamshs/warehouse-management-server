const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middlewar

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j8ljx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("motorHouse").collection("inventory");
    const myCollection = client.db("motorHouse").collection("myitem");

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
    });
    app.get("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const inventory = await inventoryCollection.findOne(query);
      res.send(inventory);
    });

    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden access" });
        }
        console.log("decoded", decoded);
        req.decoded = decoded;
        next();
      });
    }

    //post
    app.post("/inventory", async (req, res) => {
      const newInventory = req.body;
      const result = await inventoryCollection.insertOne(newInventory);
      res.send(result);
    });
    //delete
    app.delete("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
      // AUTH
      app.post("/login", async (req, res) => {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.SECRET_TOKEN, {
          expiresIn: "10d",
        });
        res.send({ accessToken });
      });
    });
    //my item get
    app.get("/myitem", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = myCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    //my item post

    app.post("/myitem", async (req, res) => {
      const newInventory = req.body;
      const result = await myCollection.insertOne(newInventory);
      res.send(result);
    });

    //myitem delete

    app.delete("/myitem/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const result = await myCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running the server");
});

app.listen(port, () => {
  console.log("listening to warhouse server");
});
