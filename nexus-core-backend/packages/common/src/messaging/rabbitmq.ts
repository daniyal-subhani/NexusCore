import amqp, {type ChannelModel, type Channel} from 'amqplib';
import type { Logger } from 'pino';

let connection: ChannelModel | undefined;
let channel: Channel | undefined;

export const EVENTS_EXCHANGE = "nexus.events";

export async function connectRabbitMQ(url: string, logger: Logger): Promise<Channel> {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel?.assertExchange(EVENTS_EXCHANGE, 'topic', {durable: true})

    connection.on("error", (err)=> logger.error({err}, "RabbitMQ connection error"))
    connection.on("close", ()=> logger.warn("RabbitMQ connection closed"))

    logger.info("Connected to RabbitMQ")
    return channel;
}

export async function publishEvent<T>(routingKey: string, payload: T):Promise<void> {
    if(!channel) throw new Error("RabbitMQ channel not initialized - call connectRabbitMQ first")
    
    const message = Buffer.from(JSON.stringify(payload));
    channel.publish(EVENTS_EXCHANGE, routingKey, message, {
        persistent: true,  // message disk pe survive kare ager RabbitMQ restart hoo
        contentType: "applocation/json"
    })
}

export async function disconnectRabbitMQ(): Promise<void> {
    await channel?.close();
    await connection?.close();
}


// packages/common/src/messaging/rabbitmq.ts mein add karo:

export async function consumeEvents(
  queueName: string,
  routingKeys: string[],
  onMessage: (payload: unknown) => Promise<void>,
  logger: Logger,
): Promise<void> {
  if (!channel) throw new Error('RabbitMQ channel not initialized');

  await channel.assertQueue(queueName, { durable: true });

  for (const key of routingKeys) {
    await channel.bindQueue(queueName, EVENTS_EXCHANGE, key);
  }

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await onMessage(payload);
      channel!.ack(msg);   // successfully processed — RabbitMQ ko batao message hata do
    } catch (err) {
      logger.error({ err }, 'Failed to process message, nack-ing');
      channel!.nack(msg, false, false);   // process nahi kar paye — dead-letter (abhi simple: discard)
    }
  });

  logger.info({ queueName, routingKeys }, 'Consumer listening');
}