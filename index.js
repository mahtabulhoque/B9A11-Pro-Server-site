const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000




// middleware

// const corsOption = {
//     origin: ['http://localhost:5173/' , 'http://localhost:5174/'],
//     Credential:true,
//     optionSuccessStatus: 200,
// }

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASSWORD);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.unskf0z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const jobsCollection = client.db('mahach0396').collection('jobs')
   

    // get all jobs

    app.get("/jobs", async (req, res) => {
        const result = await jobsCollection.find({}).toArray()

        res.send(result)
    })

    // get single data

    app.get('/job/:id', async (req, res) =>{
       const id = req.params.id
       const query = {_id : new ObjectId(id)}
       const result = await jobsCollection.findOne(query)
       res.send(result)
    })

    // my job data


    app.get('/jobs', async(req,res) =>{
      try{
        const Email = req.query.userEmail;
        // console.log(Email);
        const query = {userEmail:Email};
        const myJobsByEmail = await jobsCollection.find(query).toArray();
        res.json(myJobsByEmail)
      }catch (error){
        console.log('Error fatching data', error);
        res.status(500).json({error:'Internal server error'})
      }
    }
  )



    // add data saving 


    app.post('/addJobs', async(req, res) =>{
      const addData = req.body
      const result = await jobsCollection.insertOne(addData)
      console.log(result);
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    

  }
}
run().catch(console.dir);







app.get('/', (req,res) => {
    res.send('B9A11 assignment is running')
})

app.listen(port, () => {
    console.log(`B9A11 Server is running on port:${port}`);
})
