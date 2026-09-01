const axios = require('axios');

const MODEL_URL = 'https://microserviciomodelo.onrender.com/predict';

async function getProbability(features) {
  try {
    const response = await axios.post(MODEL_URL, { features });
    // Espera que la API devuelva { probabilidad_diabetes: <valor> }
    return response.data && response.data.probabilidad_diabetes !== undefined
      ? response.data.probabilidad_diabetes
      : null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getProbability
};
