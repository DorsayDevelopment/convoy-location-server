docker kill convoy-location
docker rm convoy-location

docker run -d \
  --name convoy-location \
  -e RABBITMQ_HOST=rabbitmq \
  -e RABBITMQ_PORT=5672 \
  -p 3000:3000/udp \
  --link rabbitmq \
  convoy-location

docker logs convoy-location