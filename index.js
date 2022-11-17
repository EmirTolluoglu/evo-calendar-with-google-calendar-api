const express = require('express');
//google
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

const path = require('path');
const app = express();
const port = 3000;
//goolge calendar
const oauth2Client = new OAuth2(
    'client_id',
    'client_secret');

oauth2Client.setCredentials({
    refresh_token: 'Here is your refresh token',
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

var eventList = [];

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));


app.get('/', (req, res) => {

    // Call the calendar api to fetch list of events 
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 100, //you can change this value
        singleEvents: true,
        orderBy: 'startTime',
    }, function(err, response) {
        if (err) return console.log('The API returned an error: ' + err);
        const events = response.data.items; //get all events data, you can use this data to display on your page

        //there is a example of how to display specific data and how to process all data
        if (events.length) {

            //events array name and date, if date is null then add name the date
            eventList = events.map((event) => {
                if (event.start.dateTime) {
                    // datetime to parse time and date
                    const startTime = event.start.dateTime.split('T')[1].split('-')[0];
                    const endTime = event.end.dateTime.split('T')[1].split('-')[0];
                    //time only hour and minute
                    const startTimeUp = startTime.split(':')[0] + ':' + startTime.split(':')[1];
                    const endTimeUp = endTime.split(':')[0] + ':' + endTime.split(':')[1];
                    return {
                        name: event.summary + ' (' + startTimeUp + '-' + endTimeUp + ')',
                        date: event.start.dateTime.split('T')[0],
                    }
                } else {
                    return {
                        name: event.summary,
                        date: event.start.date,
                    }
                }
            });
        } else {
            console.log('No upcoming events found.');
        }
        //render page with data, look handlebars file
        res.render('index', { eventList: eventList });
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));