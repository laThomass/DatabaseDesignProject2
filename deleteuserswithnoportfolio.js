import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';  
const client = new MongoClient(url);

async function deleteUsersWithoutPortfolios() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);

        const users = db.collection('users');
        const portfolios = db.collection('portfolios');

        // Find all user_ids that have portfolios
        const usersWithPortfolios = await portfolios.distinct("user_id");

        // Delete users who do not have any portfolios
        const result = await users.deleteMany({ user_id: { $nin: usersWithPortfolios } });
        
        console.log(`${result.deletedCount} users without portfolios were deleted.`);
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

deleteUsersWithoutPortfolios();
