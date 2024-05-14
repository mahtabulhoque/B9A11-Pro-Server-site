const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.unskf0z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const jobsCollection = client.db('mahach0396').collection('jobs');


    // Get all jobs
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find({}).toArray();
      res.send(result);
    });



    // Get single job by ID
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
      }
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });



    // Get jobs by user email
    app.get('/jobs/:email', async (req, res) => {
      try {
        const email = req.params.email;
        if (!email) {
          return res.status(400).json({ error: 'User email is required' });
        }
        const query = { userEmail: email };
        const myJobsByEmail = await jobsCollection.find(query).toArray();
        res.json(myJobsByEmail);
      } catch (error) {
        console.log('Error fetching data', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    // Delete a job
    app.delete('/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send('Invalid ID format');
        }
        const query = { _id: new ObjectId(id) };
        const result = await jobsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log('Error deleting job', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    // Add job
    app.post('/addJobs', async (req, res) => {
      const addData = req.body;
      const result = await jobsCollection.insertOne(addData);
      res.send(result);
    });



    // Increment applicants number
    app.post('/applyJob/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
      }
      const query = { _id: new ObjectId(id) };
      const update = { $inc: { applicantsNumber: 1 } };
      const result = await jobsCollection.updateOne(query, update);
      res.send(result);
    });


    

    console.log("Connected to MongoDB!");
  } finally {
    // Ensure client will close when you finish/error
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('B9A11 assignment is running');
});

app.listen(port, () => {
  console.log(`B9A11 Server is running on port:${port}`);
});
