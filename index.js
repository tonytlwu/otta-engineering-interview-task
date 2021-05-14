const csv = require('csv-parser');
const fs = require('fs');

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

function processReactions(reactions) {
  console.log('reactions', reactions.length);
}

function processJobs(jobs) {
  console.log('jobs', jobs.length);
}

getReactions().then((reactions) => {
  processReactions(reactions);

  return getJobs();
}).then((jobs) => {
  processJobs(jobs);
});
