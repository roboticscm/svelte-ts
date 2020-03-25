

#! /bin/bash
docker run -d -p 9999:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgres://skyplus:skyplus@172.17.0.3:5432/skyplus \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  --name hasura9999 --rm \
  hasura/graphql-engine:latest