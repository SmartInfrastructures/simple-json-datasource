## Federation Monitoring APIs Datasource

More documentation about datasource plugins can be found in the [Docs](https://github.com/grafana/grafana/blob/master/docs/sources/plugins/developing/datasources.md).

## Installation

Clone this repo into your grafana plugins directory (default /var/lib/grafana/plugins if you are installing grafana with package). Then run grunt to compile typescript.
Restart grafana-server and the plugin should be automatically detected and used.

```
git clone https://github.com/SmartInfrastructures/simple-json-datasource
npm install
grunt
sudo service grafana-server restart
```

### Dev setup

This plugin requires node 6.10.0 and was developed with Grafana 5.2.2

```
npm install -g yarn
yarn install
npm run build
```

To install Grunt:

```
npm i grunt
sudo npm install -g grunt-cli
npm install load-grunt-tasks
```

### Configuration

![The federation monitoring API datasorce configuration](https://github.com/SmartInfrastructures/simple-json-datasource/blob/master/docs/grafanaConfigDatasource.png "The federation monitoring API datasorce configuration")

### Dashboard Panels setup

Some FIWARE Federation Monitoring APIs data can be displayed in the Grafana panels.
Using the Singlestat panels it is possible to show data about the total number of vms (totalVMs), cores (totalCores) or ips (totalIPs).

![Singlestat panels](https://github.com/SmartInfrastructures/simple-json-datasource/blob/master/docs/singleStatPanels.png "Singlestat panels")

Using the [Worldmap panel](https://grafana.com/plugins/grafana-worldmap-panel) it is possible to show the regions on a map (map_points).

![Worldmap panel](https://github.com/SmartInfrastructures/simple-json-datasource/blob/master/docs/mapGrafana.png "Worldmap panel")

Finally, with a Table panel you can show the services' status of regions (servicesTableJSON).

![Table panel](https://github.com/SmartInfrastructures/simple-json-datasource/v/master/docs/grafanaTableStatus.png "Table panel")

Just select the proper metric in the dropdown menu in the panel edit mode.

![Panel setup](https://github.com/SmartInfrastructures/simple-json-datasource/blob/master/docs/singleStat.png "Panel setup")

### Changelog

2.0.0

- Implemented support for FIWARE Federation Monitoring APIs

1.4.0

- Support for adhoc filters:
  - added tag-keys + tag-values api
  - added adHocFilters parameter to query body

1.3.5
- Fix for dropdowns in query editor to allow writing template variables (broke due to change in Grafana).

1.3.4
- Adds support for With Credentials (sends grafana cookies with request) when using Direct mode
- Fix for the typeahead component for metrics dropdown (`/search` endpoint).

1.3.3
 - Adds support for basic authentication

1.2.4
 - Add support returning sets in the search endpoint

1.2.3
 - Allow nested templates in find metric query. #23

1.2.2
 - Dont execute hidden queries
 - Template support for metrics queries
 - Template support for annotation queries
