const { ipcRenderer } = require('electron')

var idx = 0;
var storeUrl = [];

window.addEventListener('DOMContentLoaded', () => {

	var inputUrl = document.getElementsByClassName('inp_url')[0];
	var header 	 = document.getElementsByClassName('header')[0];
	document.querySelector('.isActive .aba').textContent = 'Google'


	inputUrl.addEventListener('blur', (event) => {
		console.log('render process event', event)

		var isActive = document.getElementsByClassName('isActive')[0];
		var aba = document.getElementsByClassName('line');
		var idx = Array.from(aba).indexOf(isActive)
		console.log(idx)

		var auxinputUrl = document.getElementsByClassName('inp_url')[0];
		var obj = {
			idx: idx,
			url: auxinputUrl.value
		}
		var pageName = obj.url.match(/(?<=\/\/).*(?=.com)/gi)[0].replace('www.', '')
		document.querySelector('.isActive .aba').textContent = pageName 


		ipcRenderer.send('input_blur', obj)

	});

	delegate(document, 'click', '.aba_plus', (element) => {
		
		var indice = Array.from(document.getElementsByClassName('line')).indexOf(element.srcElement.parentNode)

		var divs = document.querySelectorAll('div')
		divs.forEach(div => {
			div.classList.remove('isActive')
		})
		var html = `<div class='line isActive'>
				<div class='aba'> Google </div>
				<span class='aba_plus'> + </span>
			</div>`

		var div = document.createElement('div');
		div.innerHTML = html;

		document.querySelector('span.aba_plus').remove()

		header.appendChild(div.firstChild)
		
		
		var obj = {
			idx: parseInt(indice)+ 1,
			url: 'https://google.com.br' 
		}

		ipcRenderer.send('new_aba', obj)

	})
	delegate(document, 'click', '.aba', (element) => {
		// aqui sera o click na aba, ao fazer isso, devera ir para aba ja aberta anteriormente
		// aqui preciso encontrar o line associado a aba clicada
		console.log('click aba', element)

		var divs = document.querySelectorAll('div')
		divs.forEach(div => {
			div.classList.remove('isActive')
		})
		//this.parentNode.classList.add('isActive')
		element.srcElement.parentNode.classList.add('isActive')
		var indice = Array.from(document.getElementsByClassName('line')).indexOf(element.srcElement.parentNode)

		// aqui preciso enviar o indice e renderizar uma view
		ipcRenderer.send('click_aba', indice)

	})
	ipcRenderer.on('change_url', (event, arg) => {
		inputUrl.value = arg;
	})
	ipcRenderer.on('update-available', (event, arg) => {
		console.log(arg)
	})
	ipcRenderer.on('current_version', (event, arg) => {
		console.log('Versao atual = ' + arg)
	})
	ipcRenderer.on('log', (event, arg) => {
		console.log('log = ' + arg)
	})

})
function delegate(el, evt, sel, handler) {
	el.addEventListener(evt, function(event, i) {
		var t = event.target;
		while (t && t !== this) {
			if (t.matches(sel)) {
				handler.call(t, event);
			}
			t = t.parentNode;
		}
	});
}
