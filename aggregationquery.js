import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';  
const client = new MongoClient(url);

async function aggregateIncomeAndExpenses() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);
        const collection = db.collection('financial_reports');

        const aggregation = [
            {
                $group: {
                    _id: "$property_id",
                    total_income: { $sum: "$income" },
                    total_expenses: { $sum: "$expenses" }
                }
            }
        ];

        const result = await collection.aggregate(aggregation).toArray();
        console.log(result);
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

aggregateIncomeAndExpenses();
