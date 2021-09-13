'use strict';
const { get } = require('axios');

class Handler {
  constructor({rekoSvc, translatorSvc}) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise();

    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence > 75);

    const names = workingItems
      .map(({Name}) => Name)
      .join(' and ');

    return { names, workingItems };
  }

  
  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }
    
    const { TranslatedText } = await this.translatorSvc
    .translateText(params)
    .promise();
    console.log(TranslatedText);

    return TranslatedText.split(' e ');
  }
  
  formatTextResults(texts, workingItems) {
    const finalText = [];
  
    for (const idx in workingItems) {
        const nameInPortuguese = texts[idx];
        const confidence = workingItems[idx].Confidence;
        
        finalText.push(
          `${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`
        );
    }

    return finalText;
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data, 'base64');

    return buffer;
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      // const imgBuffer = await readFile('./img/cat.jpeg')
      console.log('Downloading Image');

      const imgBuffer = await this.getImageBuffer(imageUrl);
      const { names, workingItems } = await this.detectImageLabels(imgBuffer);
      console.log('Detect..');
      console.log(workingItems);

      console.log('Translate ..');
      const texts = await this.translateText(names)
      
      const finalText = this.formatTextResults(texts, workingItems);
      console.log(finalText);

      return {
        statusCode: 200,
        body: 'A imagem tem \n'.concat(finalText)
      }
    } catch (err) {
      console.log('Error: ', err.stack);
      return {
        statusCode: 500,
        body: 'Internal Server Error'
      }
    }
  }
}

//factory
const aws = require('aws-sdk');
const { Translate } = require('aws-sdk');
const reko = new aws.Rekognition();
const translator = new aws.Translate();
const handler = new Handler({
  rekoSvc: reko,
  translatorSvc: translator,
});

module.exports.main = handler.main.bind(handler);
