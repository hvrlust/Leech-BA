#FROM node:8.11.4
FROM node:10.15.0

# Create app directory
WORKDIR /usr/src

# copy backend
COPY ./backend/package*.json ./backend/

# copy frontend
COPY ./webapp/package*.json ./webapp/

WORKDIR /usr/src/backend
RUN npm install --only=production
# fix sqlite3 for all platforms https://stackoverflow.com/questions/45192449/cross-platform-install-of-npm-package-sqlite3
#RUN ./node_modules/.bin/node-pre-gyp install --directory=./node_modules/sqlite3 --target_platform=linux --target_arch=x64 --target=8.11.4
#RUN ./node_modules/.bin/node-pre-gyp install --directory=./node_modules/sqlite3 --target_platform=darwin --target_arch=x64 --target=8.11.4
#RUN ./node_modules/.bin/node-pre-gyp install --directory=./node_modules/sqlite3 --target_platform=win32 --target_arch=ia32 --target=8.11.4
RUN ./node_modules/.bin/node-pre-gyp install --directory=./node_modules/sqlite3 --target_platform=linux --target_arch=x64 --target=10.15.0
RUN ./node_modules/.bin/node-pre-gyp install --directory=./node_modules/sqlite3 --target_platform=darwin --target_arch=x64 --target=10.15.0
RUN ./node_modules/.bin/node-pre-gyp install --directory=./node_modules/sqlite3 --target_platform=win32 --target_arch=ia32 --target=10.15.0

WORKDIR /usr/src/webapp
RUN npm i typescript@3.1.6 --save-dev --save-exact && npm install
COPY ./webapp ./
RUN npm run ng config cli.warnings.typescriptMismatch false
RUN npm rebuild node-sass
RUN npm run-script build

WORKDIR /usr/src/backend
COPY ./backend ./

EXPOSE 80
EXPOSE 443

CMD [ "npm", "start" ]