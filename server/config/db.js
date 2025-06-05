import { Sequelize } from 'sequelize';
// const sequelize = new Sequelize('kaftain_db', 'root', 'kaftain',
const sequelize = new Sequelize('kaftain_db', 'root', 'kaftain', {
  host: process.env.DB_HOST || 'localhost', // or your MySQL host
  dialect: 'mysql',
  logging: (msg) => console.debug(`[SQL] ${msg}`), // Emit every raw SQL statement to console
});

export default sequelize;
