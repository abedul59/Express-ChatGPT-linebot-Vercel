const express = require("express");
const line = require('@line/bot-sdk');
const https = require("https")




const app = express();

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))


const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);




/*
async function getGPTResponse(user_input)  {

    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);



    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: user_input,
      });
      console.log(completion.data.choices[0].text);

  
  

      return completion.data.choices[0].text;
};
*/


const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



const handleEvent = async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text,
    });
    console.log(completion.data.choices[0].text);

    msg = {
      type: 'text', text: completion.data.choices[0].text // 範例
  }

    
    return client.replyMessage(event.replyToken, msg).catch((err) => {
        if (err) {
            console.error(err);
        }
    });
};




// Webhook listener
app.get('/', (req, res) => {
  res.end('hello!');
});

app.post('/webhook', (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            res.status(500).end();
        });
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
