const csv = require('csv-parser');
const fs = require('fs');
const _ = require('lodash');

function getCSVData(path) {
  return new Promise((resolve) => {
    const results = [];

    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
}

function getReactions() {
  return getCSVData('data/reactions.csv');
}

function getJobs() {
  return getCSVData('data/jobs.csv');
}

/**
 * 1. Create a list of users based on reactions
 *    - Sort reactions in order first as only the last reaction by a user to a job matters
 *    - Find uniq user-to-job combinations only
 *    - Remove entries with where { direction: false }
 *    - Find unique users
 * 2. Each user has a likedJobs array filled with liked job IDs
 *    - Find liked jobs for each unique user
 * 3. Create an empty list of userSimilarityScores
 * 4. Loop through the users in 2 dimensions to fill in the userSimilarityScores field
 * 5. For each user-to-user comparison, find the number of jobs that they both liked
 * 6. Find the entry in userSimilarityScores with the highest similarity score
 * @param {String} user_id - user ID
 * @param {String} job_id - job ID
 * @param {String} direction - 'true' for like, 'false' for unlike
 * @param {String} time - timestamp
 */
function processReactions(reactions) {
  console.log('reactions', reactions.length);
}

/**
 * 1. Create a list of companies based on jobs
 * 2. Each company has a jobs array filled with job IDs
 * 3. Create an empty list of companySimilarityScores
 * 4. Loop through the companies in 2 dimensions to fill in the companySimilarityScores field
 * 5. For each company-to-company comparison, find the number of users who like at least one job at both companies
 * 6. Find the entry in companySimilarityScores with the highest similarity score
 * @param {String} job_id - Unique job ID
 * @param {String} company_id - company ID
 */
function processJobs(jobs) {
  console.log('jobs', jobs.length);
}

getReactions().then((reactions) => {
  processReactions(reactions);

  return getJobs();
}).then((jobs) => {
  processJobs(jobs);
});


