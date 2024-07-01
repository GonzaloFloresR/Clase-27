//Cargar el arhivo directamente

const accountSid = 'ACd2e10822fa0731a4b097eaec2ec35d48';
const authToken = '00399d39bd36b5d0e4f5fcb98546d226';
//const client = require('twilio')(accountSid, authToken);
import twilio from "twilio";
const client = twilio(accountSid, authToken);

client.messages
    .create({
        body: 'Your appointment is coming up on July 21 at 3PM',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+56995623229'
    })
    .then(message => console.log(message.sid))
    //.done(); Eliminarlo, provoca un error