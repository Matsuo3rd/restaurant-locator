/*
 * Algolia Solutions Team Hiring Assignement (https://github.com/algolia/solutions-hiring-assignment)
 * 
 * This script takes care of data indexing up to Algolia service.
 * It assumes that Data Preparation (data_prepare.js) has already been performed
 * (i.e. restaurants_merge.json exists)
 */

var restaurants_merge_path = __dirname + '/../resources/dataset/restaurants_merge.json';

var algoliasearch = require('algoliasearch');

var client = algoliasearch('AQ7L99YGHS', '2cab74de88406b704912e610ff2da5e6', {
  // timeout indexing error if left to default (is timeout correlated to indexing time / #objects) ???
  timeout : 30000
});

var index = client.initIndex('restaurants');
var contactsJSON = require(restaurants_merge_path);

index.addObjects(contactsJSON, function(err, content) {
  if (err) {
    console.log(err)
  } else {
    console.log("Restaurants Data Indexing Complete")
  }
});
