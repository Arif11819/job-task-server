const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzi1i.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db('job_task').collection('tasks');

        app.get('/tasks', async (req, res) => {
            const query = {};
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        });

        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const hex = /[0-9A-Fa-f]{6}/g;
            const query = { _id: (hex.test(id)) ? ObjectId(id) : id };
            const tasks = await taskCollection.findOne(query);
            res.send(tasks);
        });

        app.post('/tasks', async (req, res) => {
            const tasks = req.body;
            const result = await taskCollection.insertOne(tasks);
            res.send(result);

        });

        // Edit task
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const hex = /[0-9A-Fa-f]{6}/g;
            const filter = { _id: (hex.test(id)) ? ObjectId(id) : id };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    daily_task: data.daily_task,
                }
            };
            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From Job!');
})

app.listen(port, () => {
    console.log(`Job Task listening on port ${port}`)
});