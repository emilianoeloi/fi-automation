deploy:
	@rsync -arvuz . root@emiliano.bocamuchas.org:/var/nodejs/fi_automation
server-run:
	@node server.js
backend-run:
	@cd be; npm start
db-start:
	@mongod	
