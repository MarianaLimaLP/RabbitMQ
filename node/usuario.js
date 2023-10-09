const amqp = require('amqplib/callback_api');
const readline = require('readline');

const cardapio = {
    '1. Porção de batata': 20.00,
    '2. Porção de calabresa': 25.00,
    '3. Coca-cola Lata': 5.00,
    '4. Coca-cola 600ml': 7.50,
    '5. Sorvete de morango': 2.50,
    '6. Sorvete de baunilha': 2.50,
    '7. Sorvete de chocolate': 2.50,
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pedidoInfo = {
    nome: '',
    contato: '',
    itens: []
};

function mostrarCardapio() {
    console.log('Aqui está nosso cardápio:');
    Object.keys(cardapio).forEach(item => {
        console.log(`${item} - R$ ${cardapio[item]}`);
    });
}

function realizarPedido() {
    rl.question('Pedido: ', (input) => {
        if (input.toLowerCase() === 'fim') {
            enviarPedido();
        } else {
            const [itemId, quantidade] = input.split(' ');
            const itemSelecionado = Object.keys(cardapio)[parseInt(itemId) - 1];
            if (itemSelecionado) {
                const preco = cardapio[itemSelecionado];
                pedidoInfo.itens.push({ item: itemSelecionado, quantidade: parseInt(quantidade), preco: preco });
                realizarPedido();
            } else {
                console.log('Item inválido. Por favor, escolha um item do cardápio.');
                mostrarCardapio();
                realizarPedido();
            }
        }
    });
}

function enviarPedido() {
    rl.question('Você gostaria de retirar (R) ou entregar (E)? ', (opcaoEntrega) => {
        if (opcaoEntrega.toUpperCase() === 'E') {
            rl.question('Por favor, insira o endereço de entrega: ', (endereco) => {
                pedidoInfo.endereco = endereco;
                amqp.connect('amqp://localhost', function (error0, connection) {
                    if (error0) {
                        throw error0;
                    }
                    connection.createChannel(function (error1, channel) {
                        if (error1) {
                            throw error1;
                        }
                        var exchange = 'logs';
                        channel.assertExchange(exchange, 'fanout', {
                            durable: false
                        });
                        channel.publish(exchange, '', Buffer.from(JSON.stringify(pedidoInfo)));
                        console.log('Pedido enviado com sucesso!');
                    });
                    setTimeout(function () {
                        connection.close();
                        process.exit(0);
                    }, 500);
                });
            });
        } else {
            pedidoInfo.endereco = 'Retirada no local';
            amqp.connect('amqp://localhost', function (error0, connection) {
                if (error0) {
                    throw error0;
                }
                connection.createChannel(function (error1, channel) {
                    if (error1) {
                        throw error1;
                    }
                    var exchange = 'logs';
                    channel.assertExchange(exchange, 'fanout', {
                        durable: false
                    });
                    channel.publish(exchange, '', Buffer.from(JSON.stringify(pedidoInfo)));
                    console.log('Pedido enviado com sucesso!');
                });
                setTimeout(function () {
                    connection.close();
                    process.exit(0);
                }, 500);
            });
        }
    });
}

console.log('Bem-vindo ao nosso restaurante!');
mostrarCardapio();
rl.question('Por favor, informe seu nome: ', (nome) => {
    pedidoInfo.nome = nome;
    rl.question('Informe seu número para contato: ', (contato) => {
        pedidoInfo.contato = contato;
        console.log('Digite o número do item que deseja (ex: 1 2 para Porção de batata x2) ou "fim" para encerrar: ');
        realizarPedido();
    });
});
