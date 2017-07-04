/*
 * Algolia Solutions Team Hiring Assignement (https://github.com/algolia/solutions-hiring-assignment)
 * 
 * This script takes care of data preparation prior to get them indexed.
 * Restaurants' data is spread over 2 files: restaurants_list.json + restaurants_info.csv.
 * Starting from JSON file, the additional data from the CSV file, through the "objectID" key,
 * is added as extra JSON fields
 */

var restaurants_json_path = __dirname + '/../resources/dataset/restaurants_list.json';
//var restaurants_json_path = __dirname + '/../resources/dataset/restaurants_sample.json';
var restaurants_csv_path = __dirname + '/../resources/dataset/restaurants_info.csv';
var restaurants_merge_path = __dirname + '/../resources/dataset/restaurants_merge.json';

var fs = require('fs');
var path = require('path');
var extend = require('util')._extend;
var csv_parse = require('csv-parse');

// For payment options, we should only have: AMEX/American Express, Visa,
// Discover, and MasterCard For our purpose
var payment_options_whitelist = [ 'AMEX', 'Visa', 'Discover', 'MasterCard' ];
// Diners Club and Carte Blanche are Discover cards
var payment_options_discover_alt = [ 'Diners Club', 'Carte Blanche' ];

var csvData = [];
fs.createReadStream(restaurants_csv_path).pipe(csv_parse({
  delimiter : ';',
  columns : true
})).on('data', function(csvrow) {
  csvData[csvrow.objectID] = csvrow;
}).on('end', function() {
  console.log('CSV Restaurants data parsing complete');
  fs.readFile(restaurants_json_path, 'utf8', function(err, data) {
    if (err) {
      throw err; // consider error handling later
    }
    // restaurants merging JSON & CSV fields
    var restaurants = [];
    var restaurants_json = JSON.parse(data);
    restaurants_json.forEach(function(restaurant_json) {
      var restaurant = extend({}, restaurant_json);
      // add all CSV restaurants fields to JSON restaurants
      extend(restaurant, csvData[restaurant_json.objectID]);
      addStarsCountRange(restaurant);
      addSelectedPaymentOptions(restaurant);
      restaurants.push(restaurant);
    });
    console.log('Merging JSON & CSV Restaurants data complete');
    fs.writeFile(restaurants_merge_path, JSON.stringify(restaurants), 'utf8');
    console.log('Writing Merged JSON Restaurants data to ' + restaurants_merge_path + ' complete');
  });
});

function addStarsCountRange(restaurant) {
  restaurant.stars_count_range = Math.round(restaurant.stars_count);
}

function addSelectedPaymentOptions(restaurant) {
  var selected_payment_options = restaurant.payment_options.slice();
  for (var i = selected_payment_options.length - 1; i >= 0; --i) {
    // Normalize Discover cards
    if (payment_options_discover_alt.indexOf(selected_payment_options[i]) > -1) {
      selected_payment_options[i] = 'Discover';
    } // Remove not "allowed" cards
    else if (payment_options_whitelist.indexOf(selected_payment_options[i]) < 0) {
      selected_payment_options.splice(i, 1);
    }
  }
  restaurant.selected_payment_options = Array.from(new Set(selected_payment_options));
}
