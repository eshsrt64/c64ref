window.onload = init;

// START
// https://www.pepto.de/projects/colorvic/
// START

var levels = { mc: [ 0 ], fr: [ 0 ] };            // Black (luma switched off)

with ( levels )
{
    // most common

    mc[ 0x6 ] = mc[ 0x9 ] =  8;                   // Blue,    Brown
    mc[ 0xb ] = mc[ 0x2 ] = 10;                   // Dk.Grey, Red
    mc[ 0x4 ] = mc[ 0x8 ] = 12;                   // Purple,  Orange
    mc[ 0xc ] = mc[ 0xe ] = 15;                   // Md.Grey, Lt.Blue
    mc[ 0x5 ] = mc[ 0xa ] = 16;                   // Green,   Lt.Red
    mc[ 0xf ] = mc[ 0x3 ] = 20;                   // Lt.Grey, Cyan
    mc[ 0x7 ] = mc[ 0xd ] = 24;                   // Yellow,  Lt.Green
    mc[ 0x1 ]             = 32;                   // White

    // first revision

    fr[ 0x2 ] = fr[ 0x6 ] = fr[ 0x9 ] = fr[ 0xb ]                         = 8 * 1;
    fr[ 0x4 ] = fr[ 0x5 ] = fr[ 0x8 ] = fr[ 0xa ] = fr[ 0xc ] = fr[ 0xe ] = 8 * 2;
    fr[ 0x3 ] = fr[ 0x7 ] = fr[ 0xd ] = fr[ 0xf ]                         = 8 * 3;
    fr[ 0x1 ]                                                             = 8 * 4;
}


var angles = [];

angles[ 0x4 ]                 = 2;                // Purple
angles[ 0x2 ] = angles[ 0xa ] = 4;                // Red
angles[ 0x8 ]                 = 5;                // Orange
angles[ 0x9 ]                 = 6;                // Brown
angles[ 0x7 ]                 = 7;                // Yellow
angles[ 0x5 ] = angles[ 0xd ] = 2 + 8;            // Green
angles[ 0x3 ]                 = 4 + 8;            // Cyan
angles[ 0x6 ] = angles[ 0xe ] = 7 + 8;            // Blue

function compose( index, revision, brightness, contrast, saturation )
{
    // constants

    var sector = 360/16;
    var origin = sector/2;
    var radian = Math.PI/180;
    var screen = 1/5;

    // normalize

    brightness -=  50;
    contrast   /= 100;
    saturation *=   1 - screen;

    // construct

    var components = { u: 0, v: 0 };            // monochrome (chroma switched off)

    if ( angles[ index ] )
    {
        var angle = ( origin + angles[ index ] * sector ) * radian;

        components.u = Math.cos( angle ) * saturation;
        components.v = Math.sin( angle ) * saturation;
    }

    components.y = 8 * levels[ revision ][ index ] + brightness;

    for ( var i in components )
    {
        components[ i ] *= contrast + screen;
    }

    return components;
}

function convert( components, source )
{
    // matrix transformation

    var color = {};

    color.r = components.y                        + 1.140 * components.v;
    color.g = components.y - 0.396 * components.u - 0.581 * components.v;
    color.b = components.y + 2.029 * components.u;

    // gamma correction

    var target = 2.2;                            // sRGB

    for ( var i in color )
    {
        color[ i ] = Math.max( Math.min( color[ i ], 255 ), 0 );

        color[ i ] = Math.pow( 255, 1 -   source ) * Math.pow( color[ i ],   source );
        color[ i ] = Math.pow( 255, 1 - 1/target ) * Math.pow( color[ i ], 1/target );

        color[ i ] = Math.round( color[ i ] );
    }

    color.y = components.y;
    color.u = components.u;
    color.v = components.v;

    return color;
}

// END
// https://www.pepto.de/projects/colorvic/
// END


// https://stackoverflow.com/questions/5623838
function hexFromComponent(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
function hexFromRGB(r, g, b) {
	return "#" + hexFromComponent(r) + hexFromComponent(g) + hexFromComponent(b);
}

function yFromRGB(r, g, b) {
	return (0.2126 * r + 0.7152 * g + 0.0722 * b) | 0;
}

// https://wisotop.de/rgb-nach-hsv.php
function HSBfromRGB(r, g, b) {
	var h, s, v;
	var min, max, delta;
	min = Math.min(r, g, b);
	max = Math.max(r, g, b);
	v = max;
	delta = max - min;
	if (max != 0 ) {
		s = delta / max;
	} else {
		s = 0;
		h = -1;
		return [h, s, v];
	}
	if (max == min) {
		h = 0;
		s = 0;
		return [h, s, v];
	}
	if (r == max) {
		h = (g - b) / delta;
	} else if (g == max) {
		h = 2 + ( b - r ) / delta;
	} else {
		h = 4 + ( r - g ) / delta;
	}
	h *= 60;
	if (h < 0) {
		h += 360;
	}
	return { h: h, s: s, v: v };
}


function init() {
	reset();
	refresh();
}

function refresh() {
	mixedcols = document.getElementById("mixedcols").selectedIndex;
	sortby = document.getElementById("sortby").selectedIndex;
	revision = document.getElementById("lumalevels").selectedIndex ? 'mc': 'fr';
	brightness = document.getElementById("brightness").value;
	contrast = document.getElementById("contrast").value;
	saturation = document.getElementById("saturation").value;
	gamma = document.getElementById("gamma").value / 10;

	colors = []
	for (var i = 0; i < 16; i++) {
		var c = convert(compose(i, revision, brightness, contrast, saturation), gamma);
		c.index = i;
		c.description = i;
		c.h = HSBfromRGB(c.r, c.g, c.b).h;
		colors.push(c);
	}

	//
	// create mixed colors
	//
	if (mixedcols) {
		var l = colors.length;
		for (var i = 0; i < l; i++) {
			var c1 = colors[i];
			for (var j = i+1; j < l; j++) {
				var c2 = colors[j];
				if (mixedcols == 2 || c1.y == c2.y) {
					var cm = {}
					cm.r = ((c1.r + c2.r) / 2) | 0;
					cm.g = ((c1.g + c2.g) / 2) | 0;
					cm.b = ((c1.b + c2.b) / 2) | 0;
					cm.y = ((c1.y + c2.y) / 2) | 0;
					cm.h = HSBfromRGB(cm.r, cm.g, cm.b).h;
					cm.index = colors.length;
					cm.description = '' + c1.index + '/' + c2.index;
					colors.push(cm);
				}
			}
		}
	}

	//
	// sort
	//
	function compare_y(a, b) {
		return a.y - b.y;
	}
	function compare_h(a, b) {
		if (!a.h && !b.h) {
			// both gray? then sort by Y
			return a.y - b.y;
		}
		if (!a.h) {
			return -1;
		}
		if (!b.h) {
			return 1;
		}
		return a.h - b.h;
	}
	function compare_index(a, b) {
		return a.index - b.index;
	}
	if (sortby == 0) {
		colors.sort(compare_y);
	} else if (sortby == 1) {
		colors.sort(compare_h);
	} else {
		colors.sort(compare_index);
	}

	//
	// create cells
	//
	row1 = document.getElementById("row1");
	row1.innerHTML = '';
	row2 = document.getElementById("row2");
	row2.innerHTML = '';
	for (var i = 0; i < colors.length; i++) {
		var td = document.createElement("td");
		td.className='colbox'
		td.id='col' + i;
		row1.appendChild(td);
		td = document.createElement("td");
		td.className='colbox'
		td.id='ycol' + i;
		row2.appendChild(td);
	}

	//
	// fill cells with colors
	//
	text_hexcolors = '';
	for (var i = 0; i < colors.length; i++) {
		c = colors[i];
		hexcolor = hexFromRGB(c.r, c.g, c.b);
		text_hexcolors += hexcolor + '\n';
		y = (Math.max(c.y, 0) / 307.2 * 255) | 0;
		yhexcolor = hexFromRGB(y, y, y);
		document.getElementById("col"+i).style = 'background-color: ' + hexcolor;
		document.getElementById("ycol"+i).style = 'background-color: ' + yhexcolor;
//		document.getElementById("col"+i).innerHTML = c.index;
	}
	var paths = '';
	for (var y = 0; y < 32; y++) {
		for (var x = 0; x < 32; x++) {
			var r = x * 8;
			var g = y * 8;
			var b = 128;
			var cr = null;
			var mindist = 99999;
			for (var i = 0; i < colors.length; i++) {
				c = colors[i];
				dist = Math.sqrt((c.r - r)*(c.r - r)+(c.g - g)*(c.g - g)+(c.b - b)*(c.b - b));
				if (dist < mindist) {
					mindist = dist;
					cr = c;
				}
			}
			var fgcolor = hexFromRGB(cr.r, cr.g, cr.b);
//			var fgcolor = hexFromRGB(r, g, b);
			width = 1;
			paths += '<path stroke="' + fgcolor + '" d="M' + x + ' ' + y + 'h' + width + '"/>'
		}
	}
	var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" shape-rendering="auto" viewBox="0 -.5 32 32">' + paths + '</svg>';
	document.getElementById("gamut").innerHTML = svg;


	//
	// fill hex colors table
	//
	document.getElementById("hexcolors").innerHTML = text_hexcolors;
}

function reset() {
	document.getElementById("brightness").value = 50;
	document.getElementById("contrast").value = 100;
	document.getElementById("saturation").value = 50;
	document.getElementById("gamma").value = 28; // PAL: 2.8
	refresh();
}

