import axios from 'axios';

const url = 'http://52.52.97.230:9308/metrics'; //this is hardcoded but needs to updated
const consumerGroupName = "test-consumer-static-value";

async function fetchLag(url, consumerGroupName){
  try {
    const response = await axios.get(url);
    //console.log('response', response.data);

    const metrics = response.data;
    // Scrapes consumer lag lines from exporter
    const lagLines = metrics
    .split('\n')
    .filter(line =>
      line.startsWith('kafka_consumergroup_lag_sum') &&
      line.includes(`consumergroup="${consumerGroupName}"`)  //filter by consumer group
    );
    console.log('lagLines', lagLines);

    const lagData = lagLines.map(line => {
      const match = line.match(/kafka_consumergroup_lag_sum{([^}]*)} ([0-9.]+)/); //loops over lagLines array for each line that includes kafka_consumergroup_lag
      if (!match) return null; //return null if no match is found

      const matchArray = match[1].split(','); //selecting element at index 1 to extract topic data by splitting at ,

      const labels = matchArray.reduce((acc, pair) => {     //looping over matchArray
        const [key, val] = pair.split('=');         //splitting key value pairs at =
        acc[key.trim()] = val.replace(/"/g, '');    //key.trim trims any white spaces on the key, /"/g replaces with an empty string
        return acc; //
      }, {});

      return {
        group: labels.consumergroup, //returns this object per match
        topic: labels.topic,
        lag: parseFloat(match[2])
      };
    }).filter(Boolean);  //removes any falsy values such as null in an array

    console.log('lagData', lagData);
    return lagData;

  } catch(error){
    throw new Error (`Error fetching consumer lag, ${error.message}`);
  }
}

async function getConsumerLag (req, res) {
  try {
    const consumerGroup = "test-consumer-static-value" //this is currently hardcoded but needs to be updated
    const lagObject = await fetchLag(url, consumerGroup);
    res.status(200).json(lagObject);
  } catch (error) {
    throw new Error (`Error in fetching lag, ${error.message}`);
    res.status(500).send('Error fetching consumer lag');
  }
}

export default {getConsumerLag, fetchLag};