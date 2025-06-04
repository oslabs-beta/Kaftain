import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ClusterConfig = sequelize.define('ClusterConfig', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  clusterName: { type: DataTypes.STRING, allowNull: true },
  url: { type: DataTypes.STRING, allowNull: false },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default ClusterConfig;
