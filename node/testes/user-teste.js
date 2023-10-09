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
            1: { nome: 'batata', preco: 20.00 },
            2: { nome: 'calabresa', preco: 25.00 },
            3: { nome: 'coca-cola', preco: 5.00 },
            4: { nome: 'sorvete', preco: 2.50 }
        };

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Digite o seu nome: ', (nome) => {
            rl.question('Digite o seu contato: ', (contato) => {
                console.log(`Olá, ${nome}!`);
                console.log('Cardápio:');
                Object.keys(cardapio).forEach(id => {
                    const item = cardapio[id];
                    console.log(`${id}: ${item.nome} - R$${item.preco.toFixed(2)}`);
                });

                let pedidoItens = {};

                function fazerPedido() {
                    rl.question('Digite o ID do item e a quantidade (ex: 1 2): ', (input) => {
                        if (input.toLowerCase() === 'sair') {
                            const pedido = {
                                nome: nome,
                                contato: contato,
                                itens: pedidoItens
                            };

                            // Formate a mensagem para ser facilmente processada pelo Python
                            const formattedPedido = `${nome} (${contato}): ${Object.keys(pedidoItens).map(id => `${pedidoItens[id]} ${cardapio[id].nome}`).join(', ')}.`;

                            channel.sendToQueue('pedidos', Buffer.from(formattedPedido), { persistent: true });

                            console.log('Pedido enviado:');
                            console.log(formattedPedido);
                            rl.close();
                            connection.close();
                            process.exit(0);
                        } else {
                            const [id, quantidade] = input.split(' ');
                            const menuItem = cardapio[parseInt(id)];
                            if (menuItem) {
                                pedidoItens[id] = parseInt(quantidade);
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
