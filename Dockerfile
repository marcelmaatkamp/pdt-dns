FROM alpine:3.5 AS base
RUN apk add --no-cache nodejs-current tini
WORKDIR /application
ENTRYPOINT ["/sbin/tini", "--"]
COPY package.json .

FROM base AS dependencies
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
RUN cp -R node_modules prod_node_modules
RUN npm install

FROM dependencies AS test
COPY . .
RUN \
 npm run lint &&\
 npm run setup &&\
 npm run test

FROM base AS release
COPY --from=dependencies /application/prod_node_modules ./node_modules
COPY . .
EXPOSE 53
CMD npm run start
