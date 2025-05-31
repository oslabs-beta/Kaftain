// Handles HTTP requests for lag metrics by invoking lag service functions.
import { fetchLagData } from '../services/lagService.js';

const url = 'http://52.52.97.230:9308/metrics'; //this is hardcoded but needs to updated
const consumerGroupName = "test-consumer-static-value";

export async function getConsumerLag(req, res) {
  try {
    const lagData = await fetchLagData(url, consumerGroupName);
    res.status(200).json(lagData);
  } catch (error) {
    console.error('Error fetching consumer lag:', error);
    res.status(500).send('Error fetching consumer lag');
  }
}

// import axios from 'axios';

// async function getConsumerLag(req, res){
//     const url = 'http://52.52.97.230:9308/metrics';
//   try {
//     const response = await axios.get(url);
//     //console.log('response', response.data);

//     const metrics = response.data;
//     // Scrapes consumer lag lines from exporter
//     const lagLines = metrics.split('\n').filter(line => line.startsWith('kafka_consumergroup_lag_sum'));
//     console.log('lagLines', lagLines);

//     const lagData = lagLines.map(line => {
//       const match = line.match(/kafka_consumergroup_lag_sum{([^}]*)} ([0-9.]+)/); //loops over lagLines array for each line that includes kafka_consumergroup_lag
//       if (!match) return null; //return null if no match is found

//       const matchArray = match[1].split(','); //selecting element at index 1 to extract topic data by splitting at ,

//       const labels = matchArray.reduce((acc, pair) => {     //looping over matchArray
//         const [key, val] = pair.split('=');         //splitting key value pairs at =
//         acc[key.trim()] = val.replace(/"/g, '');    //key.trim trims any white spaces on the key, /"/g replaces with an empty string
//         return acc; //
//       }, {});

//       return {
//         group: labels.consumergroup, //returns this object per match
//         topic: labels.topic,
//         lag: parseFloat(match[2])
//       };
//     }).filter(Boolean);

//     console.log('lagData', lagData);

//     res.status(200).json(lagData); //sends consumer lag per topic per consumer-group
//   } catch(error){
//     throw new Error (`Error fetching consumer lag, ${error.message}`);
//     res.status(500).send('Error fetching consumer lag');
//   }
// }

export default getConsumerLag;
