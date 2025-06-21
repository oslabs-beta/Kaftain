import express from 'express';
import MonitorRecord from '../models/MonitorRecord.js';

const router = express.Router();

// PUT /monitor-records/:id/config
router.put('/:id/config', async (req, res) => {
  const { id } = req.params;
  const newConfig = req.body.config; // we're expecting { config: { ... } } in the request body

  if (!newConfig) {
    return res
      .status(400)
      .json({ error: 'Config object must be provided in request body.' });
  }

  try {
    const monitorRecord = await MonitorRecord.findByPk(id);
    if (!monitorRecord) {
      return res.status(404).json({ error: 'MonitorRecord not found.' });
    }

    // Update the configSnapshot field
    monitorRecord.configSnapshot = newConfig;
    await monitorRecord.save();

    res
      .status(200)
      .json({
        message: 'MonitorRecord config updated successfully.',
        monitorRecord,
      });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update MonitorRecord config.',
      details: error.message,
    });
  }
});

export default router;
