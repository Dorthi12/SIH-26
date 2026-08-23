import { Kafka } from "kafkajs";

const kafkaBrokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",").map((b) => b.trim())
  : ["localhost:9092"];

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "vortex-backend",
  brokers: kafkaBrokers,
});

export const producer = kafka.producer();
