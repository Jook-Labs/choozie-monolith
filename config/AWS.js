const { S3 } = require('@aws-sdk/client-s3');
const { awsAccesKey, awsSecretAccesKey, region } = require('./env');
console.log("HUH")
module.exports = s3 = new S3({
    credentials: {
        accessKeyId: awsAccesKey,
        secretAccessKey: awsSecretAccesKey,
    },
    region: region,
    signatureVersion: 'v4',
});
