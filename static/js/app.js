
// Use the D3 library to read in samples.json
const url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';
const dataPromise = d3.json(url);

// Log and store retrieved data
let otuData;
dataPromise.then(data => {
    console.log(data);
    otuData = data;
})

// Make d3 selections for important elements
const metaDataBox = d3.select('#sample-metadata');
const dropdownMenu = d3.select('#selDataset');

// Function for getting arrowTip location for gauge
function getAngle(wfreq) {
    var theta = 180 - 180 / 9 * wfreq
    var r = 0.35
    var x_head = r * Math.cos(Math.PI/180*theta)
    var y_head = r * Math.sin(Math.PI/180*theta)
    return [x_head, y_head]
}

// Initialize charts and dropdown menu
function init() {

    // Populate dropdown menu
    otuData.names.map(name => {
        let option = dropdownMenu.append('option');
        option.text(name);
    })

    // Initial test subject's data
    const samplesData = otuData.samples[0];
    const metadata = otuData.metadata[0];

    // Horizontal bar chart
    barTrace = {
        x: samplesData.sample_values.slice(0, 10),
        y: samplesData.otu_ids.slice(0, 10).map(id => `OTU-${id}`),
        text: samplesData.otu_labels.slice(0, 10),
        type: 'bar',
        orientation: 'h',
        transforms: [{
            type: 'sort',
            target: 'x',
            order: 'ascending'
        }]
    };
    barLayout = {
        title: 'Top Ten Bacteria'
    };
    Plotly.newPlot('bar', [barTrace], barLayout);

    // Bubble chart
    bubbleTrace = {
        x: samplesData.otu_ids,
        y: samplesData.sample_values,
        text: samplesData.otu_labels,
        mode: 'markers',
        marker: {
            size: samplesData.sample_values,
            color: samplesData.otu_ids,
            colorscale: 'Earth'
        }
    };
    bubbleLayout = {
        xaxis: { title: {text: 'OTU id'}}
    }
    Plotly.newPlot('bubble', [bubbleTrace], bubbleLayout);

    // Demographics
    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`)
    }

    // Washings guage
    function getSteps() {
        let steps = [];
        for (j=0; j<9; j++) {
            let range = [j, j+1];
            let color = `rgb(${230 - j*30}, ${j*30}, 0)`;
            let step = {range:range, color:color};
            steps.push(step);
        }
        return steps;
    };

    let washTrace = {
        domain: {x: [0, 1], y: [0, 1]},
        value: metadata.wfreq,
        title: {text: 'Belly Button Scrubs per Week'},
        type: 'indicator',
        mode: 'gauge',
        gauge: {
            axis: {
                range: [null, 9],
                tickmode: 'linear',
                ticks: 'inside',
                ticklabelstep: 1
            },
            steps: getSteps(),
            bar: {thickness:0},
        },
    }

    var arrowTip = getAngle(metadata.wfreq)

    let washLayout = {
        xaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
        yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
        showlegend: false,
        annotations: [{
            ax: 0.5,
            ay: 0.25,
            axref: 'x',
            ayref: 'y',
            x: 0.5+arrowTip[0],
            y: 0.25+arrowTip[1],
            xref: 'x',
            yref: 'y',
            showarrow: true,
            arrowhead: 9,
        }]
    }
    Plotly.newPlot('gauge', [washTrace], washLayout)
}

// Update function based on dropdown selection
function optionChanged(id) {

    // Current data based on id selected
    const sampleData = otuData.samples.filter(item => item.id === id)[0];
    const metadata = otuData.metadata.filter(item => item.id === parseInt(id))[0];

    // Update horizontal bar chart
    let barX = sampleData.sample_values.slice(0, 10);
    let barY = sampleData.otu_ids.slice(0, 10).map(id => `OTU-${id}`);
    let barText = sampleData.otu_labels.slice(0, 10);
    Plotly.update('bar', {x:[barX], y:[barY], text:[barText]});

    // Update bubble chart
    let bubX = sampleData.otu_ids;
    let bubY = sampleData.sample_values;
    let bubText = sampleData.otu_labels;
    Plotly.update('bubble', {x:[bubX], y:[bubY], text:[bubText],
                             marker:{size:bubY, color:bubX}});

    // Update demographics
    metaDataBox.html(null);
    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`);
    }

    // Update gauge
    let arrowTip = getAngle(metadata.wfreq)
    Plotly.update('gauge', {value:[metadata.wfreq]}, {annotations:[{
        ax: 0.5,
        ay: 0.25,
        axref: 'x',
        ayref: 'y',
        x: 0.5+arrowTip[0],
        y: 0.25+arrowTip[1],
        xref: 'x',
        yref: 'y',
    }]})
}

// Initialize after dataPromise if fulfilled
dataPromise.then(() => init());