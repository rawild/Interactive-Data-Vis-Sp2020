/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 7;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let selectionList;
let countryScale;
let ctyPosScale;
let ctyNegScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selection1: "All", // + YOUR FILTER SELECTION
  selection2: "None"
};

/* LOAD DATA */
d3.csv("../data/500billionaires_cleaned.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => +d.NetWorth))
    .range([margin.left, width - margin.right])
  
  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => +d.ChangethisYear))
    .range([height - margin.bottom, margin.top])
  
  // + AXES
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

 
  // + UI ELEMENT SETUP
  const selectElement1 = d3.select("#dropdown1").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selection1 = this.value
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  const selectElement2 = d3.select("#dropdown2").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selection2 = this.value
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });
  
  // add in dropdown options from the unique values in the data
   selectionList = d3.map(state.data, d => d.Country).keys().sort()
   selectionList1 = ['All']
   selectElement1
    .selectAll("option")
    .data(selectionList1.concat(selectionList)) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);
  
  selectionList2 = ['None']
  selectElement2
  .selectAll("option")
  .data(selectionList2.concat(selectionList)) // + ADD UNIQUE VALUES
  .join("option")
  .attr("value", d => d)
  .text(d => d);  
  // Color Scale for selection list
    countryScale = d3.scaleSequential(d3.interpolateRainbow)
    
    // Color scale for cty
    ctyPosScale = d3.scaleSequential(d3.interpolatePurples)
    ctyNegScale = d3.scaleSequential(d3.interpolateOranges)

  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + CALL AXES
  svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0,${yScale(0)})`)
  .call(xAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "50%")
  .attr("dy", "6em")
  .text("Net Worth (in Billions of $)");

  svg
  .append("g")
  .attr("class", "axis y-axis")
  .attr("transform", `translate(${margin.left},${xScale(0)})`)
  .call(yAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("y", "50%")
  .attr("dx", "-4em")
  .attr("writing-mode", "vertical-rl")
  .text("Change in Wealth in 2020 (in Billions $)");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
  
  let filteredData;
  let selection1Data = state.data
  let selection2Data = [];
  // + FILTER DATA BASED ON STATE
  console.log(state)
  if (state.selection1 !== "All" ) {
      selection1Data = state.data.filter(d => d.Country === state.selection1)
  } 
  if (state.selection2 !== "None") {
    selection2Data = (state.data.filter(d => 
     d.Country === state.selection2))
  }
  filteredData = selection1Data.concat(selection2Data)
  

  

  const dot = svg
     .selectAll("circle")
     .data(filteredData, d => d.Name)
     .join(
  //     enter => enter, // + HANDLE ENTER SELECTION
        enter =>
         // enter selections -- all data elements that don't have a `.dot` element attached to them yet
         enter
           .append("circle")
           .attr("class", "dot") // Note: this is important so we can identify it in future updates
           .attr("stroke", "grey")
           .attr("opacity", 0.9)
           .attr("fill", d => {
             if (d.ChangethisYear > 0){
              return ctyPosScale(d.ChangethisYear * 4 /d3.max(state.data, d => d.ChangethisYear))
             }
               return ctyNegScale(d.ChangethisYear * 1.5 /d3.min(state.data, d => d.ChangethisYear))
           }
           )
           .attr("r", radius)
           .attr("cy", margin.top)
           .attr("cx", d => xScale(d.NetWorth)) // initial value - to be transitioned
           .call(enter =>
             enter
               .transition() // initialize transition
               .delay(d => 3 * d.NetWorth) // delay on each element
               .duration(500) // duration 500ms
               .attr("cy", d => yScale(d.ChangethisYear))
          ),
        update => 
          update.call(update =>
              // update selections -- all data elements that match with a `.dot` element
              update
                .transition()
                .duration(250)
                .attr("stroke", "blue"
                )
                .transition()
                .duration(250)
                .attr("fill", "blue")
                .transition()
                .duration(100)
                .attr("opacity", .5)
                .attr("r",1.5*radius)
            ),
        exit => // + HANDLE EXIT SELECTION
          exit.call(exit =>
            // exit selections -- all the `.dot` element that no longer match to HTML elements
            exit
              .transition()
              .duration(250)
              .attr("fill", d => countryScale(selectionList.indexOf(d.Country)/selectionList.length))
              .transition()
              .delay(d => 3 * d.NetWorth)
              .duration(500)
              .attr("cy", width)
              .remove()
          )
     );
}
