import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ClusterConfig from './ClusterConfig.js';

const ConsumerGroups = sequelize.define('ConsumerGroups', {
    id: { type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
    clusterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'ClusterConfigs',
          key: 'id',
        },
      },
      groups: {
        type: DataTypes.JSON,
        allowNull: true,
      }, 
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

})

ClusterConfig.hasMany(ConsumerGroups, { foreignKey: 'clusterId' });
ConsumerGroups.belongsTo(ClusterConfig, { foreignKey: 'clusterId' });

export default ConsumerGroups;