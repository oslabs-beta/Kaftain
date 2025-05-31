import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MonitorRecord = sequelize.define('MonitorRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  group: { type: DataTypes.STRING, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' }, // e.g., 'active', 'stopped'
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  stoppedAt: { type: DataTypes.DATE, allowNull: true },
  configSnapshot: { type: DataTypes.JSON, allowNull: true },
});

export default MonitorRecord;
