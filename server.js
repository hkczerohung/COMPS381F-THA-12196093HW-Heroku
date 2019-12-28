const express = require('express');
const app = express();
const fs = require('fs');
const formidable = require('formidable');

var ExifImage = require('exif').ExifImage;
var photo = [];

app.set('view engine', 'ejs');

app.get('/', (req,res) => {
  res.status(200).sendFile(__dirname + '/public/upload.html');
});

app.get('/fileReview', (req,res) => {	
	res.render('photo.ejs',{photo:photo});
});

app.post('/fileupload', (req,res) => {	
	let form = new formidable.IncomingForm();
  	form.parse(req, (err, fields, files) => {
	    	console.log(JSON.stringify(files));
		if (files.filetoupload.size == 0) {
			res.writeHead(500, {"Content-Type": "text/html"});
			res.write('No file!');
			res.end('<br><button class="btn btn-primary"><a href="/">Home</a></button>'); 
		}
		let filename = files.filetoupload.path;

		if (fields.title) {
	      		var title = (fields.title.length > 0) ? fields.title : "untitled";
	      		console.log(`title = ${title}`);
	    	}
		if (fields.description) {
	      		var description = (fields.description.length > 0) ? fields.description : "untitled";
	      		console.log(`description = ${description}`);
	    	}
		if (files.filetoupload.type) {
			var mimetype = files.filetoupload.type;
			console.log(`mimetype = ${mimetype}`);
		}
		if (!mimetype.match(/^image/)) {
			var mimetype = "null";
      			console.log(`mimetype = "null"`);
		}


		fs.readFile(filename, (err,data) => {	     				photo['title'] = title;
			photo['description'] = description;
			photo['image'] = new Buffer.from(data).toString('base64');
			try {
			    new ExifImage({ image : files.filetoupload.path }, function (error, exifData) {
				if (error)
				    console.log('Error: '+error.message);
				else { 
				    console.log(exifData);
				    // Do something with your data!
				    let make = exifData.image.Make;
				    let model = exifData.image.Model;
				    let createdOn = exifData.exif.CreateDate;

				    photo['make'] = make;
				    photo['model'] = model;
				    photo['createdOn'] = createdOn;
				    console.log(photo['make']);
				    console.log(photo['model']);
				    console.log(photo['createdOn']);

				    //let lat = exifData.gps.GPSLatitude[0] + " " + exifData.gps.GPSLatitude[1] + " " + exifData.gps.GPSLatitude[2] + " " + exifData.gps.GPSLatitudeRef;
				    //let lon = exifData.gps.GPSLongitude[0] + " " + exifData.gps.GPSLongitude[1] + " " + exifData.gps.GPSLongitude[2] +  " " + exifData.gps.GPSLongitudeRef;
				    let lat = exifData.gps.GPSLatitude[0]+(exifData.gps.GPSLatitude[1]+exifData.gps.GPSLatitude[2]/60)/60;
				    let lon = exifData.gps.GPSLongitude[0]+(exifData.gps.GPSLongitude[1]+exifData.gps.GPSLongitude[2]/60)/60;
				    if(exifData.gps.GPSLatitudeRef == 'S' || exifData.gps.GPSLatitudeRef == 'W'){
					lat = lat*(-1);
				   }
				   if(exifData.gps.GPSLongitudeRef == 'S' || exifData.gps.GPSLongitudeRef == 'W'){
					lon = lon*(-1);
				   }
				    photo['locationLat'] = lat;
				    photo['locationLon'] = lon;
				    console.log(photo['locationLat']);
				    console.log(photo['locationLon']);
				    
				    res.render('photo.ejs',{photo:photo});
				}	
			    });
			} catch (error) {
			    console.log('Error: ' + error.message);
			}	
			
		});
	});
});

app.get("/map", (req,res) => {
	res.render("gmap.ejs", {
		lat:req.query.lat,
		lon:req.query.lon,
		zoom:req.query.zoom ? req.query.zoom : 15
	});
	res.end();
});

app.listen(process.env.PORT || 8099);
