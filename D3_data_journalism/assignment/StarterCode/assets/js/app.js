// @TODO: YOUR CODE HERE!

//use hair metal activity
var svgWidth = 960;
var svgHeight = 700;

var margin = {
    top: 30,
    right: 20,
    bottom: 100,
    left: 100
};


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "heathcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
            d3.max(censusData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    if (chosenXAxis === "poverty") {
        label = "in Poverty (%)";
    } else if (chosenXAxis === "age") {
        label = "Age (Median)";
    } else {
        label = "Household Income (Median)"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
            toolTip.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Import Data
d3.csv("./assets/data/data.csv")
    .then(function (censusData, err) {
        if (err) throw err;
        console.log(censusData);

        //var poverty = censusData.map(data => data.poverty);
        //console.log("poverty", poverty);

        // // Step 1: Parse Data/Cast as numbers
        // // ==============================
        censusData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.smokes = +data.smokes;
            data.obesity = +data.obesity;
        });

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = xScale(censusData, chosenXAxis);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d.healthcare)])
            .range([height, 0]);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);


        // Step 4: Append Axes to the chart
        // ==============================
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "20")
            .attr("fill", "blue")
            .attr("opacity", ".5");

        var bubbleTexts = svg.selectAll("text")
            .data(censusData)
            .enter()
            .append('text')
            .text(d => d.abbr)
            .attr('color', 'black')
            .attr('font-size', 15)
        


        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("population in poverty");

        var ageLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age");

        var incomeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Income");

        //y-axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Healthcare");

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(censusData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);

                    } else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function (error) {
        console.log(error);
    });