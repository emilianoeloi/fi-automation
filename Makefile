help:
	@echo "Available Targets:"
	@cat Makefile | egrep '^(\w+?):' | sed 's/:\(.*\)//g' | sed 's/^/- /g'
deploy:
	@rsync -arvuz . root@emiliano.bocamuchas.org:/var/nodejs/fi_automation
server_run:
	@node server.js
backend_run:
	@cd be; npm start
db_start:
	@mongod	
