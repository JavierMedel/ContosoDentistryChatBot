// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');
const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require("./intentrecognizer")

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

        // create a QnAMaker connector
        this.QnAMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions);
       
        // create a DentistScheduler connector
        this.DentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration);
      
        // create a IntentRecognizer connector
        this.IntentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);

        this.onMessage(async (context, next) => {
            // send user input to QnA Maker and collect the response in a variable
            // don't forget to use the 'await' keyword

            // print the variable context to the console with a message
            console.log(context)


            // try{

            const answers = await this.QnAMaker.getAnswers(context)
            const result = await this.IntentRecognizer.executeLuisQuery(context);
            const topIntent = result.luisResult.prediction.topIntent;

            // print the variable results to the console with a message
            console.log(` *************************** answers ***************************`)
            console.log(answers)
            
            console.log(` *************************** result ***************************`)
            console.log(result)

            console.log(` *************************** topIntent ***************************`)
            console.log(topIntent)

            let message;
            
            // determine which service to respond with based on the results from LUIS //
            if (result.intents[topIntent].score>0.065){
                if (topIntent=="getAvailability") {
                    message = await this.DentistScheduler.getAvailability(this.IntentRecognizer.getTimeEntity(result));
                } else {
                    message = await this.DentistScheduler.scheduleAppointment(this.IntentRecognizer.getTimeEntity(result));
                };
            } else {
                message = answers.answer;
            }
                // if no answer was found, send a default message
            await context.sendActivity(MessageFactory.text(message, message));
        // } catch (e) {
        //     console.error(e);
        // }
            await next();
        //
        });

        this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        //write a custom greeting
        const welcomeText = 'Welcome to Virtual Dental Virtual Assistant.  I can help you find your appointment or book a one?.  You can say "find a data avaiable" or "find date" to get started.';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }
        // by calling next() you ensure that the next BotHandler is run.
        await next();
    });
    }
}

module.exports.DentaBot = DentaBot;
