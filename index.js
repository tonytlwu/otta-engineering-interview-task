const csv = require('csv-parser');
const fs = require('fs');
const _ = require('lodash');

const DEV_MODE = false;
const DEV_MODE_SIZE = 1000;

let users;
const userSimilarityScores = [];
let companies;
const companySimilarityScores = [];

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
 *    - Filter entries where { direction: true }
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
  if (DEV_MODE) {
    reactions = _.take(reactions, DEV_MODE_SIZE);
  }

  const likes = _
    .chain(reactions)
    .orderBy(['time'], ['desc'])
    .uniqWith((a, b) => {
      return a.user_id === b.user_id && a.job_id === b.job_id;
    })
    .filter({ direction: 'true' })
    .value();

  users = _.map(_.uniqBy(likes, 'user_id'), (like) => {
    return { user_id: like.user_id };
  });

  _.forEach(users, (user) => {
    user.liked_jobs = _.map(_.filter(likes, { user_id: user.user_id }), 'job_id');
  });

  users = _.mapValues(_.keyBy(users, 'user_id'), 'liked_jobs');

  const user_ids = _.keys(users);

  _.forEach(user_ids, (user_id_a, i) => {
    _.forEach(user_ids, (user_id_b, j) => {
      if (j <= i) {
        return;
      }

      userSimilarityScores.push({
        user_ids: [user_id_a, user_id_b],
        score: _.intersection(users[user_id_a], users[user_id_b]).length
      });
    });
  });

  const mostSimilarUsers = _.maxBy(userSimilarityScores, 'score');

  console.log(`Users ${mostSimilarUsers.user_ids.join(' and ')} have a similarity score of ${mostSimilarUsers.score}`);
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
  if (DEV_MODE) {
    jobs = _.take(jobs, DEV_MODE_SIZE);
  }

  console.log('jobs', jobs.length);
}

getReactions().then((reactions) => {
  processReactions(reactions);

  return;

  return getJobs();
}).then((jobs) => {
  // processJobs(jobs);
});


