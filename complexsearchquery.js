import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';  
const client = new MongoClient(url);

async function findAdvancedProperties() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);
        const properties = db.collection('properties');

        const query = {
            $and: [
                { value: { $gte: 5000000 } }, // Properties valued at $5 million or more
                { "property_type.name": { $in: ["commercial", "residential"] } }, // Commercial or residential properties
                {
                    $and: [
                        { leases: { $exists: true } }, // Ensures 'leases' field exists
                        { leases: { $not: {$size: 0} } } // Ensures 'leases' is not an empty array
                    ]
                }
            ]
        };

        const results = await properties.find(query).toArray();
        console.log("Properties matching criteria:", results);
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

findAdvancedProperties();
