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
    skills: {
        type: Array,
        schema: [String],
        required: true
    }
})

const model = dynamosse.model(
    process.env.HEROES_TABLE,
    schema
);

module.exports = model;