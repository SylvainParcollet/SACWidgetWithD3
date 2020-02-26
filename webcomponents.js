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
        this._measureMax = 100;
        this._measureMin = 0;
        this._measureVal = 70;
        
        //Part 7 conditional formatting
        this._colorCode = 'white';
        this._gaugeOpacity = 0.75,
        this._displayedColor = 'white'
        this._colorArray = 1;  //abusing JS duck typing here.  ;-)
        
        //Part 8 Guide Lines
        this._enableGuideLines = true;
        this._enableGuideRing = true;
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
		
		if (this._measureMax > this._measureMin){
			if (!this._svgContainer){
				this._svgContainer = window._d3.select(this._shadowRoot)
				.append("svg:svg")
				.attr("id", "gauge")
				.attr("width", this._widgetWidth)
				.attr("height", this._widgetWidth);
			}
	
			this.recalculateCurrentAngle();
			
			//Prepare the animation settings
			// If this._animationEnable is false, then we'll act as if this._animationDelay and this._animationDuration
			//   are both 0, without actually altering their values.
			var tempAnimationDelay = 0;
			var tempAnimationDuration = 0;
			if (this._animationEnable == true){
				tempAnimationDelay = this._animationDelay;
				tempAnimationDuration = this._animationDuration;
			}
			
			var pi = Math.PI;
			
			// Find the larger left/right padding
			var lrPadding = this._paddingLeft + this._paddingRight;
			var tbPadding = this._paddingTop + this._paddingBottom;
			var maxPadding = lrPadding;
			if (maxPadding < tbPadding){
				maxPadding = tbPadding
			}			

			
			this._outerRad = (this._widgetWidth - 2*(maxPadding))/2;
			
			//Don't let the innerRad be greater than outer rad
			if (this._outerRad <= this._innerRad){
				alert("Warning!  The gauge arc can't have a negative radius!  Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
			} 
			
			//Part 8 - The guide lines
			///////////////////////////////////////////	
			//Lets build a border ring around the gauge
			///////////////////////////////////////////
			if (this._enableGuideRing == true){
				var visRing = window._d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
				
				var ringOuterRad = this._outerRad + ( -1 * this._ringThickness);  //Outer ring starts at the outer radius of the inner arc
		
				var ringArcDefinition = window._d3.svg.arc()
					.innerRadius(this._outerRad)
					.outerRadius(ringOuterRad)
					.startAngle(this._startAngleDeg * (pi/180)) //converting from degs to radians
					.endAngle(this._endAngleDegMax * (pi/180)) //converting from degs to radians
		
				var ringArc = this._svgContainer
					.append("path")
					.attr("d", ringArcDefinition)
					.attr("fill", this._ringColorCode)
					.attr("transform", "translate(" + this._offsetLeft + "," + this._offsetDown + ")");
			}
			///////////////////////////////////////////
			//Lets build a the start and end lines
			///////////////////////////////////////////
			if (this._enableGuideLines == true){
				var visStartBracket = window._d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
				var lineData = [endPoints (this._outerRad, this._startAngleDeg), {x:this._offsetLeft, y:this._offsetDown}, endPoints (this._outerRad, this._endAngleDegMax)];
				var lineFunction = window._d3.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate("linear");
											
				var borderLines = this._svgContainer
					.attr("width", me.$().width()).attr("height", me.$().height()) // Added height and width so line is visible
					.append("path")
					.attr("d", lineFunction(lineData))
					.attr("stroke", this._ringColorCode)
					.attr("stroke-width", this._bracketThickness)
					.attr("fill", "none");	
			}
			
			///////////////////////////////////////////
			//Lets add the indicator needle
			///////////////////////////////////////////

			if (this._enableIndicatorNeedle == true){
				var needleWaypointOffset = this._needleWidth/2;

				//needleWaypoints is defined with positive y axis being up
				//The initial definition of needleWaypoints is for a full diamond, but if this._enableIndicatorNeedleTail is false, we'll abbreviate to a chevron
				var needleWaypoints = [{x: 0,y: this._needleHeadLength}, {x: needleWaypointOffset,y: 0}, {x: 0,y: (-1*this._needleTailLength)}, {x: (-1*needleWaypointOffset),y: 0}, {x: 0,y: this._needleHeadLength}]
				if (this._enableIndicatorNeedleTail == false){
					if (this._fillNeedle == false){
						//If we have no tail and no fill then there is no need to close the shape.
						//Leave it as an open chevron
						needleWaypoints = [{x: needleWaypointOffset,y: 0}, {x: 0,y: this._needleHeadLength}, {x: (-1*needleWaypointOffset),y: 0}];
					}
					else {
						//There is no tail, but we are filling the needle.
						//In this case, draw it as a triangle
						needleWaypoints = [{x: 0,y: this._needleHeadLength}, {x: needleWaypointOffset,y: 0}, {x: (-1*needleWaypointOffset),y: 0}, {x: 0,y: this._needleHeadLength}]
					}

				}

				//we need to invert the y-axis and scale the indicator to the gauge.
				//  If Y = 100, then that is 100% of outer radius.  So of Y = 100 and outerRad = 70, then the scaled Y will be 70.
				var outerRad = this._outerRad;
				var needleFunction = window._d3.line()
					.x(function(d) { return (d.x)*(outerRad/100); })
					.y(function(d) { return -1*(d.y)*(outerRad/100); });

				//Draw the needle, either filling it in, or not
				var needleFillColorCode = this._needleColorCode;
				if (this._fillNeedle == false){
					needleFillColorCode = "none";
				}
				

				var needle = this._svgContainer
				.append("g")
					.attr("transform", "translate(" + this._offsetLeft + "," + this._offsetDown + ")")
				.append("path")
					.datum(needleWaypoints)
					.attr("class", "tri")
					.attr("d", needleFunction(needleWaypoints))
					.attr("stroke", this._needleColorCode)
					.attr("stroke-width", this._needleLineThickness)
					.attr("fill", needleFillColorCode)
					.attr("transform", "rotate(" +  this._startAngleDeg + ")");;

			}
			
			/*
			///////////////////////////////////////////
			//Lets add our animations
			///////////////////////////////////////////			
			//This blog post explains using attrTween for arcs: http://bl.ocks.org/mbostock/5100636
			// Function adapted from this example
			// Creates a tween on the specified transition's "d" attribute, transitioning
			// any selected arcs from their current angle to the specified new angle.
			if (this._enableArc == true){
				if ((this._endAngleDeg > 0) && (this._startAngleDeg < 0)){
					
						guageArc.transition()
							.duration(tempAnimationDuration)
							.delay(tempAnimationDelay)
							.attrTween("d", function(d) {
								var interpolate = window._d3.interpolate(this._startAngleDeg * (pi/180), 0);
								return function(t) {
									d.endAngle = interpolate(t);
									return arcDef(d);
								};
							});
						guageArc.transition()
							.duration(tempAnimationDuration)
							.delay(0)
							.ease(this._animationEase)
							.attrTween("d", function(d) {
								var interpolate = window._d3.interpolate(0, this._endAngleDeg * (pi/180));
								return function(t) {
									d.endAngle = interpolate(t);
									return arcDef(d);
								};
							});
				} else {
						guageArc.transition()
							.duration(tempAnimationDuration)
							.delay(tempAnimationDelay)
							.ease(this._animationEase)
							.attrTween("d", function(d) {
								var interpolate = window._d3.interpolate(this._startAngleDeg * (pi/180), this._endAngleDeg * (pi/180));
								return function(t) {
									d.endAngle = interpolate(t);
									return arcDef(d);
								};
							});			
				}
			}

			//Arcs are in radians, but rotation transformations are in degrees.  Kudos to D3 for consistency
			var animationEase = this._animationEase;
			if (this._enableIndicatorNeedle == true){
				needle.transition()
					.attr("transform", "rotate(" + this._endAngleDeg + ")")
					.duration(tempAnimationDuration)
					.delay(tempAnimationDelay);
					//.ease(animationEase);
			}
			*/

			if ((this._enableIndicatorNeedleBase == true) && (this._enableIndicatorNeedle == true)){
				var theD3 = window._d3;
				pinArc.transition()
					.duration(tempAnimationDuration)
					.delay(tempAnimationDelay)
					.attrTween("d", function(d) {
						var interpolateEnd = theD3.interpolate(nbpTransformedEndAngle * (pi/180), nbTransformedEndAngle * (pi/180));
						var interpolateStart = theD3.interpolate(nbpTransformedStartAngle * (pi/180), nbTransformedStartAngle * (pi/180));
						return function(t) {
							d.endAngle = interpolateEnd(t);
							d.startAngle = interpolateStart(t);
							return pinArcDefinition(d);
						};
					});		
				
			}
			
			//Guide Ring and Lines
			var localFadeDelay = this._animationDelayOpacity;
			var localFadeDuration = this._animationDurationOpacity;
			if (this._animationEnableOpacity == false){
				localFadeDelay = 0;
				localFadeDuration = 0;
			}
			if (this._enableGuideRing == true){
				ringArc.transition()
				.attr( "fill-opacity", 0 )
				.transition()
				.delay( localFadeDelay )
				.duration(localFadeDuration)
				.attr( "fill-opacity", this._guideOpacity );
			}
			if (this._enableGuideLines == true){
				borderLines.transition()
				.attr( "stroke-opacity", 0 )
				.transition()
				.delay( localFadeDelay )
				.duration(localFadeDuration)
				.attr( "stroke-opacity", this._guideOpacity );			
			}
			
			

		}	

	

	};


	
	//New with Part 6
	recalculateCurrentAngle = function(){
		if (this._useMeasures == true){
			//Firstly, ensure that we can turn in a clockwise manner to get from startAngleDeg to endAngleDegMax
			while (this._endAngleDeg < this._startAngleDeg){
				this._endAngleDegMax = me.this._endAngleDegMax + 360.0;
			}
			
			var currEnd = 0.0;
			if (this._measureVal > this._measureMax){
				currEnd = this._endAngleDegMax;
			} 
			else if (this._measureVal  < this._measureMin){
				currEnd = this._startAngleDeg;
			} else{
				var measureDelta = this._measureMax - this._measureMin;
				var measureValNormalized = 0.0;
				if (measureDelta >  measureValNormalized){
					var measureValNormalized = this._measureVal / measureDelta;
				}
				currEnd = this._startAngleDeg + (measureValNormalized * (this._endAngleDegMax - this._startAngleDeg))
			}
			
			if (currEnd >  this._endAngleDegMax){
				currEnd = this._endAngleDegMax;
			} 
	
			//Now set this._endAngleDeg
			this._endAngleDeg = currEnd;
		}		
		else {
			//Right now, this gauge is hardcoded to turn in a clockwise manner. 
			//  Ensure that the arc can turn in a clockwise direction to get to the end angles
			while (this._endAngleDeg < this._startAngleDeg){
				this._endAngleDeg = this._endAngleDeg + 360.0;
			}
			
			//Ensure that endAngleDeg falls within the range from startAngleDeg to endAngleDegMax
			while (this._endAngleDeg > this._endAngleDegMax){
				this._endAngleDegMax = this._endAngleDegMax + 360.0;
			}
		}
	};
	
	
	//Helper function	
	endPoints (lineLength, lineAngle){
		var pi = Math.PI;
		var endX = this._offsetLeft + (lineLength * Math.sin(lineAngle * (pi/180)));
		var endY = this._offsetDown - (lineLength * Math.cos(lineAngle * (pi/180)));
		return {x:endX, y:endY}
	}
	
	//New with Part 11
	// Helper function to determine the vertical alignment (called 'dominant-baseline') and horizontal alignment (called ' text-anchor')
	// In essence, this function tries to find a readable position for the text, so that it lies ourside the main arc, no matter the current 
	//  x and y are the absolute positions of the callout, within the component
	//  isMiddleCallout determines whether this is anchored on the middle of a guide line
	//  isStart determines whether or not this the start callout.  this function will try to position the callouts anchoren on the middle
	//		guide line outside of the gauge arc.
	// text-anchor: https://developer.mozilla.org/en/docs/Web/SVG/Attribute/text-anchor
	textPositioning (x, y, isStart){
		var relativeOffsetX = x - this._offsetLeft;
		var relativeOffsetY = y - this._offsetDown;

		if (isStart == undefined){
			isStart = false;
		}

		var dominantBaseline = null;
		var textAnchor = null;
		if ((relativeOffsetX >= 0) && (relativeOffsetY >= 0)){
			//Lower Right Quadrant
			// Both middle and enf have a negative dominant baseline
			if (isStart == true){
				textAnchor = "start";
				dominantBaseline = "0em";
			} else {
				textAnchor = "end";
				dominantBaseline = ".8em";
			}
			
		} else if ((relativeOffsetX >= 0) && (relativeOffsetY < 0)){
			//Upper Right Quadrant
			if (isStart == true){
				textAnchor = "end";
				dominantBaseline = "0em";
			} else {
				textAnchor = "start";
				dominantBaseline = ".8em";
			}
		}
		 else if ((relativeOffsetX < 0) && (relativeOffsetY < 0)){
			//Upper Left Quadrant
			if (isStart == true){
				textAnchor = "end";
				dominantBaseline = ".8em";
			} else {
				textAnchor = "start";
				dominantBaseline = "0em";
			}
		} else {
			//Lower Left Quadrant
			if (isStart == true){
				textAnchor = "start";
				dominantBaseline = ".8em";
			} else {
				textAnchor = "end";
				dominantBaseline = "0em";
			}
		}
		
		return [textAnchor, dominantBaseline]
	}





});
    
})();