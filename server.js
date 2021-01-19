const express = require("express");
const axios = require("axios");

const PORT = process.env.PORT || 5000;

const API_GET_GITHUB_USER = username => `https://api.github.com/users/${username}`;

const app = express();

// Request data from GitHub
async function getReposNum (req, res, next) {
  try {
    console.log("Fetching data...");

    const { username } = req.params;

    const response = await axios.get(API_GET_GITHUB_USER(username))
    const { public_repos: reposNum } = response.data;

    res.send(`<h2>${username} has ${reposNum} public repositories.</h2>`);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

app.get("/repos_number/:username", getReposNum);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})
