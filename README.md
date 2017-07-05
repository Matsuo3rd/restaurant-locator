# Restaurant Locator

This simple project allows you to search restaurant by name, cuisine and location.
Data set provided is a selection of 5,000 restaurants.

You can see it in action [here] (https://matsuo3rd.github.io/restaurant-locator). 

## Installation

1. Clone this GitHub project
2. Sign-in to [Algolia Search service] (https://www.algolia.com/users/sign_up)
3. Fetch your Algolia `Application ID` and `API Key`
4. Edit `./scripts/setenv.sh` and define you Node.js location with `NODE_HOME`
5. Rename `./scripts/config.json.sample` to `./scripts/config.json` and fill in your `Application ID` and `API Key`
6. Execute `./scripts/data_prepare.sh` to prepare data before indexing it to Algolia
7. Execute `./scripts/data_index.sh` to index your data up to Algolia
8. Open `./index.html` to search for restaurants

Note: The provided dataset has been created using the https://github.com/sosedoff/opentable project.
