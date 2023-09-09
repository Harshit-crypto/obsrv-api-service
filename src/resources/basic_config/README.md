# Walkthrough README

## Table of Contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Optional Steps](#optional-steps)


## Introduction

This README will guide you through the setup and configuration process. Follow these steps to get started.

## Prerequisites

 **Add a New User**: Create a postgres user as per the specification mentioned in the [documentation](https://github.com/Sunbird-Obsrv/obsrv-api-service).


## Configuration

 **Configure Tables for Datasets and Datasources**: Use the provided SQL files to set up the necessary database tables.
    - Execute `datasetTable_postgres.sql` to configure the tables for datasets.
    - Execute `datasourceTable_postgres.sql` to configure the tables for datasources.

 **Configure Telemetry and Summary Datasets/Datasources**: Use the provided JSON files to configure Telemetry and Summary datasets and datasources using the datasets and datasource endpoints of the API 
    - Execute `telemetry_dataset_config.json` to configure Telemetry datasets.
    - Execute `summary_dataset_config.json` to configure Summary datasets.
    - Execute `telemetry_datasource_config.json` to configure Telemetry datasources.
    - Execute `summary_datasource_config.json` to configure Summary datasources.

## Usage

 **Configure Dataset and Datasource**: Use the API endpoints to configure telemetry and summary datasets and datasources respectively. You can find the respective configuration files in the project directory.
 
 **Ingest Data** USE THE DATA IN API to ingest data for individual `dataset_id`s .

 **Query Data**: To query data for specific `dataset_id`s, use the API's query endpoints. You can tailor your queries to retrieve the data you need.



By following these steps, you'll be able to configure, query, and ingest data efficiently.



## Optional Steps

 **Ingest Data direcly into Druid (Optional)**: If you want to ingest data directly into Druid using Kafka, utilize the `supervisor_summary_script.json` file for summary data. This script streamlines the data ingestion process. Refer to [Loading streaming data to Druid link](https://druid.apache.org/docs/latest/tutorials/tutorial-kafka/) for more information on streaming data to Druid using Kafka.




