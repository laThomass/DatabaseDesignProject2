import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const dbName = 'project2';  // Change to your database name
const client = new MongoClient(url);

async function enhanceCollections() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);

        // Process Properties Collection
        await linkProperties(db);

        // Process Portfolios Collection
        await linkPortfolios(db);

        // Process Users Collection
        await linkUsers(db);

        console.log('Collection enhancement complete.');
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

async function linkProperties(db) {
    const properties = db.collection('properties');
    const leases = db.collection('leases');
    const financialReports = db.collection('financial_reports');

    // Link Leases
    const leaseLinks = await leases.aggregate([
        { $group: { _id: "$property_id", lease_ids: { $push: "$lease_id" } } }
    ]).toArray();
    for (const link of leaseLinks) {
        await properties.updateOne(
            { property_id: link._id },
            { $set: { leases: link.lease_ids } }
        );
    }

    // Link Financial Reports
    const reportLinks = await financialReports.aggregate([
        { $group: { _id: "$property_id", report_ids: { $push: "$report_id" } } }
    ]).toArray();
    for (const link of reportLinks) {
        await properties.updateOne(
            { property_id: link._id },
            { $set: { financial_reports: link.report_ids } }
        );
    }
}

async function linkPortfolios(db) {
    const portfolios = db.collection('portfolios');
    const properties = db.collection('properties');

    const propertyLinks = await properties.aggregate([
        { $group: { _id: "$portfolio_id", property_ids: { $push: "$property_id" } } }
    ]).toArray();
    for (const link of propertyLinks) {
        await portfolios.updateOne(
            { portfolio_id: link._id },
            { $set: { properties: link.property_ids } }
        );
    }
}

async function linkUsers(db) {
    const users = db.collection('users');
    const portfolios = db.collection('portfolios');

    const portfolioLinks = await portfolios.aggregate([
        { $group: { _id: "$user_id", portfolio_ids: { $push: "$portfolio_id" } } }
    ]).toArray();
    for (const link of portfolioLinks) {
        await users.updateOne(
            { user_id: link._id },
            { $set: { portfolios: link.portfolio_ids } }
        );
    }
}

enhanceCollections();
