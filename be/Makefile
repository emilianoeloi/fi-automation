.PHONY: setup run test karma show-coverage

BIN=./node_modules/.bin


setup:
	@npm install -g babel webpack webpack-dev-server mocha
	@npm install

run:
	@$(BIN)/webpack-dev-server

test:
	@rm -rf coverage
	@babel-node $(BIN)/isparta cover _mocha --report html --report text

karma:
	@$(BIN)/karma start

show-coverage:
	@open coverage/index.html
