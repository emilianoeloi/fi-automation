# Folha Invest Automation

## startup

`npm install`

`make server-run`

`make backend-run`

## Portfolio (Carteira)

Lista de status: 

	- started - Primeiro status, significa que o portfolio foi cadastrado e nenhuma ordem de venda ou compra foi realizada.

 	- selling - Nesse estado o processo de venda está sendo realizado, ou seja, ordens de venda estão sendo cadastradas.

 	- shopping - Nesse ordens de compras estão sendo cadastradas.

 	- waiting - Nesse, em teoria todas as ordens já foram cadastradas.

## Automatização do Processo de venda de ações

Para a venda a regra é a seguinte.
	
- Uma ordem semanal que vende 25% das ações com 10% de ganho.

- Uma ordem semanal que vende outros 25% das ações com 20% de ganho.
	
- Uma última ordem que vende os 50% das ações com 30% de ganho.

## Automatização do Processo de compra de ações

Para a compra, a regra inicialmente pensada seria dividir o tatal de capital pelo número de papeis e daí sairia o valor que cada papel teria de cota para a compra. Desse valor segue a regra:

- Uma ordem diária que compre acões que correspondem a 25% da cota disponível para compra

## Links
Bm&fBovespahttp://www.bmfbovespa.com.br/home.aspx?idioma=pt-br

Simulador Folha Invest: http://folhainvest.folha.uol.com.br/

Tampermonkey: http://tampermonkey.net/
