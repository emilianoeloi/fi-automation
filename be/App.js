import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {

	constructor(){
		super();
		this.state = {
			data: [],
			odd: true
		}
	}

	componentDidMount(){
		console.info('componentDidMount');
		$.ajax({
			url:"http://emiliano.bocamuchas.org:5000/api/1.0/stock",
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.info('componentDidMount','success', data);
				this.setState({data:data, odd:true});
			}.bind(this),
			error: function(xhr, status, err){
				console.info('componentDidMount', 'error', err);
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	render(){
		return (<StockTable data={this.state.data} />)
	}
}

class StockTable extends React.Component {
	render(){
		let rows = this.props.data.map( (stock,i) => {
			return <StockRow data={stock} key={stock._id} index={i} />
		})
		return (
			<table className="pure-table">
				<caption>
					Portfolio
				</caption>
			    <thead>
			        <tr>
			            <th>Stock</th>
			            <th>Total</th>
			            <th>Price</th>
			            <th>Var</th>
			        </tr>
			    </thead>

			    
			        {rows}
			    
			</table>
		)
	}
}	

class StockRow extends React.Component {

	render(){
		let totalMedium = this.props.data.medium * this.props.data.qtd;
		return 	<tbody>
				<tr className="pure-table-odd">
					<td>{this.props.data.code}</td>
					<td>qtd: {this.props.data.qtd}</td>
					<td>current: {this.props.data.current}</td>
					<td>{this.props.data.variation}</td>
				</tr>
				<tr className="pure-table-odd">
					<td>{this.props.data.name}</td>
					<td>
						current: {this.props.data.total}<br />
						medium: {totalMedium.toFixed(2)}<br />
						capita: {this.props.data.capitalToBuy.toFixed(2)}
					</td>
					<td>medium: {this.props.data.medium}</td>
					<td>{this.props.data.rate}%</td>
				</tr>
				<tr>
					<td colSpan="4">
						<SellTable sellList={this.props.data.sellList} />
					</td>
				</tr> 
				<tr>
					<td colSpan="4">
						<BuyTable buyList={this.props.data.buyList} />
					</td>
				</tr>
		   	</tbody>	
	}
}

class SellTable extends React.Component {
	
	render(){
		console.info(this.props.sellList);
		var total = 0;
		let sellRows = this.props.sellList.map( (sell, i) => {
			total += sell.qtdValue * sell.sellPrice
			return <SellRow data={sell} key={sell.key} index={i} />
		});
		return (
			<table>
				<caption>
					Vendas
				</caption>
				<thead>
					<th> Expiration </th>
					<th> Gain Percent </th>
					<th> Gain Value </th>
					<th> Qtd Percent </th>
					<th> Qtd Value </th>
					<th> Preço de venda </th>
					<th> Total </th>
				</thead>
				<tbody>
					{sellRows}
					<tr>
						<td colSpan="6">
						</td>
						<th>{total.toFixed(2)}</th>
					</tr>
				</tbody>
			</table>
		)
	}
}

class SellRow extends React.Component {
	render(){
		let sellRow = this.props.data; 
		let odd = (this.props.index % 2) ? "pure-table-odd": "";
		let subtotal = sellRow.qtdValue * sellRow.sellPrice; 
		return (
			<tr className={odd}>
				<td>{sellRow.expireDate}</td>
				<td>{sellRow.gainPercent}</td>
				<td>{sellRow.gainValue}</td>
				<td>{sellRow.qtdPercent}</td>
				<td>{sellRow.qtdValue}</td>
				<td>{sellRow.sellPrice}</td>
				<td>{subtotal.toFixed(2)}</td>
			</tr>
		)
	}
}

class BuyTable extends React.Component {
	
	render(){
		console.info(this.props.buyList);
		var total = 0;
		let buyRows = this.props.buyList.map( (buy, i) => {
			total += buy.qtdValue;
			return <BuyRow data={buy} key={buy.key} index={i} />
		});
		return (
			<table>
				<caption>
					Compras
				</caption>
				<thead>
					<th> Expiration </th>
					<th> Qtd Percent </th>
					<th> Qtd Value </th>
					<th> Lost Percent </th>
					<th> Lost Value </th>
					<th> Qtd Buy </th>
					<th> Buy Price </th>
					<th> Total </th>
				</thead>
				<tbody>
					{buyRows}
					<tr>
						<td colSpan="6">
						</td>
						<th>{total.toFixed(2)}</th>
					</tr>
				</tbody>
			</table>
		)
	}
}

class BuyRow extends React.Component {
	render(){
		let buyRow = this.props.data; 
		let odd = (this.props.index % 2) ? "pure-table-odd": "";
		let subtotal = buyRow.qtdValue;
		return (
			<tr className={odd}>
				<td>{buyRow.expireDate}</td>
				<td>{buyRow.qtdPercent}</td>
				<td>{buyRow.qtdValue.toFixed(2)}</td>
				<td>{buyRow.lostPercent}</td>
				<td>{buyRow.lostValue.toFixed(2)}</td>
				<td>{buyRow.qtdBuy.toFixed(0)}</td>
				<td>{buyRow.buyPrice.toFixed(2)}</td>
				<td>{subtotal.toFixed(2)}</td>
			</tr>
		)
	}
}

export default App