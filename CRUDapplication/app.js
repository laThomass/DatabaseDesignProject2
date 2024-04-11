const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/project2', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define the User model with Mongoose
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Portfolio = require('./models/Portfolio'); // Adjust the path as necessary


// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the User Management API!');
});

// Create a new user
app.post('/users', (req, res) => {
    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email
    });

    newUser.save()
        .then(user => res.status(201).json(user))
        .catch(err => res.status(400).json(err));
});

// Get all users
app.get('/users', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json(err));
});

// Get a single user by ID
app.get('/users/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            if (!user) res.status(404).send('User not found');
            else res.json(user);
        })
        .catch(err => res.status(500).json(err));
});

// Update a user
app.put('/users/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(user => {
            if (!user) res.status(404).send('User not found');
            else res.json(user);
        })
        .catch(err => res.status(400).json(err));
});

// Delete a user
app.delete('/users/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(user => {
            if (!user) res.status(404).send('User not found');
            else res.send({ message: 'User deleted successfully' });
        })
        .catch(err => res.status(500).json(err));
});

// Fetch portfolios by user_id
app.get('/portfolios/user/:userId', (req, res) => {
    Portfolio.find({ user_id: req.params.userId }) // Use find to potentially fetch multiple portfolios
        .then(portfolios => {
            if (portfolios.length === 0) {
                res.status(404).send('No portfolios found for this user');
            } else {
                res.json(portfolios);
            }
        })
        .catch(err => res.status(500).send({ message: "Error retrieving portfolios", error: err }));
});



// Update portfolio by portfolio_id
app.put('/portfolios/:portfolioId', (req, res) => {
    Portfolio.findByIdAndUpdate(req.params.user_id, req.body, { new: true })
        .then(portfolio => {
            if (!portfolio) {
                res.status(404).send({ message: 'Portfolio not found' });
            } else {
                res.json(portfolio);
            }
        })
        .catch(err => res.status(500).send({ message: 'Error updating portfolio', error: err }));
});

// Fetch a single portfolio by portfolio_id
app.get('/portfolios/:portfolioId', (req, res) => {
    Portfolio.findOne({ portfolio_id: req.params.portfolioId })
        .then(portfolio => {
            if (!portfolio) {
                res.status(404).send('Portfolio not found');
            } else {
                res.json(portfolio);
            }
        })
        .catch(err => res.status(500).send({ message: "Error retrieving portfolio", error: err }));
});

// Assuming Portfolio model is already defined and imported

// Create a new portfolio for a user
app.post('/portfolios', (req, res) => {
    const newPortfolio = new Portfolio({
        user_id: req.body.user_id,  // Ensure user_id is passed correctly from the client
        name: req.body.name,
        total_value: req.body.total_value || 0,  // Default value if not provided
        status: req.body.status || false,  // Default status
        properties: req.body.properties || []  // Default to empty array if not provided
    });

    newPortfolio.save()
        .then(portfolio => res.status(201).json(portfolio))
        .catch(err => res.status(400).json({ message: "Error creating portfolio", error: err }));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
