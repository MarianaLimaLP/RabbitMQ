#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = 'corridas';
    var exchange = 'corridas_exchange';

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    });

    channel.assertQueue(queue, {
      durable: true
    });

    // Bind the queue to the exchange
    channel.bindQueue(queue, exchange, '');

    console.log("Esperando corridas, para fechar aperta CTRL e C");

    channel.consume(queue, function(msg) {
      if (msg.content) {
        var corrida = JSON.parse(msg.content.toString());
        console.log("Corrida Recebida: %s", JSON.stringify(corrida));
        
        // Processa a corrida (por exemplo, enviar para um motorista)

        channel.ack(msg); // Confirma o processamento da corrida
      }
    }, {
      // manual acknowledgment mode,
      // see ../confirms.html for details
      noAck: false
    });
  });
});
