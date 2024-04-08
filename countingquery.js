import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';
const client = new MongoClient(url);

async function countUserPortfolios() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);
        const collection = db.collection('portfolios');

        const count = await collection.countDocuments({ user_id: 5 });
        console.log(`User 5 has ${count} portfolios.`);
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

countUserPortfolios();
