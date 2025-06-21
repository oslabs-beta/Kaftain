import axios from 'axios';

/**
 * Fetches a Kafka exporter metrics endpoint and extracts the unique consumer groups.
 *
 * @param {string} url - Full URL of the Kafka exporter metrics endpoint.
 * @returns {Promise<{ consumerGroups: string[] }>} Object containing an array of unique consumer groups.
 */
export async function fetchConsumerGroups(url) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('fetchConsumerGroups: url must be a non-empty string');
  }

  // Retrieve the raw Prometheus metrics text
  const { data } = await axios.get(url);

  // Use global regex to capture every consumergroup="..." occurrence
  const regex = /consumergroup="([^"]+)"/g;
  const consumerSet = new Set();

  let match;
  while ((match = regex.exec(data)) !== null) {
    if (match[1]) {
      consumerSet.add(match[1]);
    }
  }

  return { consumerGroups: Array.from(consumerSet) };
} 