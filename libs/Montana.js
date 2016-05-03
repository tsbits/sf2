var Montana = function(){}



///////////////////////////////////
// GENERATING / AFFECTING COLORS //
///////////////////////////////////

Montana.randomColor = function(){
	var glyph = '0123456789ABCDEF'.split('');
    var color = '#';
    for( var i = 0; i < 6; i++ ){
        color += glyph[ Math.round( Math.random() * 15 ) ];
    }
    return color;
}

Montana.randomColorFromScheme = function( scheme ){
	var color = Montana.scheme[ scheme ][ Math.round( Math.random()*(Montana.scheme[ scheme ].length-1 ) ) ];
    return color;
}

Montana.changeColorLuminance = function( hexa, luminance ){
	hexa = String(hexa).replace(/[^0-9a-f]/gi, '');
	if( hexa.length < 6 ){
		hexa = hexa[0] + hexa[0] + hexa[1] + hexa[1] + hexa[2] + hexa[2];
	}
	luminance = luminance || 0;

	var rgb = "#", c, i;
	for( i = 0; i < 3; i++ ){
		c = parseInt( hexa.substr( i * 2 , 2 ), 16 );
		c = Math.round( Math.min( Math.max( 0, c + ( c * luminance ) ), 255 ) ).toString( 16 );
		rgb += ( "00"+c ).substr( c.length );
	}

	return rgb;
}

//HEX TO RGB & RGB TO HEX | credits Tim Down http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
Montana.hexToRgb = function( hex ){
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace( shorthandRegex, function( m, r, g, b ){
        return r + r + g + g + b + b;
    } );

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
    return result ? {
        r: parseInt( result[1], 16 ),
        g: parseInt( result[2], 16 ),
        b: parseInt( result[3], 16 )
    } : null;
}

Montana.componentToHex = function( c ){
    var hex = c.toString( 16 );
    return hex.length == 1 ? "0" + hex : hex;
}

Montana.rgbToHex = function( r, g, b ){
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
}



//////////////////
// COLOR SCHEME //
//////////////////

Montana.scheme = {};
Montana.scheme.beach = [ '#FFD946', '#F9C74B', '#2996C1', '#268DA5', '#FFFFFF' ];
Montana.scheme.bert = [ '#F0EDE6', '#95BFB8', '#63A497', '#332936', '#DCD5C1' ];
Montana.scheme.breizh = [ '#275D8C', '#0578A6', '#15A0BF', '#BFB1A8', '#F2D5C4' ];
Montana.scheme.cake = [ '#BF3B58', '#5B3349', '#F4C284', '#F5A286', '#F06363' ];
Montana.scheme.dawn = [ '#A49294', '#282240', '#2E2759', '#323073', '#BF5F56' ];
Montana.scheme.irland = [ '#005572', '#006573', '#008B8D', '#81BEAA', '#F4D4AD' ];
Montana.scheme.mint = [ '#005B4F', '#157362', '#61A486', '#92D7B2', '#C3F4D0' ];
Montana.scheme.nebula = [ '#D99F00', '#D92B4B', '#040740', '#010626', '#0596A6', '#0BD9C4' ];
Montana.scheme.patriot = [ '#BF3542', '#CDC5BA', '#EBE3D6', '#1F2A3C', '#2E2E2E' ];
Montana.scheme.volcano = [ '#D6D0D9', '#252622', '#F27B35', '#F2622E', '#F2522E' ];