import axios from "axios";

export const getPrediction = async (modelName, features) => {
  try {
    const response = await axios.post("http://127.0.0.1:5001/predict", {
      model_name: modelName,
      features: features,
    });
    return response.data.prediction;
  } catch (error) {
    console.error("Error fetching prediction:", error.message);
    throw error;
  }
};
