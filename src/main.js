const { app, BrowserWindow, BrowserView, ipcMain } = require('electron')

const { autoUpdater } = require('electron-updater')


const path = require('path')

const pjson = require(path.join(__dirname, '..', 'package.json'))


console.log(pjson.isBuildNow)
if (! pjson.isBuildNow) {

	require('electron-reload')(__dirname, {
			electron: require(`${__dirname}/../node_modules/electron`)
	});

}
const url = 'http://eaglehouse.site/update/App_Browser';
autoUpdater.setFeedURL(url);


let win = null, view = [], currentIdx = 0
console.log(__dirname)

var url_browser = 'https://google.com/'

var obj = [];
obj[0] = {idx: 0, url: url_browser}

var interval_server = setInterval(() => {
	if (win.webContents) {
		win.webContents.send('log', 'checkForUpdates()')
	}
	autoUpdater.checkForUpdates();
}, 1000 * 10)


function createWindow() {
	win = new BrowserWindow({
		width: 1400,
		height: 750,
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		}
	})
	win.loadFile(path.join(__dirname, 'index.html'))
	win.webContents.send('current_version', pjson.version)

}

async function whenReadScreen() {
	const response = await app.whenReady();
	createWindow();
	currentIdx = 0;
	
	view[0] = new BrowserView()
	win.setBrowserView(view[0])
	view[0].setBounds({ x: 0, y: 100, width: 1400, height: 750 })
	view[0].webContents.loadURL(url_browser)


	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length == 0) createWindow();
	})

	ipcMain.on('input_blur', (event, arg) => {
		if (arg.idx < 0) arg.idx = 0
		url = arg.url;
		console.log('input_blur', arg, currentIdx, view, event)



		view[currentIdx].setBounds({ x: 0, y: 0, width: 0, height: 0})
		view[arg.idx].setBounds({ x: 0, y: 100, width: 1400, height: 750 })
		view[arg.idx].webContents.loadURL(url_browser)
		currentIdx = arg.idx
		obj[arg.idx] = {idx: arg.idx, url: url_browser} 
	})
	ipcMain.on('new_aba', (event, arg) => {
		console.log('new_aba', arg)
		obj[arg.idx] = {idx: arg.idx, url: arg.url}
		view[arg.idx] = new BrowserView()
		
		view[currentIdx].setBounds({ x: 0, y: 0, width: 0, height: 0})

		win.setBrowserView(view[arg.idx])
		view[arg.idx].setBounds({ x: 0, y: 100, width: 1400, height: 750 })
		view[arg.idx].webContents.loadURL(arg.url)
		win.webContents.send('change_url', arg.url)
		currentIdx = arg.idx
	})
	ipcMain.on('click_aba', (event, arg) => {
		
		console.log('click_aba', arg)	

		view[currentIdx].setBounds({ x: 0, y: 0, width: 0, height: 0})

		win.setBrowserView(view[arg])
		view[arg].setBounds({ x: 0, y: 100, width: 1400, height: 750 })
		win.webContents.send('change_url', obj[arg].url)
		currentIdx = arg;
	})

}
whenReadScreen();
onUpdater();



function onUpdater() { 

	autoUpdater.on('download-progres', (obj) => {
		win.webContents.send('log', 'download-progress')
		clearInterval(interval_server)
		win.webContents.send('update-available', `Estamos baixando uma nova att: ${obj.percent.toFixed(2)}`) 

	})
	autoUpdater.on('update-available', () => {
		win.webContents.send('log', 'update-available')

		win.webContents.send('update-available', `Foi encontrado uma nova atualizacao`) 
	})
	autoUpdater.on('update-downloaded', () => {
		win.webContents.send('log', 'update-downloaded')
		clearInterval(interval_server)
		win.webContents.send('update-available', `Download concluido. Reinstale o aplicativo`) 

	})

	autoUpdater.on('error', err => {
		clearInterval(interval_server)
		win.webContents.send('log', err) 
	})
}



app.on('window-all-closed', () => {
	if (process.platform != 'darwin') app.quit();
})
