require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const mysql = require('mysql2');
const cron = require('node-cron');

const SOLANA_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const NOSANA_TOKEN_ADDRESS = new PublicKey('nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const BUCKETS = [
    { name: '0<NOS<50', min: 0, max: 50 },
    { name: '50<NOS<500', min: 50, max: 500 },
    { name: '500<NOS<5000', min: 500, max: 5000 },
    { name: '5000<NOS<20000', min: 5000, max: 20000 },
    { name: '20000<NOS<50000', min: 20000, max: 50000 },
    { name: '50000<NOS<150000', min: 50000, max: 150000 },
    { name: '150000<NOS<20000000', min: 150000, max: 20000000 }
];

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to the MySQL database.');
});

const connection = new Connection(SOLANA_RPC_URL);

async function fetchAllTokenHolders() {
    try {
        console.log('Fetching all token holders...');

        const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: NOSANA_TOKEN_ADDRESS.toBase58(),
                    }
                }
            ]
        });

        console.log(`Found ${accounts.length} accounts holding Nosana token.`);

        const balances = accounts.map(account => {
            const data = account.account.data;
            const rawAmount = data.readBigUInt64LE(64);
            const amount = Number(rawAmount) / 1_000_000;

            return {
                address: account.pubkey.toBase58(),
                amount
            };
        });

        const nonZeroBalances = balances.filter(wallet => wallet.amount > 0);

        console.log(`Filtered ${nonZeroBalances.length} non-zero balance accounts.`);

        const bucketCounts = BUCKETS.map(bucket => {
            return {
                name: bucket.name,
                count: nonZeroBalances.filter(wallet => wallet.amount > bucket.min && wallet.amount <= bucket.max).length
            };
        });

        console.log('Wallet Distribution:');
        bucketCounts.forEach(bucket => {
            console.log(`${bucket.name}: ${bucket.count}`);
        });

        storeDataInDB(bucketCounts);

    } catch (error) {
        console.error('Error fetching wallet data from Solana RPC:', error);
    }
}

function storeDataInDB(bucketCounts) {
    console.log('Storing data in the database...');

    const query = `
        INSERT INTO wallet_distributions (
            less_than_50,
            between_50_and_500,
            between_500_and_5000,
            between_5000_and_20000,
            between_20000_and_50000,
            between_50000_and_150000,
            greater_than_150000
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        bucketCounts[0].count,
        bucketCounts[1].count,
        bucketCounts[2].count,
        bucketCounts[3].count,
        bucketCounts[4].count,
        bucketCounts[5].count,
        bucketCounts[6].count
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Database insert error:', err);
            return;
        }
        console.log('Inserted data into the database.');
    });
}

fetchAllTokenHolders();

cron.schedule('*/20 * * * *', () => {
    console.log('Running wallet analysis at:', new Date());
    fetchAllTokenHolders();
});
