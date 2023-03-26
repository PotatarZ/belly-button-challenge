
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
        x: samplesData.sample_values.slice(0, 11),
        y: samplesData.otu_ids.slice(0, 11).map(id => `OTU-${id}`),
        text: samplesData.otu_labels.slice(0, 11),
        type: 'bar',
        orientation: 'h',
        transforms: [{
            type: 'sort',
            target: 'x',
            order: 'ascending'
        }]
    };
    Plotly.newPlot('bar', [barTrace]);

    // Bubble chart
    bubbleTrace = {
        x: samplesData.otu_ids,
        y: samplesData.sample_values,
        text: samplesData.otu_labels,
        mode: 'markers',
        marker: {
            size: samplesData.sample_values,
            color: samplesData.otu_ids
        }
    };
    Plotly.newPlot('bubble', [bubbleTrace]);

    // Demographics
    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`)
    }
}

// Update function based on dropdown selection
function optionChanged(id) {

    // Current data based on id selected
    const sampleData = otuData.samples.filter(item => item.id === id)[0];
    const metadata = otuData.metadata.filter(item => item.id === parseInt(id))[0];

    // Update horizontal bar chart
    let barX = sampleData.sample_values.slice(0, 11);
    let barY = sampleData.otu_ids.slice(0, 11).map(id => `OTU-${id}`);
    let barText = sampleData.otu_labels.slice(0, 11);
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
        p.text(`${key}: ${value}`)
    }
}

// Initialize after dataPromise if fulfilled
dataPromise.then(() => init());