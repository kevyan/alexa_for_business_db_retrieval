      /* eslint-disable  func-names */
      /* eslint quote-props: ["error", "consistent"]*/

      'use strict';
      const Alexa = require('alexa-sdk');
      const sql = require('mssql');
      const dateFormat = require('dateformat');

      //=========================================================================================================================================
      //=========================================================================================================================================


      var now = new Date();
      const hrs = dateFormat(now, "H");
      const timezone = 4;
      var DateTime = dateFormat(now, "dddd, mmmm dS, yyyy");
      var moraft = 'fail';
      const SKILL_NAME = 'small fleet';
      const HELP_MESSAGE = 'You can say get update to get most recent update on small fleet trucking, or, you can say stop to exit...';
      const HELP_REPROMPT = 'What can I help you with?';
      const STOP_MESSAGE = 'Goodbye!';

      var numQuotes = '';
      var numBinds = '';
      var numPolicies = null;
      var TotYTDPremium = '';
      var top5Brokers = null;
      var i;

      if ((hrs - timezone) > 11){
        moraft = 'afternoon';
      }
      else{
        moraft = 'morning';
      }
       console.log(hrs);

      const query = `SELECT COUNT(*) AS QuotedCount FROM ...;
                      SELECT COUNT(*) AS BoundCount FROM ...;
                      SELECT COUNT(*) AS PolicyCount FROM ...;
                      SELECT SUM(Total_Insurer_Premium_Fees) AS PremiumTotal FROM ...;
                      SELECT TOP(5) c.Producer_Name AS ProducerName FROM ... `;

      exports.handler = function (event, context, callback) {
        const config = {
          user: 'userName',
          password: 'PW',
          server: 'ServerName',
          database: 'DBName',
          port:1000
        };

        sql.connect(config, (err) => {
         if (err) {
           console.log(err);
           callback(err);
         } 
         else {

           const req = new sql.Request();
           req.multiple = true;

          req.query(query, (error, result) => {
               if (error) {
               callback(error);
             }  else {
              console.log(result.recordset);
              numQuotes = result.recordsets[0][0].QuotedCount;
              numBinds = result.recordsets[1][0].BoundCount;
              numPolicies = result.recordsets[2][0].PolicyCount;
              TotYTDPremium = result.recordsets[3][0].PremiumTotal;
              top5Brokers = '';
                for (i = 0; i < 5; i++) {
                  top5Brokers += result.recordsets[4][i].ProducerName + ", ";
                }

              top5Brokers = top5Brokers.replace(/[-()&]/g, "");
              sql.close();

              while (true) {
              if (top5Brokers != null) {
              const alexa = Alexa.handler(event, context, callback);
              alexa.registerHandlers(handlers);
              alexa.execute();
              break;
      }
      }
            }
          });
         }
       });

        sql.on('error', (err) => {
          console.log(err);
          callback(err);
        });
      };


      //=========================================================================================================================================
      //Handlers of intents.
      //=========================================================================================================================================

      const handlers = {
        'LaunchRequest': function () {

         this.response.speak("Good " + moraft + " Welcome to Alexa For Crum and Forster! " + " Today is " + DateTime).listen();
         this.emit(':responseReady');
       },

       'GetQuoteIntent': function () {

        const speechOutput = " Here are the latest statistics for Small Fleet Trucking " + ": " +
        "We have had " + numQuotes + " quotes" + " and " + numBinds + " binds on a Year To Date basis... " + 
        numPolicies + " policies have been issued which represent a total Premium of  " + TotYTDPremium + " dollars. " + " The Top 5 Brokers by Premium Issued are " + top5Brokers + 
        " Goodbye! and have a nice day! ";

        this.response.speak(speechOutput);
        this.emit(':responseReady');
      },

      'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      },
      'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
      },
      'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
      },
    };

