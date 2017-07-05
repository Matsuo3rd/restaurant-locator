/*
 * Algolia Solutions Team Hiring Assignement (https://github.com/algolia/solutions-hiring-assignment)
 * 
 * This script takes care of data indexing up to Algolia service.
 * It assumes that Data Preparation (data_prepare.js) has already been performed
 * (i.e. restaurants_merge.json exists)
 */

var restaurants_merge_path = __dirname + '/../resources/dataset/restaurants_merge.json';
var algoliasearch = require('algoliasearch');
var fs = require('fs');

fs.stat('config.json', function(err, stat) {
  if (err != null) {
    if (err.code == 'ENOENT') {
      console.log('config.json does not exist. Please create one with both "applicationID" and "apiKey" defined');
    }
    else {
      console.log('Error: ', err.code);
    }
  }
});
var config = require('./config.json');

var client = algoliasearch(config.applicationID, config.apiKey, {
  timeout : 30000
});

var index = client.initIndex('restaurants');
var contactsJSON = require(restaurants_merge_path);

index.addObjects(contactsJSON, function(err, content) {
  if (err) {
    console.log(err);
  } else {
    console.log("Restaurants Data Indexing Complete");
  }
});

