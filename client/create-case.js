const axios = require("axios");

const HOST = "http://localhost";
const PORT = "1337";
const CREATE_CASE_PATH = "/api/categories";

const createCases = async () => {
  try {
    const URI = `${HOST}:${PORT}${CREATE_CASE_PATH}`;

    await axios.post(URI, {
      data: { name: "test" },
    });

    console.log("Create cases success!!!");
  } catch (error) {
    console.error(error.message);
  }
};

createCases();
