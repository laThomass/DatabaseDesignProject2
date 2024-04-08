import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';  // Change to your database name
const client = new MongoClient(url);

async function updatePortfolioValues() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);

        // Process Portfolio Total Values
        await calculateAndUpdatePortfolioValues(db);

        console.log('Portfolio values updated.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

async function calculateAndUpdatePortfolioValues(db) {
    const properties = db.collection('properties');
    const portfolios = db.collection('portfolios');

    const portfolioValues = await properties.aggregate([
        {
            $group: {
                _id: "$portfolio_id",
                totalValue: { $sum: "$value" }
            }
        }
    ]).toArray();

    for (const portfolio of portfolioValues) {
        await portfolios.updateOne(
            { portfolio_id: portfolio._id },
            { $set: { total_value: portfolio.totalValue } }
        );
        console.log(`Updated portfolio ${portfolio._id} with new total value: ${portfolio.totalValue}`);
    }
}

updatePortfolioValues();
