'use strict';
// First let's define the usual configuration variables for our index
var applicationId = 'AQ7L99YGHS';
var apiKey = '2a387290825796846ce21f25ed5d56e9';
var index = 'restaurants';
var client = algoliasearch(applicationId, apiKey);

// Define the `AgoliaSearchHelper` module
angular.module('AlgoliaSearchHelper', ['ngSanitize']).

// Expose the helper
factory('helper', function() {
  return algoliasearchHelper(client, index, {
    //facets: ['food_type', 'stars_count_range', 'selected_payment_options'],
    disjunctiveFacets: ['food_type', 'stars_count_range', 'selected_payment_options'],
    hitsPerPage: 5,
    maxValuesPerFacet: 7
  });
}).

// Define the search-box 
component('searchBox', {
  template: `<div class='search-box-header'>
    <input 
      placeholder="Search for Restaurants by Name, Cuisine, Location" 
      class="search-box"
      ng-keyup=search($evt) 
      ng-model="query"
    /><div>`,
  controller: function SearchBoxController($scope, helper) {
    $scope.query = '';
    $scope.search = function() {
      helper.setQuery($scope.query).search();
    };
    
    geolocation(function(position, err) {
      if (position != null) {
	var lat = position.coords.latitude;
	var long = position.coords.longitude;
//	var lat = 40.799727;
//	var long = -74.358237;
	helper.setQueryParameter('aroundLatLng', lat + ', ' + long);
      } else {
	helper.setQueryParameter('aroundLatLngViaIP', true);
      }
      //helper.setQuery('').search();
    });
    
    helper.setQuery('').search();
  }
}).

// Define the search-facets
component('searchFacets', {
  template: `<div class="facets" ng-if="nbHits > 0">
    	      <div class="facet facet_food_type">
        	<ul class="facet-list">
        	  <div class="facetHeader">Cuisine/Food Type</div>
                  <span ng-repeat="facet in facets.food_type">
                    <li 
                       ng-click="toggleFacet('food_type', facet.name)"
                       ng-class="{active: facet.isRefined}">
                      <label> 
                      <span class="facetValue" ng-bind-html="facet.name"></span> 
                      <span class="facetCount" ng-bind-html="facet.count"></span>
                      </label>
                    </li>
                  </span>
                </ul>
    	     </div>
    	     <div class="facet facet_stars_count">
        	<ul class="facet-list">
        	  <span class="facetHeader">Rating</span>
                  <span ng-repeat="facet in facets.stars_count_range">
                    <li 
                       ng-click="toggleFacet('stars_count_range', facet.name)"
                       ng-class="{active: facet.isRefined}">
                      <label> 
                      <span class="stars">{{facet.name}}</span>
                      <span class="facetCount" ng-bind-html="facet.count"></span>
                      </label>
                    </li>
                  </span>
                </ul>
    	     </div>
    	     <div class="facet facet_selected_payment_options">
        	<ul class="facet-list">
        	  <span class="facetHeader">Payment Options</span>
                  <span ng-repeat="facet in facets.selected_payment_options">
                    <li 
                       ng-click="toggleFacet('selected_payment_options', facet.name)"
                       ng-class="{active: facet.isRefined}">
                      <label> 
                      <span class="facetValue" ng-bind-html="facet.name"></span> 
                      <span class="facetCount" ng-bind-html="facet.count"></span>
                      </label>
                    </li>
                  </span>
                </ul>
    	     </div>
    	     </div>
    	     <div class="facets noResults" ng-if="nbHits == 0">
    	     </div>
    	     `,
  controller: function SearchFacetsController($scope, helper) {
    $scope.toggleFacet = function (facet, value) {
      //helper.toggleRefinement('category', name).search();
      helper.toggleRefinement(facet, value).search();
    };
    helper.on('result', results => {
      //$scope.$apply($scope.facets = results.getFacetValues('food_type'));
      var facets=[];
      $scope.$apply($scope.facets = results.facets);
      for (var i=0; i<helper.state.facets.length; i++){
	facets[helper.state.facets[i]] = results.getFacetValues(helper.state.facets[i]);
      }
      for (var i=0; i<helper.state.disjunctiveFacets.length; i++){
	facets[helper.state.disjunctiveFacets[i]] = results.getFacetValues(helper.state.disjunctiveFacets[i]);
      }
      $scope.$apply($scope.facets = facets);
      $scope.$apply($scope.nbHits = results.nbHits);
    });
  }
}).

// Define the search-results
component('searchResult', {
  template: `
    <div class="results header">
	<div class="header-results">
		<div ng-if="results.nbHits > 0">
		<!--button class="facet-toggle" ng-click="toggleFacets()">Toggle Categories</button-->
		<span class="facet-toggle">
		  <img src="./resources/graphics/menu-alt.png"  ng-click="toggleFacets()"
		  	alt="Toggle filters" title="Toggle filters"></img>
		</span>
    	   	<span class="nbHits">{{results.nbHits}} results found</span>
    	   	<span class="duration">in {{(results.processingTimeMS / 1000)}} seconds</span></div>
    	   	</div>
    	   	<div ng-if="results.nbHits == 0">
    	   		No Restaurant could be found
    	   	</div>
	<div class="header-filler"></div>
     </div>
     <div class="hit results">
      <span ng-repeat="hit in results.hits">
	<!--<div ng-bind-html="hit._highlightResult.name.value"></div>-->
	<div class="result">
          <span class="thumbnail">
  		<img ng-src="{{hit.image_url}}" class="thumbnail-img"></img>
          </span>
          <span class="metas">
           	<span class="meta name">
           		<a ng-href="{{mobileCheck ? hit.mobile_reserve_url : hit.reserve_url}}" class="name-link">{{hit.name}}</a>
           	</span>
          	<span class="meta stars_reviews">
          		<span class="stars_count">{{hit.stars_count}}</span>
          		<span class="stars">{{hit.stars_count}}</span>
          		<span class="reviews">({{hit.reviews_count}} reviews)</span>
          	</span>
          	<span class="meta desc">
          		{{hit.food_type}} | {{hit.neighborhood}} | {{hit.price_range}}
          	</span>
          </span>
        </div>
      </span>
      <div ng-if="results.nbHits === 0" class="no-results hit results">
        <div class="result">&nbsp;</div>
      </div>
    </div>`,
  controller: function SearchResultController($scope, helper) {
    helper.on('result', results => {
      $scope.$apply($scope.results = results);
      $('span.stars').stars();
    });
    
   $scope.toggleFacets = function() {
     $('.flex-column.nav').toggle();
   }
  }
}).

// Define the search-pagination
component('searchPagination', {
  template: `<div class="pager">
      <!--button class="previous" ng-click="previousPage()">Previous</button>
      <span class="current-page"><span ng-bind-html="page"></span></span>
      <button class="next" ng-click="nextPage()">Next</button-->
      <button ng-if="nbPages > 0 && nbPages != page" class="showMore" ng-click="showMore()">Show More</button>
    </div>`,
  controller: function SearchPaginationController($scope, helper) {
    helper.on('result', results => {
	$scope.$apply($scope.page = "" + (results.page + 1) );
	$scope.$apply($scope.nbPages = results.nbPages);
    });
    
    $scope.nextPage = function() {
      helper.nextPage().search();
    };
    
    $scope.previousPage = function() {
      helper.previousPage().search();
    };
    
    $scope.showMore = function() {
      helper.nextPage().search();
    };
  }
});

$.fn.stars = function() { 
  return this.each(function() {
    // Get the value
    var val = parseFloat($(this).html()); 
    // Make sure that the value is in 0 - 5 range, multiply to get width
    var size = Math.max(0, (Math.min(5, val))) * 36.5; 
    // Create stars holder
    var $span = $('<span> </span>').width(size); 
    // Replace the numerical value with stars
    $(this).empty().append($span);
  });
}

function geolocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      callback(position);
	//helper.setQueryParameter('aroundLatLng', '40.799727,-74.358237');
  	//helper.setQueryParameter('aroundLatLng', "'" + position.coords.latitude + "," + position.coords.longitude + "'");
    }, function(err) {
	  console.log("Geoloc not granted. IP fallback");
	  //helper.setQueryParameter('aroundLatLngViaIP', true);
	  callback (null, err);
    });
  } else {
	console.log("Geoloc not supported. IP Fallback");
	//helper.setQueryParameter('aroundLatLngViaIP', true);
	callback (null, err);
  }
}

window.mobileCheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
