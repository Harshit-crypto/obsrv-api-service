CREATE TABLE datasets (
    id VARCHAR(255),
    dataset_id VARCHAR(255),
    name VARCHAR(255),
    type VARCHAR(255) CHECK (type IN ('dataset', 'master-dataset')),
    extraction_config JSONB,
    validation_config JSONB,
    dataset_config JSONB,
    dedup_config JSONB,
    data_schema JSONB,
    denorm_config JSONB,
    router_config JSONB,
    tags VARCHAR(255) ARRAY,
    status VARCHAR(255) CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    published_date VARCHAR(255),
    updated_date VARCHAR(255)
);
