import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';  
const client = new MongoClient(url);

async function updatePortfolioStatus() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);

        const portfolios = db.collection('portfolios');
        const properties = db.collection('properties');

        // Get all portfolios
        const allPortfolios = await portfolios.find().toArray();

        for (const portfolio of allPortfolios) {
            // Check if there are properties linked to this portfolio
            const propertyCount = await properties.countDocuments({ portfolio_id: portfolio.portfolio_id });

            // Update the status based on the presence of properties
            const newStatus = propertyCount > 0; // true if properties exist, false otherwise
            await portfolios.updateOne(
                { portfolio_id: portfolio.portfolio_id },
                { $set: { status: newStatus } }
            );
            console.log(`Updated portfolio ${portfolio.portfolio_id} status to ${newStatus}`);
        }

        console.log('Portfolio status update complete.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

updatePortfolioStatus();
