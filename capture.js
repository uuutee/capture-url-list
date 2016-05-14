// phantomjsでPromiseが使えないので
require('es6-promise').polyfill();

var fs = require('fs');
var json = JSON.parse(fs.read('urls.json'));

// 予め処理するすべてのPromiseの配列を作成（この時点で処理は実行される）
var actions = json.urls.map(function(value, index) {
	return capturePage(value.domain, value.filename)
		.then(function(message) {
			console.log(message);
		})
		.catch(function(message) {
			console.log(message);
		});	
});

// Promise.allですべての実行結果を取得する
Promise.all(actions).then(function(value) {
	console.log('all things done.');
	phantom.exit();
});


// 指定したURLをキャプチャする
function capturePage(url, filename) {
	return new Promise(function(resolve, reject) {
		var page = require('webpage').create();
		page.viewportSize = {
			width: 1280,
			height: 800 // heightは必須
		};

		page.open(url, function(status) {
			if (status === 'success') {
				page.render('png/' + filename + '.png');
				resolve(url + ': ' + status);
			}
			else {
				reject(url + ': ' + status);
			}
		});
	});
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
