deploy:
	@rsync -arvuz . root@emiliano.bocamuchas.org:/var/nodejs/fi_automation
	@rsync -arvuz ./cdn/* root@emiliano.bocamuchas.org:/var/www/fxos/cdn/fi_automation
