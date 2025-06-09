import { Sequelize } from 'sequelize';
// const sequelize = new Sequelize('kaftain_db', 'kaftain_user', 'kaftain', {
const sequelize = new Sequelize('kaftain_db', 'kaftain_user', 'kaftain', {
  host: process.env.DB_HOST || 'localhost', // or your MySQL host
  dialect: 'mysql',
  logging: (msg) => console.debug(`[SQL] ${msg}`), // Emit every raw SQL statement to console
  retry: { max: 60, backoffBase: 2000 }
});

export default sequelize;

