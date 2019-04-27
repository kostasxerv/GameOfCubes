const readline = require('readline');
const {red, green, blue} = require('chalk');

class Node{
	constructor(isMax, depth, cubeRemoves, remaining){
		this.isMax = isMax
		this.cubeRemoves = cubeRemoves
		this.depth = depth
		this.remaining = remaining
		this.children = []
	}


	evaluate(){
		if(this.children.length > 0){ // no children means the node is leaf
			this.children.forEach(c => c.evaluate())
			if(this.isMax){
				this.value = Math.max(...this.children.map(c => c.value))
			}else{
				this.value = Math.min(...this.children.map(c => c.value))
			}
		}else {
			if(this.remaining === 0){
				this.value = m * 2 - this.depth
			}else if(cubeRemoves.includes(this.remaining)){
				this.value = - m * 2 - this.depth
			}else {
				this.value = m * 2 - this.depth - this.remaining
			}
			if(this.isMax){
				this.value *= -1
			}
		}
	}

	createChildren(){
		this.children = []
		cubeRemoves.forEach(m => {
			if(this.depth > 10 || this.remaining - m < 0) return
			const child = new Node(!this.isMax, this.depth + 1, m, this.remaining - m)
			this.children.push(child)
		})

		this.children.forEach(c => {
			c.createChildren()
		})
	}
}

class Root extends Node{
	constructor(...props){
		super(...props)
	}

	evaluate(){
		this.children.forEach(c => {
			c.evaluate()
		})
		this.value = this.children.find(c => c.value == Math.max(...this.children.map(c => c.value))).cubeRemoves
	}
}

class Tree{
	constructor(){
		this.root = new Root(true, 0, 0, m)
	}

	calculate(remaining){
		this.root.remaining = remaining
		this.root.createChildren()
		this.root.evaluate()
		return this.root.value
	}

}


class MiniMax{
	constructor(){
		this.tree = new Tree()
	}

	getBestMove(remaining){
		return this.tree.calculate(remaining)
	}
}


class Game{
	constructor(m, k, firstTurnPC){
		this.m = m
		this.k = k
		this.remaining = m

		this.alg = new MiniMax()

		this.pcTurn = firstTurnPC

	}

	nextTurn(){
		if(this.remaining == 0) {
			return
		}
		let cubesToRemove
		if(this.pcTurn){
			cubesToRemove = this.alg.getBestMove(this.remaining)
			console.log(red(cubesToRemove, 'removed by PC'))
			this.remove(Math.abs(cubesToRemove))
			this.nextTurn()
		} else {
			this.getInput();
		}
	}


	remove(cubesToRemove){
		this.remaining -= cubesToRemove

		this.checkStatus()
	}

	checkStatus(){
		if(this.remaining !== 0) {
			console.log(blue('Cubes remaining', this.remaining))
			this.pcTurn = !this.pcTurn
			return
		}

		if(this.pcTurn){
			console.log(green('PC WINS'))
		}else {
			console.log(('HUMAN WINS'))
		}

		this.endGame()
	}
	endGame(){
		process.exit()
	}

	getInput(){
		rl.question('How many to remove? ', (answer) => {
			answer = parseInt(answer)
			console.log(green(`${answer} Cubes removed from game!`));
			if(answer > this.remaining || !cubeRemoves.includes(answer)){
				console.log('please enter valid value')
				this.getInput()
				return
			}
			this.remove(parseInt(answer))
			this.nextTurn()
		});
	}

	start(){
		this.nextTurn()
	}
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let m, k
let cubeRemoves = []

async function getInputNumber(msg){
	let input = parseInt(await new Promise(resolve => rl.question(msg, (answer) => resolve(answer))))
	if(isNaN(input)){
		return getNumberOfCubes()
	}
	return input
}

async function main(){
	console.log('Welcome to Game of Cubes!!!')
	m = await getInputNumber('How many cubes in game: ')
	k = await getInputNumber('How many cubes allowed to remove in game: ')
	playFirst = await new Promise(resolve => rl.question('Who plays first (1 for PC, 2 for Human): ', (answer) => resolve(answer)))
	let firstTurnPC = true
	if(playFirst == 2){
		firstTurnPC = false
	}
	cubeRemoves = [1, 2, k]
	new Game(m, k, firstTurnPC).start()
}

main()