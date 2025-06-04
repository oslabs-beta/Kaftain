import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import MonitorRecord from './MonitorRecord.js';

const ScalingEvent = sequelize.define('ScalingEvent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  group: { type: DataTypes.STRING, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: false },
  oldReplicas: { type: DataTypes.INTEGER, allowNull: false },
  newReplicas: { type: DataTypes.INTEGER, allowNull: false },
  lag: { type: DataTypes.INTEGER, allowNull: false },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  monitorRecordId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: MonitorRecord,
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
});

// Set up the association
MonitorRecord.hasMany(ScalingEvent, { foreignKey: 'monitorRecordId' });
ScalingEvent.belongsTo(MonitorRecord, { foreignKey: 'monitorRecordId' });

export default ScalingEvent;
