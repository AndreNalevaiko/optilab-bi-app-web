FROM node:4.5

MAINTAINER Andre Nalevaiko <andre@gorillascode.com>

ADD . /optilab-bi-app-web
WORKDIR /optilab-bi-app-web

ENV NODE_ENV=production

RUN npm -g install grunt-cli bower http-server
RUN npm install
RUN bower install --allow-root
RUN grunt prod
RUN find . -maxdepth 1 ! -path . ! -name bin -exec rm -rf {} +

EXPOSE 8080

CMD ["http-server", "./bin", "-d", "false", "-s"]