
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

// Initialize webpage
function init() {

    // Populate dropdown menu
    otuData.names.map(name => {
        let option = dropdownMenu.append('option');
        option.text(name);
    })

    // Horizontal bar chart
    trace = {
        x: otuData.samples[0].sample_values.slice(0, 11),
        y: otuData.samples[0].otu_ids.slice(0, 11).map(id => `OTU-${id}`),
        text: otuData.samples[0].otu_labels.slice(0, 11),
        type: 'bar',
        orientation: 'h',
        transforms: [{
            type: 'sort',
            target: 'x',
            order: 'ascending'
        }]
    };
    Plotly.newPlot('bar', [trace]);

    // Bubble chart

    // Demographics
    const metadata = otuData.metadata[0];
    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`)
    }
}

// Update function based on dropdown selection
function optionChanged(id) {
    const sampleData = otuData.samples.filter(item => item.id === id)[0];

    // Update horizontal bar chart
    let x = sampleData.sample_values.slice(0, 11);
    let y = sampleData.otu_ids.slice(0, 11).map(id => `OTU-${id}`);
    let text = sampleData.otu_labels.slice(0, 11);
    Plotly.update('bar', {x:[x], y:[y], text:[text]});

    // Update bubble chart
    
    // Update demographics
    const metadata = otuData.metadata.filter(item => item.id === parseInt(id))[0];
    metaDataBox.html(null);
    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`)
    }
}

dataPromise.then(() => init());