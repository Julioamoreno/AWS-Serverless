const dynamosse = require('dynamoose');

const Schema = dynamosse.Schema;

const schema =  new Schema({
    id: {
        type: String,
        required: true,
        hashKey: true,
    },
    name: {
        type: String,
        required: true,

    },
    value: {
        type: Number,
        required: true
    }
})

const model = dynamosse.model(
    process.env.SKILLS_TABLE,
    schema
);

module.exports = model;