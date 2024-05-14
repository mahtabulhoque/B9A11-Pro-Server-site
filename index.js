const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true, // Allow credentials (cookies, authorization headers, TLS client certificates)
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// veryfy jwt 

const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    // console.log(token);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};



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

    // jwt generate
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d'
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({ success: true });
    });


    // clear token on logout


    app.get('/logout', (req , res) =>{

      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge:0,
      })
      .send({ success: true });
    });




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
app.get('/jobs/:email', verifyJWT, async (req, res) => {
  try {
    const tokenEmail = req.user.email; // Ensure email is extracted correctly from the token
    const email = req.params.email;

    if (tokenEmail !== email) {
      return res.status(403).json({ error: 'Forbidden access' });
    }

    const query = { userEmail: email };
    const myJobsByEmail = await jobsCollection.find(query).toArray();
    res.json(myJobsByEmail);
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




    // Delete a job
    app.delete('/jobs/:id', verifyJWT, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send('Invalid ID format');
        }
    
        const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
        if (!job) {
          return res.status(404).json({ error: 'Job not found' });
        }
    
        if (job.userEmail !== req.user.email) {
          return res.status(403).json({ error: 'Forbidden access' });
        }
    
        const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        console.log('Error deleting job', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    

   // Add job with JWT authentication
app.post('/addJobs', verifyJWT, async (req, res) => {
  try {
    // Check if user is authenticated with JWT
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const addData = req.body;
    const result = await jobsCollection.insertOne(addData);
    res.send(result);
  } catch (error) {
    console.error('Error adding job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


    // Update job
    app.put('/updateJob/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await jobsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { upsert: true }
      );
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
