/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5,
  default_selection = "Select a Class";

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colorScale;
let classes;
let colors;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: null, 
  oldSelection: null
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv('../data/US_income_inequality_removed_index.csv', d => ({
  year: new Date(d.Year, 0, 1),
  class: d.Class,
  percentWealth: parseFloat(d.WealthPercent)
})).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.percentWealth))
    .range([height - margin.bottom, margin.top]);
    
    // + AXES
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
  // Coloration
  classes = [...Array.from(new Set(state.data.map(d => d.class)))]
  colors = ['complement-4','complement-3','complement-2','complement-1','primary-1','primary-2','primary-3','primary-4']
  colorScale = d3
    .scaleOrdinal()
    .domain(classes)
    .range(colors.reverse())
  
  classes.push(default_selection)  
  // + UI ELEMENT SETUP


  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selection = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(
      classes) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d.class)
    .text(d => d);

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  selectElement.property("value", default_selection);
  
  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // + CALL AXES
  //x-axis
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year");

  //y-axis
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Percent overall wealth");
  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData;
  if (state.selection !== null) {
    filteredData = state.data.filter(d => d.class === state.selection);
  } 
  fill = colorScale(state.selection)
  console.log(fill)
  
  const areaFunc = d3
    .area()
    .x(d=> xScale(d.year))
    .y0(yScale(0))
    .y1(d => yScale(d.percentWealth))
    
  
  const dot = svg
  .selectAll(".dot")
  .data(filteredData, d => d.year) // use `d.year` as the `key` to match between HTML and data elements
  .join(
    enter =>
      // enter selections -- all data elements that don't have a `.dot` element attached to them yet
      enter
        .append("circle")
        .attr("class", "dot "+ fill) // Note: this is important so we can identify it in future updates
        .attr("r", radius)
        .attr("cy", height - margin.bottom) // initial value - to be transitioned
        .attr("cx", d => xScale(d.year)),
    update => update
    .attr("class", "dot "+ fill),
    exit =>
      exit.call(exit =>
        // exit selections -- all the `.dot` element that no longer match to HTML elements
        exit
          .transition()
          .delay(d => d.year)
          .duration(500)
          .attr("cy", height - margin.bottom)
          .remove()
      )
  )
  // the '.join()' function leaves us with the 'Enter' + 'Update' selections together.
  // Now we just need move them to the right place
  .call(
    selection =>
      selection
        .transition() // initialize transition
        .duration(1000) // duration 1000ms / 1s
        .attr("cy", d => yScale(d.percentWealth)) // started from the bottom, now we're here
  );

  const area = svg
    .selectAll("path.area")
    .data([filteredData], d=>d.year)
    .join(
      enter =>
        enter
          .append("path")
          .attr("class",  "area " + fill)
          .attr("opacity", 0), // start them off as opacity 0 and fade them in
      update => update
      .attr("class", "area "+ fill),
         // pass through the update selection
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(1000)
        .attr("opacity", .7)
        .attr("d", d => areaFunc(d))
        
    );
}

