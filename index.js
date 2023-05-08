/** @format */

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, ClientSession } = require("mongodb");

app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.COFFEE_STORE_USER}:${process.env.COFFEE_STORE_PASS}@cluster0.nvffntx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const database = client.db("coffeeStore");
		const coffeeCollection = database.collection("coffee");

        // get all data 
		app.get("/coffees", async(req, res) => {
            const cursor =  coffeeCollection.find();
            const result = await cursor.toArray();
			res.send(result);
		});

        // get single data 
        app.get('/coffee/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

		// add coffee post
		app.post("/add-coffee", async (req, res) => {
			const newCoffee = req.body;
			const result = await coffeeCollection.insertOne(newCoffee);
			res.send(result);
		});


        // update coffee 
        app.put('/update-coffee/:id', async(req, res) => {
			const id = req.params.id;
			const updatedCoffee = req.body;
            
			// create a filter for a movie to update
			const filter = { _id: new ObjectId(id) };

			// this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };
            const coffee = {
				$set: {
					name :updatedCoffee.name,
					chef :updatedCoffee.chef,
					supplier :updatedCoffee.supplier,
					taste :updatedCoffee.taste,
					category :updatedCoffee.category,
					details :updatedCoffee.details,
					price :updatedCoffee.price,
					photo :updatedCoffee.photo,
				},
			};
            const result = await coffeeCollection.updateOne(
				filter,
				coffee,
				options
			);
			res.send(result)
		})


        // coffee delete 
        app.delete('/delete-coffee/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })



		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Coffee Store server is running...");
});

app.listen(port, () => {
	console.log(`this server is running on ${port}`);
});
