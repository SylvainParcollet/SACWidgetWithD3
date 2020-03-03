(function()  {
    let d3Script = document.createElement('script');
    d3Script.src = 'https://d3js.org/d3.v5.min.js';
    d3Script.async = false;
    document.head.appendChild(d3Script);

    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
      <style>
      </style>
    `;

    d3Script.onload = () => 

    customElements.define('sap-widgetwithd3', class D3Widget extends HTMLElement {


        disconnectedCallback () {
            // your cleanup code goes here
            try{
                document.head.removeChild(d3Script);
            }
            catch{}
        }

        connectedCallback () {
            const bcRect = this.getBoundingClientRect();
            this._widgetHeight = bcRect.height;
			this._widgetWidth = bcRect.width;

			if (bcRect.height > bcRect.width){
				this._widgetHeight = bcRect.width;
				this._needleHeadLength = bcRect.height/2;
			} else {
				this._needleHeadLength = bcRect.width/2;
			}

            this._firstConnection = true;
            console.log("connectedCallback");

            setTimeout(() => { this.redraw();}, 1000);
        }
    
        constructor() {
			super();

            this._shadowRoot = this.attachShadow({mode: 'open'});
			this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
			this._firstConnection = false;

            //Constants
            if (!window._d3){
                window._d3 = d3;
			}

            this.style.height = "100%";  //Beta Workaround
            this._svgContainer;
    
            this._outerRad = 0.0;
            this._endAngleDeg = 30.0;
            this._endAngleDegMax = 145.0;
			this._startAngleDeg = -145.0;

			this._offsetLeft = 0;
			this._offsetDown = 0;
			
			this._fillNeedle = true;
        	this._needleColorCode = 'black';
			this._needleWidth = 2;
			this._needleHeadLength;
			this._needleLineThickness = 2;
            
            //Guide Lines
            this._ringColorCode = 'black';
            this._guideOpacity = 0.75;
            this._ringThickness = 5;
            this._bracketThickness = 5;

            this.nNth = 0;

            //Adding event handler for click events
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
            });
        };

		//When the custom widget is updated, the Custom Widget SDK framework executes this function first
		onCustomWidgetBeforeUpdate(oChangedProperties) {

		}
	
		//When the custom widget is updated, the Custom Widget SDK framework executes this function after the update
		onCustomWidgetAfterUpdate(oChangedProperties) {
			//if (this._firstConnection){
			//	this.redraw();
            //}
            this._widgetHeight = 300;
			this._widgetWidth = 320;

			if (this._widgetHeight > this._widgetWidth ){
				this._widgetHeight = this._widgetWidth ;
				this._needleHeadLength = this._widgetHeight/2;
			} else {
				this._needleHeadLength = this._widgetWidth/2;
			}
            this._needleColorCode = 'black';
            console.log("onCustomWidgetAfterUpdate");
            this.redraw();
		}
		
		//When the custom widget is removed from the canvas or the analytic application is closed
		onCustomWidgetDestroy(){
		
		}
	
		
		//When the custom widget is resized on the canvas, the Custom Widget SDK framework executes the following JavaScript function call on the custom widget
		// Commented out by default
		onCustomWidgetResize(width, height){
            this._widgetHeight = width;
			this._widgetWidth = height;

            if (this._widgetHeight < this._widgetWidth){
                this._widgetWidth = this._widgetHeight;
            }
			this._needleHeadLength = this._widgetWidth/2;		
		}

        redraw() {

			this._offsetLeft = this._widgetWidth/2;
			this._offsetDown = this._widgetHeight/2;

            if (!this._svgContainer){
                this._svgContainer = window._d3.select(this._shadowRoot)
                .append("svg:svg")
                .attr("id", "gauge")
                .attr("width", this._widgetWidth)
                .attr("height", this._widgetHeight);
            } else{
                window._d3.select(this._shadowRoot).selectAll("*").remove();
                this._svgContainer = window._d3.select(this._shadowRoot)
                .append("svg:svg")
                .attr("id", "gauge")
                .attr("width", this._widgetWidth)
                .attr("height", this._widgetHeight);
            }
            
            var pi = Math.PI;		
			this._outerRad = (this._widgetHeight)/2;
			
            ///////////////////////////////////////////	
            //Lets build a border ring around the gauge
            ///////////////////////////////////////////
            var visRing = window._d3.select(this._shadowRoot).append("svg:svg").attr("width", "100%").attr("height", "100%");

            var ringOuterRad = this._outerRad + ( -1 * this._ringThickness);  //Outer ring starts at the outer radius of the inner arc

            var ringArcDefinition = window._d3.arc()
                .innerRadius(this._outerRad)
                .outerRadius(ringOuterRad)
                .startAngle(this._startAngleDeg * (pi/180)) //converting from degs to radians
                .endAngle(this._endAngleDegMax * (pi/180)) //converting from degs to radians

            var ringArc = this._svgContainer
                .append("path")
                .attr("d", ringArcDefinition)
                .attr("fill", this._ringColorCode)
                .attr("transform", "translate(" + this._outerRad + "," + this._outerRad + ")");
				
			///////////////////////////////////////////
			//Lets add the indicator needle
			///////////////////////////////////////////
			var needleWaypointOffset = this._needleWidth/2;

			//needleWaypoints is defined with positive y axis being up
			//The initial definition of needleWaypoints is for a full diamond, but if this._enableIndicatorNeedleTail is false, we'll abbreviate to a chevron
			var needleWaypoints = [{x: 0,y: this._needleHeadLength}, {x: needleWaypointOffset,y: 0}, {x: (-1*needleWaypointOffset),y: 0}, {x: 0,y: this._needleHeadLength}];

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
				.transition()
				.duration(0)
				.attr("transform", "rotate(" +  this._startAngleDeg + ")")
				.transition()
				.duration(1000)
				.attr("transform", "rotate(" +  this._endAngleDeg + ")");

			
	
        };


        //Helper function	
        endPoints (lineLength, lineAngle){
            var pi = Math.PI;
            var endX = this._outerRad + (lineLength * Math.sin(lineAngle * (pi/180)));
            var endY = this._outerRad - (lineLength * Math.cos(lineAngle * (pi/180)));
            return {x:endX, y:endY}
        };
    
    
    });
        
})();