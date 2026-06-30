import { createConnection } from 'mysql2/promise';

const conn = await createConnection({
  host: 'buronet-db.mysql.database.azure.com',
  port: 3306,
  user: 'buronetUser',
  password: 'buronet@2025',
  database: 'buronet',
  ssl: { rejectUnauthorized: false }
});

console.log('\n=== ALL USERS (admins first) ===\n');
const [rows] = await conn.execute(
  `SELECT 
     BIN_TO_UUID(Id) AS Id,
     Username,
     Email,
     isAdmin,
     IsEmailConfirmed,
     DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i') AS CreatedAt
   FROM Users
   ORDER BY isAdmin DESC, CreatedAt ASC
   LIMIT 30`
);

console.table(rows);

const adminCount = rows.filter(r => r.isAdmin).length;
console.log('\\n=== SUMMARY ===');
console.log('Admin users found: ' + adminCount);
console.log('Total users shown: ' + rows.length);

await conn.end();
