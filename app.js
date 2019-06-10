const jpv = require('jpv');
const extractDomain = require('extract-domain');
// const maxmind = require('maxmind');
// var geoip = require('geoip-country');
var geoip = require('geoip-lite');
var http=require('http');

// var kafka = require('kafka-node'),
// 	Client = kafka.KafkaClient,
// 	Producer = kafka.Producer,
// 	client = new Client('kafka:2181'),
// 	producer = new Producer(client);

var request = {
        hostname: 'localhost',
        port: 8125,
        path: '/upload',
        method: 'POST'
};

var pattern = {
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

            var kafka = require('kafka-node'),
				Client = kafka.KafkaClient,
				Producer = kafka.Producer,
				client = new Client('kafka:2181'),
				producer = new Producer(client);

            payloads = [
                { topic: 'bigDataProjectTopic', messages: json_request.toString('utf8'), partition: 0 },
            ];

            producer.on('ready', function(){
                producer.send(payloads, function(err, data){
                        console.log(data)
                });
            });

            console.log(json_request)
        }
        else{
            console.log('bad json request')
        }

        producer.on('error', function(err){})

    });

    response.end();
   
}).listen(8125);