// Contains pure functions to fetch and parse Kafka lag metrics.
import axios from 'axios';

export async function fetchLagData() {
  const url = 'http://52.52.97.230:9308/metrics';
  const response = await axios.get(url);
  const metrics = response.data;
  const lagLines = metrics
    .split('\n')
    .filter((line) => line.startsWith('kafka_consumergroup_lag_sum'));
  return lagLines
    .map((line) => {
      const match = line.match(
        /kafka_consumergroup_lag_sum{([^}]*)} ([0-9.]+)/
      );
      if (!match) return null;
      const matchArray = match[1].split(',');
      const labels = matchArray.reduce((acc, pair) => {
        const [key, val] = pair.split('=');
        acc[key.trim()] = val.replace(/"/g, '');
        return acc;
      }, {});
      return {
        group: labels.consumergroup,
        topic: labels.topic,
        lag: parseFloat(match[2]),
      };
    })
    .filter(Boolean);
}
