// vars
var fs      = require('fs'),
	csv     = fs.read('urls.csv'),
	urls    = [],
	actions = [];

// phantomjsでPromiseが使えないので
require('es6-promise').polyfill();

// url配列を作成
csv = csv.replace( /\r\n/g , '\n' );
urls = makeCSVArray(csv);

// 予め処理するcapture関数の配列を作成
actions = urls.map(function(value, index) {
	var domain = value[3],
		url = 'http://www.' + value[3],
		filename = value[0] + '_' + value[3];

	return capturePage(url, filename);
});

// 配列の最後に終了関数を追加
actions.push(function() {phantom.exit();});

// capture関数の配列を順次実行していく
actions.reduce(
	function(prev, curr, index, array) {
		return prev.then(curr);
	}, 
	Promise.resolve() // 初期値。resolveしてから順次実行する
);

// 指定したURLをキャプチャする
function capturePage(url, filename) {
	// Promiseを返すとそのまま実行されるので、関数を返す
	return function () {
		return new Promise(function(resolve, reject) {
			var page = require('webpage').create();
			page.viewportSize = {
				width: 1280,
				height: 800 // heightは必須
			};

			page.open(url, function(status) {
				if (status === 'success') {
					page.render('png/' + filename + '.png');
					console.log(status + ': ' + url);
					page.close();
					resolve();
				}
				else {
					console.log(status + ': ' + url);
					page.close();
					resolve(); // errorでもresolveする
					// reject();
				}
			});
		});
	};
}

// csvファイルを配列化
function makeCSVArray(buf){
	var csvData = [],
		lines   = buf.split('\n'),
		i       = 0,
		cells   = [];

	for(i = 0; i < lines.length; i++){
		cells = lines[i].replace(/"/g, '').split(',');
		if (cells.length != 1){
			csvData.push(cells);
		}
	}
	return csvData;
}

// 値をdumpする
function vardump(arr,lv,key) {
	var dumptxt = "",
		lv_idt = "",
		type = Object.prototype.toString.call(arr).slice(8, -1);
	if(!lv) lv = 0;
	for(var i=0;i<lv;i++) lv_idt += "    ";
	if(key) dumptxt += lv_idt + "[" + key + "] => ";
	
	if(arr === null || arr === undefined){
		dumptxt += arr + '\n';
	} else if(type == "Array" || type == "Object"){
		dumptxt += type + "...{\n";
		for(var item in arr) dumptxt += vardump(arr[item],lv+1,item);
		dumptxt += lv_idt + "}\n";
	} else if(type == "String"){
		dumptxt += '"' + arr + '" ('+ type +')\n';
	}  else if(type == "Number"){
		dumptxt += arr + " (" + type + ")\n";
	} else {
		dumptxt += arr + " (" + type + ")\n";
	}
	return dumptxt;
}
