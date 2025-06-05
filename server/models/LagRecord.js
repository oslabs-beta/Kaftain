import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const LagRecord = sequelize.define('LagRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  group: { type: DataTypes.STRING, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: false },
  lag: { type: DataTypes.INTEGER, allowNull: false },
  clusterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ClusterConfigs',
      key: 'id',
    },
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default LagRecord;
