const jpv = require('jpv');
const extractDomain = require('extract-domain');
// const maxmind = require('maxmind');
// var geoip = require('geoip-country');
const geoip = require('geoip-lite');
const http=require('http');

const kafka = require('kafka-node');
const config = require('./config');

const request = {
        hostname: 'localhost',
        port: 8125,
        path: '/upload',
        method: 'POST'
};

const pattern = {
    'timestamp'     : '(number)',
    'user_id'       : '(string)',
    'session_id'    : '(string)',
    'action'        : '(string)',
    'params'        : {
                        'param1': '(string)',
                        'param2': '(string)'
                      },
    'url'           : '[url]'
};

http.createServer(function(request, response)
{

    response.writeHeader(200, {"Content-Type": "application/json"});

    request.on('data', function (chunk)
    {
        var json_request = chunk.toString('utf8')
        json_request = JSON.parse(json_request)
 
        if (jpv.validate(json_request, pattern)){

            json_request['domain'] = extractDomain(json_request['url'])
            // var ip = request.headers['x-forwarded-for'] || 
            //          request.connection.remoteAddress || 
            //          request.socket.remoteAddress ||
            //          request.connection.socket.remoteAddress;
 
            var ip = "207.97.227.239";
            // var ip = "192.168.0.103"
            var geo = geoip.lookup(ip);

            json_request['country'] = geo.country

            const Producer = kafka.Producer;
            const Client = kafka.KafkaClient;
			const client = new Client(config.kafka_server);
			const producer = new Producer(client);

			let payloads = [
				{
				topic: config.kafka_topic,
				messages: json_request.toString('utf8'),
				partition: 0
				}
			];

			producer.on('ready', async function() {
			  let push_status = producer.send(payloads, (err, data) => {
			    if (err) {
			      console.log('[kafka-producer -> '+config.kafka_topic+']: broker update failed');
			    } else {
			      console.log('[kafka-producer -> '+config.kafka_topic+']: broker update success');
			    }
			  });
			});
			
			producer.on('error', function(err) {
			  console.log(err);
			  console.log('[kafka-producer -> '+kafka_topic+']: connection errored');
			  throw err;
			});		

            console.log(json_request)
        }
        else{
            console.log('bad json request')
        }

    });

    response.end();
   
}).listen(8125);