FROM node:12.7.0-alpine as base
WORKDIR /application
# RUN npm set progress=false && npm config set depth 0
COPY package.json .

FROM base AS test_dependencies
COPY . .eslintrc.js ./
RUN \
 npm install &&\
 npm run test

FROM base AS dependencies
COPY application .
RUN npm install --only=production
EXPOSE 53
CMD ["server"]
