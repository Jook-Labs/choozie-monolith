const { ListBucketsCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/AWS')

const listBuckets = async () => {
    return await s3.send(new ListBucketsCommand({}))
};
const uploadPhoto = async () => {
    const input = {
        "Body": "filetoupload",
        "Bucket": "examplebucket",
        "Key": "exampleobject",
        "ServerSideEncryption": "AES256",
        "Tagging": "key1=value1&key2=value2"
      };
      const command = new PutObjectCommand(input);
      const response = await s3.send(command);
    return response
};

module.exports = { listBuckets, uploadPhoto }