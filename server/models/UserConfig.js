import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserConfig = sequelize.define('UserConfig', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  config: { type: DataTypes.JSON, allowNull: false },
});

export default UserConfig;
