import { Kafka } from "kafkajs";

const kafkaBrokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",").map((b) => b.trim())
  : ["localhost:9092"];

const useSSL = process.env.KAFKA_USE_SSL === "true";
const saslUsername = process.env.KAFKA_SASL_USERNAME;
const saslPassword = process.env.KAFKA_SASL_PASSWORD;

const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || "vortex-backend",
  brokers: kafkaBrokers,
};

if (useSSL) {
  kafkaConfig.ssl = true;
}

if (saslUsername && saslPassword) {
  kafkaConfig.sasl = {
    mechanism: "scram-sha-512",
    username: saslUsername,
    password: saslPassword,
  };
}

export const kafka = new Kafka(kafkaConfig);

export const producer = kafka.producer();
