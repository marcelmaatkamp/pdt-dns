var dns = require('native-dns');
var amqp = require("amqp-ts");

var rabbitmq_url = process.env.AMQP_URL || "amqp://rabbitmq"
var connection = new amqp.Connection(rabbitmq_url);
var exchange = connection.declareExchange("dns",  'fanout', {durable: true});
var ip_address =  process.env.IP_ADDRESS || '127.0.0.1';
connection.completeConfiguration().then(() => {
  console.log("succesfull connected at " +rabbitmq_url)

  server = dns.createServer()
  server.on('request', function (request, response) {
    console.log("["+request.address.address+"] class["+request.question[0].class+"] type["+request.question[0].type+"] "+request.question[0].name)
    var message = new amqp.Message({
      date: { $date : new Date()}, 
      header: request.header,
      question: request.question,
      answer: request.answer,
      authority: request.authority,
      additional: request.additional,
      edns_options: request.edns_options,
      payload: request.payload,
      edns: request.edns,
      edns_version: request.edns_version,
      address: request.address
    });
    exchange.send(message);
    response.answer.push(dns.A({
      name: request.question[0].name,
      address: p_address,
      ttl: 60,
    }))
    response.send()
  })
  server.on('error', function (err, buff, req, res) {
    console.log(err.stack)
  })

  var dns_port = process.env.DNS_PORT||53
  console.log("Starting on port " +dns_port)
  server.serve(dns_port)

});
