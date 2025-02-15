import httpStatus from "http-status";
import _  from "lodash";
import moment, { Moment} from "moment";
import { queryRules } from "../configs/QueryRules";
import { IValidator } from "../models/DatasetModels";
import { ICommonRules, ILimits, IQuery, IQueryTypeRules, IRules } from "../models/QueryModels";
import { ValidationStatus } from "../models/ValidationModels";
import constants from "../resources/Constants.json";
import { dbConnector } from "../routes/Router";
import { routesConfig } from "../configs/RoutesConfig";
import { config } from "../configs/Config";
import { isValidDateRange } from "../utils/common";
export class QueryValidator implements IValidator {
    private limits: ILimits;
    private momentFormat: string;
    constructor() {
        this.limits = queryRules
        this.momentFormat = "YYYY-MM-DD HH:MI:SS";
    }
    public async validate(data: any, id: string): Promise<ValidationStatus> {
        let validationStatus
        let datasource
        let shouldSkip
        switch (id) {
            case routesConfig.query.native_query.api_id:
                validationStatus = await this.validateNativeQuery(data)
                datasource = this.getDataSource(data)
                shouldSkip = _.includes(config.exclude_datasource_validation, datasource);
                return validationStatus.isValid ? (shouldSkip ? validationStatus : this.setDatasourceRef(data)) : validationStatus
            case routesConfig.query.sql_query.api_id:
                validationStatus = await this.validateSqlQuery(data)
                datasource = this.getDataSource(data)
                shouldSkip = _.includes(config.exclude_datasource_validation, datasource);
                return validationStatus.isValid ? (shouldSkip ? validationStatus : this.setDatasourceRef(data)) : validationStatus
            default:
                return <ValidationStatus>{ isValid: false }
        }
    }

    private validateNativeQuery(data: any): ValidationStatus {
        let queryObj: IQuery = data;
        this.setQueryLimits(data, this.limits.common);
        let dataSourceLimits = this.getDataSourceLimits(this.getDataSource(data));
        return (!_.isEmpty(dataSourceLimits)) ? this.validateQueryRules(queryObj, dataSourceLimits.queryRules[queryObj.query.queryType as keyof IQueryTypeRules]) : { isValid: true }
    }

    private validateSqlQuery(data: any): ValidationStatus {
        this.setQueryLimits(data, this.limits.common);
        let dataSourceLimits = this.getDataSourceLimits(this.getDataSource(data));
        return (!_.isEmpty(dataSourceLimits)) ? this.validateQueryRules(data, dataSourceLimits.queryRules.scan) : { isValid: true };
    }

    private validateQueryRules(queryPayload: IQuery, limits: IRules): ValidationStatus {
        let fromDate: Moment | undefined, toDate: Moment | undefined;
        let allowedRange = limits.maxDateRange;
        if (queryPayload.query) {
            const dateRange = this.getIntervals(queryPayload.query);
            const extractedDateRange = Array.isArray(dateRange) ? dateRange[0].split("/") : dateRange.toString().split("/");
            fromDate = moment(extractedDateRange[0], this.momentFormat);
            toDate = moment(extractedDateRange[1], this.momentFormat);
        } else {
            let vocabulary = queryPayload.querySql.query.split(" ");
            let fromDateIndex = vocabulary.indexOf("TIMESTAMP");
            let toDateIndex = vocabulary.lastIndexOf("TIMESTAMP");
            fromDate = moment(vocabulary[fromDateIndex + 1], this.momentFormat);
            toDate = moment(vocabulary[toDateIndex + 1], this.momentFormat);
        }
        const isValidDates = fromDate && toDate && fromDate.isValid() && toDate.isValid()
        return isValidDates ? this.validateDateRange(fromDate, toDate, allowedRange)
            : { isValid: false, message: constants.ERROR_MESSAGE.NO_DATE_RANGE, code: httpStatus["400_NAME"] };
    };

    private getDataSource(queryPayload: IQuery): string {
        if (queryPayload.querySql) {
            let query = queryPayload.querySql.query;
            query = query.replace(/\s+/g, " ").trim();
            let dataSource = query.substring(query.indexOf("FROM")).split(" ")[1];
            return dataSource.replace(/"/g, "");
        } else {
            const dataSourceField: any = queryPayload.query.dataSource
            if (typeof dataSourceField == 'object') { return dataSourceField.name }
            return dataSourceField
        }
    };

    private getDataSourceLimits(datasource: string): any {
        for (var index = 0; index < this.limits.rules.length; index++) {
            if (this.limits.rules[index].dataset == datasource) {
                return this.limits.rules[index];
            }
        }
    };

    private validateDateRange(fromDate: moment.Moment, toDate: moment.Moment, allowedRange: number = 0): ValidationStatus {
        const isValidDates = isValidDateRange(fromDate, toDate, allowedRange);
        return isValidDates
            ? { isValid: true, code: httpStatus[200] }
            : { isValid: false, message: constants.ERROR_MESSAGE.INVALID_DATE_RANGE.replace("${allowedRange}", allowedRange.toString()), code: httpStatus["400_NAME"] };
    };

    private getLimit(queryLimit: number, maxRowLimit: number) {
        return queryLimit > maxRowLimit ? maxRowLimit : queryLimit;
    };

    private setQueryLimits(queryPayload: IQuery, limits: ICommonRules) {
        if (queryPayload.query) {
            if (queryPayload.query.threshold) {
                queryPayload.query.threshold = this.getLimit(queryPayload.query.threshold, limits.maxResultThreshold);
            } else {
                queryPayload.query.threshold = limits.maxResultThreshold;
            }
            if (queryPayload.query.limit) {
                queryPayload.query.limit = this.getLimit(queryPayload.query.limit, limits.maxResultRowLimit);
            } else {
                queryPayload.query.limit = limits.maxResultRowLimit;
            }
        } else {
            let vocabulary = queryPayload.querySql.query.split(" ");
            let queryLimitIndex = vocabulary.indexOf("LIMIT");
            let queryLimit = Number(vocabulary[queryLimitIndex + 1]);
            if (isNaN(queryLimit)) {
                const updatedVocabulary = [...vocabulary, "LIMIT", limits.maxResultRowLimit].join(" ");
                queryPayload.querySql.query = updatedVocabulary;
            } else {
                let newLimit = this.getLimit(queryLimit, limits.maxResultRowLimit);
                vocabulary[queryLimitIndex + 1] = newLimit.toString();
                queryPayload.querySql.query = vocabulary.join(" ");
            }
        }
    }

    public async setDatasourceRef(payload: any): Promise<ValidationStatus> {
        try {
            let dataSource = this.getDataSource(payload)
            let dataSourceRef = await this.getDataSourceRef(dataSource)

            if (payload.querySql) {
                payload.querySql.query = payload.querySql.query.replace(dataSource, dataSourceRef)
            }
            else {
                payload.query.dataSource = dataSourceRef
            }
            return { isValid: true };
        } catch (error: any) {
            console.log(error.message)
            return { isValid: false, message: "error ocuured while fetching datasource record", code: httpStatus["400_NAME"] };
        }
    }

    public async getDataSourceRef(datasource: string): Promise<string> {
        const record: any = await dbConnector.readRecords("datasources", { "filters": { "datasource": datasource } })
        return record[0].datasource_ref
    }

    private getIntervals(payload: any) {
        return (typeof payload.intervals == 'object' && !Array.isArray(payload.intervals)) ? payload.intervals.intervals : payload.intervals
    }
}
