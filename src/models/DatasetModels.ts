import { IngestionConfig } from "./IngestionModels";
import { ILimits, IQuery } from "./QueryModels";

export interface ProcessingConfig {
    checkpointingInterval: number,
    dedupProperty: string,
    dedupRetentionPeriod: number,
    consumerParallelism: number,
    downstreamParallelism: number,
    dataSize: number
}

export interface DataSetConfig {
    querying: ILimits
    ingestion: IngestionConfig,
    processing: ProcessingConfig
}


export interface SchemaUpdate {
    property: string,
    conflictType: string,
    objectType: string
    action: string
}