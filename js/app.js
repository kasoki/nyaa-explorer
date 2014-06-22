// Copyright (c) 2014 Christopher Kaster
//
// This file is part of nyaa-explorer <https://github.com/kasoki/nyaa-explorer>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
var gui = require("nw.gui");
var http = require("http");
var fs = require("fs");
var path = require("path");

var search_options = {
	base_url: URL_NYAA,
	query: undefined
};

$("#search-field").keydown(function(e) {
	if(e.keyCode == 13) {
		e.preventDefault();
		$("#search-btn").click();
		return true;
	}
});

$("#search-btn").click(function() {
	var raw_tags = $("#search-field").val();
	
	var tags = raw_tags.split(' ');
	
	search_options.query = tags;
	
	refresh();
});

$(document).ready(function() {
	refresh();
});

function refresh() {
	nyaa_fetch(0, search_options, function(items) {
		$("#tlist").empty();
		items.forEach(insert_list_item);
	});
}

function insert_list_item(item) {
	var item_mod = "";
	
	if(item.aplus) {
		item_mod = " list-group-item-info";
	} else if(item.remake) {
		item_mod = " list-group-item-warning";
	} else if(item.trusted) {
		item_mod = " list-group-item-success";
	}
	
	if(item.seeds == 0) {
		item_mod = " list-group-item-danger";
	}
	
	$("#tlist").append("<a class='dl-item list-group-item" + item_mod + "' onclick='download_item(\"" + item.download_link +
		"\");'>" + item.title + "<div class='pull-right dl-info'>" + 
			"<span class='glyphicon glyphicon-arrow-up'></span> " + pad(item.seeds, 4) + 
			" <span class='glyphicon glyphicon-arrow-down'></span> " + pad(item.leech, 4) + 
			" <span class='glyphicon glyphicon-hdd'></span> " + item.size +
			"</div></a>");
}

function download_item(url) {
	fs.mkdir("downloads", function() {
		var filename_raw = url.split("tid=");
		
		var filename = filename_raw[filename_raw.length - 1] + ".torrent";
		
		var file_path = path.join("downloads", filename);
	
		var file = fs.createWriteStream(filename);

		var request = http.get(url, function(response) {
			response.pipe(file);
			
			response.on("end", function() {
				gui.Shell.openItem(filename);
				
				setTimeout(function() {
					fs.rename(filename, file_path);
				}, 5000);
			});
		});
	});
}

function pad(num, size) {
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
}