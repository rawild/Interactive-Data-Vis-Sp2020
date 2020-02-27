/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5,
  default_selection = "Select a Class",
  classes= ['Top 1%','Next 4%','Next 5%','Next 10%','Upper-Middle 20%','Middle 20%','Middle 20%','Lower-Middle 20%','Lowest 20%'];

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colorScale;
let colors;

/* APPLICATION STATE */
let state = {
  data: [],
  rawData: [],
  selection: null, 
  oldSelection: null
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv('../data/US_income_inequality.csv', d => ({
  year: new Date(d.Year, 0, 1),
  'Top 1%': parseFloat(d['Top 1.0%']),
  'Next 4%': parseFloat(d['Next 4.0%']),
  'Next 5%': parseFloat(d['Next 5.0%']),
  'Next 10%': parseFloat(d['Next 10.0%']),
  'Upper-Middle 20%': parseFloat(d['Upper-Middle 20.0%']),
  'Middle 20%': parseFloat(d['Middle 20.0%']),
  'Lower-Middle 20%': parseFloat(d['Lower-Middle 20.0%']),
  'Lowest 20%': parseFloat(d['Lowest 20%'])
})).then(raw_data => {let stack = d3.stack().keys(classes).order(d3.stackOrderAscending)
  state.rawData = raw_data

  state.data = stack(raw_data)
  console.log(state.data)
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.rawData, d => d.year))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([d3.min(state.rawData, d=>d['Lowest 20%']),100])
    .range([height - margin.bottom, margin.top]);

    // + AXES
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
  // Coloration
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
    .attr("value", d =>d)
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
    .text("Percent of Overall Wealth");
  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData = state.data
  /*if (state.selection !== null) {
    filteredData = state.data.filter(d => d.class === state.selection);
  } 
  */
 
 
  
  const areaFunc = d3
    .area()
    .x(d=> xScale(d.data.year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))
    
  console.log(filteredData)
  /*const dot = svg
  .selectAll(".dot")
  .data(filteredData, d => d.key) // use `d.year` as the `key` to match between HTML and data elements
  .join(
    enter =>
      // enter selections -- all data elements that don't have a `.dot` element attached to them yet
      enter
        .append("circle")
        .attr("class", "dot "+ fill) // Note: this is important so we can identify it in future updates
        .attr("r", radius)
        .attr("cy", height - margin.bottom) // initial value - to be transitioned
        .attr("cx", d => xScale(d.data.year)),
    update => update
    .attr("class", "dot "+ fill),
    exit =>
      exit.call(exit =>
        // exit selections -- all the `.dot` element that no longer match to HTML elements
        exit
          .transition()
          .delay(d => d.data.year)
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
        .attr("cy", d => yScale(d[1])) // started from the bottom, now we're here
  );*/

  const area = svg
    .selectAll("path.area")
    .data(filteredData, d=>d.key)
    .join("path")
        .attr("class",  d=> "area " + colorScale(d.key))
        .attr("opacity", 0.7) // start them off as opacity 0 and fade them in
        .attr("d", areaFunc)
        
  
}



