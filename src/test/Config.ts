import { routesConfig } from "../configs/RoutesConfig"
const config = {
  apiStatusEndPoint: "/obsrv/status",
  apiHealthEndPoint: "/obsrv/health",
  apiDruidEndPoint: `${routesConfig.query.native_query.path}`,
  apiDruidSqlEndPoint: `${routesConfig.query.sql_query.path}`,
  apiDatasetIngestEndPoint: `${routesConfig.data_ingest.path}`,
  apiDatasetSaveEndPoint: `${routesConfig.config.dataset.save.path}`,
  apiDatasetUpdateEndPoint: `${routesConfig.config.dataset.update.path}`,
  apiDatasetReadEndPoint: `${routesConfig.config.dataset.read.path}`,
  apiDatasetListEndPoint: `${routesConfig.config.dataset.list.path}`,
  apiDatasourceSaveEndPoint: `${routesConfig.config.datasource.save.path}`,
  apiDatasourceUpdateEndPoint: `${routesConfig.config.datasource.update.path}`,
  apiDatasourceReadEndPoint: `${routesConfig.config.datasource.read.path}`,
  apiDatasourceListEndPoint: `${routesConfig.config.datasource.list.path}`,
  apiDatasetSourceConfigSaveEndPoint: `${routesConfig.config.dataset_source_config.save.path}`,
  apiDatasetSourceConfigUpdateEndPoint: `${routesConfig.config.dataset_source_config.update.path}`,
  apiDatasetSourceConfigReadEndPoint: `${routesConfig.config.dataset_source_config.read.path}`,
  apiDatasetSourceConfigListEndPoint: `${routesConfig.config.dataset_source_config.list.path}`,
  druidHost: "http://localhost",
  druidPort: 8888,
  druidEndPoint: "/druid/v2",
  druidSqlEndPoint: "/druid/v2/sql/"
};
export { config };
