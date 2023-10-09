#!/usr/bin/env python
import sys
import pika
import json  # Importe o módulo json aqui

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='logs', exchange_type='fanout')

# Obtém os detalhes da corrida dos argumentos de linha de comando
origem = sys.argv[1] if len(sys.argv) > 1 else "Origem Padrão"
destino = sys.argv[2] if len(sys.argv) > 2 else "Destino Padrão"
passageiro = sys.argv[3] if len(sys.argv) > 3 else "Passageiro Padrão"

# Cria um dicionário com os detalhes da corrida
corrida = {
    "origem": origem,
    "destino": destino,
    "passageiro": passageiro
}

# Converte o dicionário em uma string JSON
mensagem = json.dumps(corrida)

# Publica a mensagem no exchange 'logs'
channel.basic_publish(exchange='logs', routing_key='', body=mensagem)

print(f" [x] Sent {mensagem}")
connection.close()
