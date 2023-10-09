const amqp = require('amqplib/callback_api');
const readline = require('readline');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }

    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        const cardapio = {
            'batata': 20.00,
            'calabresa': 25.00,
            'coca-cola': 5.00,
            'sorvete': 2.50
        };

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Digite o seu nome: ', (nome) => {
            rl.question('Digite o seu contato: ', (contato) => {
                console.log(`Olá, ${nome}!`);
                console.log('Para fazer seu pedido, digite o número do item seguido pela quantidade desejada.');
                console.log('Por exemplo, para pedir 2 Coca-Cola, digite "3 2".');
                console.log('Digite "sair" quando terminar.');

                let pedidoItens = {};
                
                function fazerPedido() {
                    rl.question('Pedido: ', (input) => {
                        if (input.toLowerCase() === 'sair') {
                            const pedido = {
                                nome: nome,
                                contato: contato,
                                itens: pedidoItens
                            };

                            // Formate a mensagem para ser facilmente processada pelo Python
                            const formattedPedido = `${nome} (${contato}): ${Object.keys(pedidoItens).map(item => `${pedidoItens[item]} ${item}`).join(', ')}`;

                            channel.sendToQueue('pedidos', Buffer.from(formattedPedido), { persistent: true });

                            console.log('Pedido enviado:');
                            console.log(formattedPedido);
                            rl.close();
                            connection.close();
                            process.exit(0);
                        } else {
                            const [quantidade, item] = input.split(' ');
                            if (cardapio[item]) {
                                pedidoItens[item] = parseInt(quantidade);
                                fazerPedido();
                            } else {
                                console.log('Item inválido. Por favor, escolha um item do cardápio.');
                                fazerPedido();
                            }
                        }
                    });
                }

                fazerPedido();
            });
        });
    });
});
