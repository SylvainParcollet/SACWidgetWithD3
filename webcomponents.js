(function()  { 
    let d3Script = document.createElement('script');
    d3Script.src = 'https://d3js.org/d3.v5.min.js';
    d3Script.async = false;
    document.head.appendChild(d3Script);

    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
        .prerender {
            background-color : beige;
            fill : gray;
            stroke: white;
            stroke-width: 2;
            border-radius: 10px;
            opacity: .2;
        }

        .b_occupied {
            background-color : beige;
            fill : white;
            stroke: white;
            stroke-width: 2;
            border-radius: 3px;
            opacity: .75;
        }

        .b_available {
            background-color : beige;
            fill : gray;
            stroke: white;
            stroke-width: 2;
            border-radius: 3px;
            opacity: .2;
        }

        .pe_occupied {
            background-color : beige;
            fill : white;
            stroke: white;
            stroke-width: 2;
            border-radius: 3px;
            opacity: .75;
        }

        .pe_available {
            background-color : beige;
            fill : gray;
            stroke: white;
            stroke-width: 2;
            border-radius: 3px;
            opacity: .2;
        }

        .e_occupied {
            background-color : beige;
            fill : white;
            stroke: white;
            stroke-width: 2;
            border-radius: 3px;
            opacity: .75;
        }

        .e_available {
            background-color : beige;
            fill : gray;
            stroke: white;
            stroke-width: 2;
            border-radius: 3px;
            opacity: .2;
        }
    </style>

    `;

    d3Script.onload = () => 
  
    customElements.define('sap-widgetwithd3', class D3Widget extends HTMLElement {
    constructor() {
        super();
		//Constants
		if (!window._d3){
			window._d3 = d3;
		}
		
		this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
		this._svgContainer;
		
		/*

        this._enableArc = false;
        this._innerRad = 0.0;
        this._outerRad = 0.0;
        this._endAngleDeg = 0.0;
        this._startAngleDeg = -145.0;
        this._widgetWidth = 144;
        this._paddingTop = 0;
        this._paddingBottom = 0;
        this._paddingLeft = 0;
        this._paddingRight = 0;
        this._offsetLeft = 0;
        this._offsetDown = 0;
        
        //New with Part 6
        this._useMeasures = true;
        this._endAngleDegMax = 145.0;
        this._measureMax = 0;
        this._measureMin = 0;
        this._measureVal = 0;
        
        //Part 7 conditional formatting
        this._colorCode = 'white';
        this._gaugeOpacity = 0.75,
        this._displayedColor = 'white'
        this._colorArray = 1;  //abusing JS duck typing here.  ;-)
        
        //Part 8 Guide Lines
        this._enableGuideLines = false;
        this._enableGuideRing = false;
        this._ringColorCode = 'blue';
        this._guideOpacity = 0.75;
        this._ringThickness = 5;
        this._bracketThickness = 5;
        
        //Part 9 - Indicator Needle
        this._enableIndicatorNeedle = true;
        this._enableIndicatorNeedleTail = false;
        this._fillNeedle = true;
        this._needleColorCode = 'white';
        this._needleWidth = 2;
        this._needleHeadLength = 40;
        this._needleTailLength = 10;
        this._needleLineThickness = 2;
        this._enableIndicatorNeedleBase = true;
        this._fullBasePinRing = true;
        this._fillNeedlaBasePin = true;
        this._needleBaseWidth = 10;
        
        //Part 10 - Animations
        this._animationEnable = true;
        this._animationDelay = 500;
        this._animationDuration = 1000;
        this._animationEase = "easeLinear";
        this._animationEnableOpacity = false;
        this._animationDelayOpacity = 500;
        this._animationDurationOpacity = 500;
        
        //Part 11 - Callouts
        this._drawMeasureText = false;
        this._measureTextPositionType = "upperCentral";
        this._drawGuideText = false;
		this._guidePositioning = "end";

		*/
    };


	//Fired when the widget is added to the html DOM of the page
	connectedCallback(){
		this._firstConnection = true;
		this.redraw(); 
	}

		//Fired when the widget is removed from the html DOM of the page (e.g. by hide)
	disconnectedCallback(){
	
	}

		//When the custom widget is updated, the Custom Widget SDK framework executes this function first
	onCustomWidgetBeforeUpdate(oChangedProperties) {

	}

	//When the custom widget is updated, the Custom Widget SDK framework executes this function after the update
	onCustomWidgetAfterUpdate(oChangedProperties) {
		if (this._firstConnection){
			this.redraw();
		}
	}
	
	//When the custom widget is removed from the canvas or the analytic application is closed
	onCustomWidgetDestroy(){
	
	}

	
	//When the custom widget is resized on the canvas, the Custom Widget SDK framework executes the following JavaScript function call on the custom widget
	// Commented out by default
	/*
	onCustomWidgetResize(width, height){
	
	}
	*/

	
	
	redraw() {


	};
	





});
    
})();