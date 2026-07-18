/**
 * Optional DB module configuration — see docs/DATABASE-MODULE.md
 *
 * Copy this file to `local.db.js` (gitignored) and fill in your SQL Server
 * connection. The DB module activates automatically whenever
 * `config/environments/<version>.db.js` exists for the environment you run.
 *
 * Never point tests at a production database.
 */
const dbConfig = {
    // TODO(template): your SQL Server connection — see docs/DATABASE-MODULE.md#enable
    userName: 'TODO_db_user',
    password: 'TODO_db_password',
    server: 'localhost',
    options: {
        database: 'TODO_database_name',
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
}

module.exports = dbConfig
