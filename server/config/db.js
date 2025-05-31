import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('kaftain_db', 'kaftain_user', 'kaftain', {
  host: 'localhost', // or your MySQL host
  dialect: 'mysql',
});

export default sequelize;
