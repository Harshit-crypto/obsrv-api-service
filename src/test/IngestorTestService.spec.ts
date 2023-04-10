import app from "../app";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import spies from "chai-spies";
import httpStatus from "http-status";
import { TestDataIngestion } from "./Fixtures";
import { config } from "./Config";
import { routesConfig } from "../configs/RoutesConfig";
import constants from "../resources/Constants.json"
import { dbConnector, ingestorService, kafkaConnector } from "../routes/Router";

chai.use(spies);
chai.should();
chai.use(chaiHttp);

describe("DATA INGEST API", () => {
    it("it should ingest data successfully", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([{ "dataset_config": { "entry_topic": "topic" } }])
        })
        chai.spy.on(kafkaConnector.telemetryService, "dispatch", () => {
            return Promise.resolve("data ingested")
        })
        chai
            .request(app)
            .post(config.apiDatasetIngestEndPoint)
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.body.should.be.a("object");
                res.body.responseCode.should.be.eq(httpStatus["200_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.data_ingest.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.SUCCESS)
                chai.spy.restore(dbConnector, "execute")
                chai.spy.restore(kafkaConnector.telemetryService, "dispatch")
                done();
            });
    });
    it("it should not ingest data successfully", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([{ "dataset_config": { "entry_topic": "topic" } }])
        })
        chai.spy.on(kafkaConnector.telemetryService, "dispatch", () => {
            return Promise.reject("error connecting to kafka")
        })
        chai
            .request(app)
            .post(config.apiDatasetIngestEndPoint)
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object");
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.data_ingest.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute")
                chai.spy.restore(kafkaConnector.telemetryService, "dispatch")
                done();
            });
    });
    it("it should not ingest data successfully", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([])
        })

        chai
            .request(app)
            .post(config.apiDatasetIngestEndPoint)
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object");
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.data_ingest.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute")
                done();
            });
    });
    it("it should not ingest data when datasetid param is empty", (done) => {
        chai
            .request(app)
            .post("/obsrv/v1/data/ /")
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.BAD_REQUEST);
                res.body.should.be.a("object");
                res.body.responseCode.should.be.eq(httpStatus["400_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.data_ingest.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                done();
            });
    });
    it("it should not establish connection with kafka", (done) => {
        chai.spy.on(kafkaConnector.telemetryService, "health", () => {
            return Promise.reject("error connecting to kafka")
        })
        ingestorService.init()
        expect(kafkaConnector.telemetryService.health).to.be.called
        chai.spy.restore(kafkaConnector.telemetryService, "health")
        done();
    });
    it("it should establish connection with kafka", (done) => {
        chai.spy.on(kafkaConnector.telemetryService, "health", () => {
            return Promise.resolve("connected to kafka")
        })
        ingestorService.init()
        expect(kafkaConnector.telemetryService.health).to.be.called
        chai.spy.restore(kafkaConnector.telemetryService, "health")
        done();
    });

})
