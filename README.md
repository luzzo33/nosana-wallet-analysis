# Nosana Wallet Analysis

Nosana Wallet Analysis is a Node.js tool that analyzes Nosana token holders. This application fetches wallet data, categorizes token holders based on their holdings, and stores the results in a MySQL database. The analysis runs periodically using a cron job.

## Features

- **Blockchain Connection**: Connects to the Solana blockchain using Helius RPC.
- **Token Holder Analysis**: Fetches Nosana token holder data and categorizes them into specified buckets.
- **Data Persistence**: Stores the categorized data in a MySQL database.
- **Automated Scheduling**: Executes every 20 minutes to provide continuous analysis.

## Prerequisites

Before running this tool, make sure you have the following:

- **Node.js**: Install Node.js from [nodejs.org](https://nodejs.org/).
- **MySQL**: Set up a MySQL server and create a database for data storage.
- **Helius API Key**: Obtain a Helius API key to access Solana's RPC.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/luzzo33/nosana-wallet-analysis.git
   cd nosana-wallet-analysis
   ```

2. **Install Dependencies**

   Use npm to install the required dependencies:

   ```bash
   npm install
   ```

3. **Configure the Environment Variables**

   Create a `.env` file in the project root and add your configuration details:

   ```plaintext
   HELIUS_API_KEY=your_helius_api_key
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASS=your_mysql_password
   DB_NAME=your_mysql_database_name
   ```

4. **Set Up the MySQL Database**

   Execute the following SQL command to create a table for storing wallet distributions:

   ```sql
   CREATE TABLE wallet_distributions (
       id INT AUTO_INCREMENT PRIMARY KEY,
       less_than_50 INT,
       between_50_and_500 INT,
       between_500_and_5000 INT,
       between_5000_and_20000 INT,
       between_20000_and_50000 INT,
       between_50000_and_150000 INT,
       greater_than_150000 INT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Usage

### Running the Analysis

To run the tool manually, execute the following command:

```bash
node index.js
```

The script will:

1. Connect to the Solana blockchain and retrieve Nosana token holders' accounts.
2. Categorize token holders into buckets based on their holdings.
3. Store the categorized data in the MySQL database.
4. Log the results in the console for immediate insight.

### Automated Scheduling

The analysis runs every 20 minutes using a cron job defined in the code. You can adjust the scheduling by modifying the cron expression:

```javascript
cron.schedule('*/20 * * * *', () => {
    console.log('Running wallet analysis at:', new Date());
    fetchAllTokenHolders();
});
```

## Configuration

You can adjust the bucket definitions in the code to match your analysis needs:

```javascript
const BUCKETS = [
    { name: '0<NOS<50', min: 0, max: 50 },
    { name: '50<NOS<500', min: 50, max: 500 },
    { name: '500<NOS<5000', min: 500, max: 5000 },
    { name: '5000<NOS<20000', min: 5000, max: 20000 },
    { name: '20000<NOS<50000', min: 20000, max: 50000 },
    { name: '50000<NOS<150000', min: 50000, max: 150000 },
    { name: '150000<NOS<20000000', min: 150000, max: 20000000 }
];
```

## Troubleshooting

- **Database Connection Error**: Verify your MySQL connection details in the `.env` file and ensure the database server is running.
- **Solana RPC Issues**: Check that your Helius API key is valid and the RPC URL is correctly formatted.
- **Missing Environment Variables**: Make sure all required environment variables are present in your `.env` file.

## Contributing

Contributions to this project are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m 'Add a feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a pull request on the main repository.
