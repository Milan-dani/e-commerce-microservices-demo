const topics = new Map(); // { subject: [services...] }

function registerTopic(service, subject) {
  if (!topics.has(subject)) topics.set(subject, []);
  const subscribers = topics.get(subject);
  if (!subscribers.includes(service)) subscribers.push(service);
}

function getTopics() {
  return Object.fromEntries(topics);
}

module.exports = { registerTopic, getTopics };
