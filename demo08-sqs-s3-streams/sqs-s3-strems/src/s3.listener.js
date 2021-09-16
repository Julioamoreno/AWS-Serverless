const AWS = require('aws-sdk');
const { Writable, pipeline } = require('stream');

class Handler {
    constructor({ s3Svc, sqsSvc }) {
        this.s3Svc = s3Svc,
        this.sqsSvc = sqsSvc,
        this.queueName = process.env.SQS_QUEUE.toString()
    }

    static getSdks() {
        const host = process.env.LOCALSTACK_HOST || "localhost"
        const port = "4566";
        const isLocal = process.env.IS_LOCAL;

        const s3Endpoint = new AWS.Endpoint(
            `http://${host}:${port}`
        );
        const s3Config = {
            endpoint: s3Endpoint,
            s3ForcePathStyle: true,

        };

        const sqsEndpoint = new AWS.Endpoint(
            `http://${host}:${port}`
        );

        const sqsConfig = {
            endpoint: sqsEndpoint,
        }

        if(!isLocal) {
            delete s3Config.endpoint;
            delete sqsConfig.endpoint;
        }

        return {
            s3: new AWS.S3(s3Config),
            sqs: new AWS.SQS(sqsConfig),
        }
    }

    async getQueueUrl() {
        const { QueueUrl } = await this.sqsSvc.getQueueUrl({
            QueueName: this.queueName,
        }).promise();

        return QueueUrl;
    }

    processDataOnDemand(queueUrl) {
        const writableStream = new Writable({ 
            write: (chunk, encoding, done) => {
               const item = chunk.toString();
               console.log('sending', item);
               this.sqsSvc.sendMessage({
                   QueueUrl: queueUrl,
                   MessageBody: item
               }, done);
            }
        });

        return writableStream;
    }

    async pipefyStreams(...args) {
        return new Promise((resolve, reject) => {
            pipeline(
                ...args, 
                error => error ? reject(error) : resolve()
            )
        })
    }

    async main(event) {
        const [
            {
                s3: {
                    bucket: {
                        name
                    },
                    object: {
                        key
                    }
                }
            }
        ] = event.Records;

        console.log('proccessing', name, key );
        try {
            console.log('getting queueUrl');
            const queueUrl = await this.getQueueUrl();
            console.log(queueUrl);

            const params = {
                Bucket: name, Key: key
            };

            // this.s3Svc.getObject(params)
            //     .createReadStream()
            //     .on("data", msg => console.log('data', msg.toString()))
            //     .on("error", msg => console.log('error', msg.toString()))
            //     .on("close", msg => console.log('close', msg))
            //     .on("finish", msg => console.log('finish'))

            await this.pipefyStreams(
                this.s3Svc.getObject(params)
                .createReadStream(),
                // csvtojson(),
                this.processDataOnDemand(queueUrl)
            )

            return {
                statusCode: 200,
                body: 'Hello'
            }
        } catch (err) {
            console.log(err.stack);
            return {
                statusCode: 500,
                body: 'Internal Server Error'
            }
        }
    }
}

const { s3, sqs } = Handler.getSdks();
const handler = new Handler({
    sqsSvc: sqs,
    s3Svc: s3,
});
module.exports = handler.main.bind(handler)