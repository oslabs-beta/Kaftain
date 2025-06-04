import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ClusterConfig = sequelize.define('ClusterConfig', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  clusterName: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
});

export default ClusterConfig;
