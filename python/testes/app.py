
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
    'batata': 20.00,
    'calabresa': 25.00,
    'coca-cola': 5.00,
    'sorvete': 2.50
}
def callback(ch, method, properties, body):
    print("aqui")
    # Analisar a mensagem como uma string simples
    pedido_info = body.decode()
    print("aqui2")
    # A mensagem é formatada como "Nome (Contato) pediu X Produto."
    nome, contato, pedido = pedido_info.split(' ', 2)
    itens_pedido = [pedido.strip('.')]
    total = sum(cardapio[item.split()[1]] * int(item.split()[0]) for item in itens_pedido)
    print(f"Pedido Recebido de {nome} ({contato}):")
    print('\n'.join(itens_pedido))
    print(f"Total: R${total:.2f}")

    ch.basic_ack(delivery_tag=method.delivery_tag)

# Configurar o consumo para a fila de pedidos
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='pedidos', on_message_callback=callback)

print('Esperando pedidos. Para fechar, pressione CTRL e C')
channel.start_consuming()
