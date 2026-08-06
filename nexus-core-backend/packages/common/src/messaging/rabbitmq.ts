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