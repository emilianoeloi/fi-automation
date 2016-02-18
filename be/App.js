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
		console.log(this.props.index);
		let odd = (this.props.index % 2) ? "pure-table-odd": "";
		return 	<tbody>
				<tr className={odd}>
					<td>{this.props.data.code}</td>
					<td>qtd: {this.props.data.qtd}</td>
					<td>current: {this.props.data.current}</td>
					<td>{this.props.data.variation}</td>
				</tr>
				<tr className={odd}>
					<td>{this.props.data.name}</td>
					<td>total: {this.props.data.total}</td>
					<td>medium: {this.props.data.medium}</td>
					<td>{this.props.data.rate}%</td>
				</tr>
		   	</tbody>	
	}

}

export default App