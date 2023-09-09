
CREATE TABLE datasources (
    id VARCHAR(255),
    dataset_id VARCHAR(255),
    ingestion_spec JSONB, 
    datasource VARCHAR(255),
    datasource_ref VARCHAR(255),
    retention_period JSONB,
    archival_policy JSONB,
    purge_policy JSONB,
    backup_config JSONB,
    status VARCHAR(50) CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    published_date VARCHAR(255)
    updated_date VARCHAR(255)
);
