import pika

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

# Fila para os pedidos
channel.queue_declare(queue='pedidos', durable=True)
channel.exchange_declare(exchange='cardapio', exchange_type='fanout')

# Vincular a fila 'pedidos' ao exchange 'cardapio'
channel.queue_bind(exchange='cardapio', queue='pedidos')

# Cardápio com itens e preços
cardapio = {
    1: {'nome': 'batata', 'preco': 20.00},
    2: {'nome': 'calabresa', 'preco': 25.00},
    3: {'nome': 'coca-cola', 'preco': 5.00},
    4: {'nome': 'sorvete', 'preco': 2.50}
}

def callback(ch, method, properties, body):
    print("Pedido Recebido:", body.decode())
    ch.basic_ack(delivery_tag=method.delivery_tag)

# Configurar o consumo para a fila de pedidos
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='pedidos', on_message_callback=callback)

print('Esperando pedidos. Para fechar, pressione CTRL e C')
channel.start_consuming()
