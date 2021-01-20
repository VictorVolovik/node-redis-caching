const dotenv = require("dotenv");
const express = require("express");
const axios = require("axios");
const redis = require("redis");

dotenv.config();

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const API_GET_GITHUB_USER = username => `https://api.github.com/users/${username}`;
const CACHE_LIFETIME = 60 * 5; // 5 minutes

const app = express();
const redisClient = redis.createClient(REDIS_PORT);

// Helper for response
function setReposeNumResponse (username, reposNum) {
  return `<h2>${username} has ${reposNum} public repositories.</h2>`
}

// Cache middleware
function cacheReposNum (req, res, next) {
  const { username } = req.params;
  const { clearCache } = req.query;

  if (clearCache) {
    return next();
  }

  redisClient.get(username, (err, data) => {
    if (err) throw err;

    if(data !== null) {
      res.send(setReposeNumResponse(username, data))
    } else {
      return next();
    }
  })
}

// Request data from GitHub
async function getReposNum (req, res, next) {
  try {
    console.log("Fetching data...");

    const { username } = req.params;

    const response = await axios.get(API_GET_GITHUB_USER(username))
    const { public_repos: reposNum } = response.data;

    redisClient.setex(username, CACHE_LIFETIME, reposNum);

    res.send(setReposeNumResponse(username, reposNum));

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

app.get("/repos_number/:username", cacheReposNum, getReposNum);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})
