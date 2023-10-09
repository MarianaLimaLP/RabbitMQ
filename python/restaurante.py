import pika
import json

def callback(ch, method, properties, body):
    pedido = json.loads(body.decode('utf-8'))
    print(f"Pedido recebido de {pedido['nome']} ({pedido['contato']}):")
    for item in pedido['itens']:
        print(f"{item['quantidade']}x {item['item']} - R$ {item['preco']:.2f}")
    print(f"Total: R$ {sum([item['quantidade'] * item['preco'] for item in pedido['itens']]):.2f}")
    print(f"Endereço de entrega: {pedido['endereco']}")
    print("\n---\n")

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.exchange_declare(exchange='logs', exchange_type='fanout')
    result = channel.queue_declare(queue='', exclusive=True)
    pedidos = result.method.queue

    channel.queue_bind(exchange='logs', queue=pedidos)

    print('[*] Aguardando pedidos. Para sair, pressione CTRL+C')
    channel.basic_consume(queue=pedidos, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()

if __name__ == '__main__':
    main()
