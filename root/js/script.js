document.addEventListener("DOMContentLoaded", function () {

    //make infocards
    let infocard1 = new InfoCard("#info_card1", "song");

    let infocard2 = new InfoCard("#info_card2");

    //add eventlisteners to the radiobuttons
    d3.selectAll("input[name='radio1']").on("change", function(){
        infocard1.setType(this.value)
        //TODO update spiderchart
    });

    d3.selectAll("input[name='radio2']").on("change", function(){
        infocard2.setType(this.value)
        //TODO update spiderchart
    });

    // Search bar dropdown elements
    const searchInput1 = d3.select('#searchInput1');
    const dropdownContent1 = d3.select('#dropdownContent1');
    const searchContainer1 = d3.select('#compare_search_select1');
    const searchInput2 = d3.select('#searchInput2');
    const dropdownContent2 = d3.select('#dropdownContent2');
    const searchContainer2 = d3.select('#compare_search_select2');


    // Add event listeners fo dropdown search bar
    searchInput1.on('keydown', function(){updateDropdown(searchInput1, dropdownContent1)});
    searchInput1.on('click', function(){updateDropdown(searchInput1, dropdownContent1)});
    searchInput2.on('keydown', function(){updateDropdown(searchInput2, dropdownContent2)});
    searchInput2.on('click', function(){updateDropdown(searchInput2, dropdownContent2)});
    
    // Close the dropdowns when clicking outside the search container
    d3.select("body").on('click', function(event) {
        if (!searchContainer1.node().contains(event.target)) {
            dropdownContent1.style('display', 'none');
        }
        if (!searchContainer2.node().contains(event.target)) {
            dropdownContent2.style('display', 'none');
        }
    });

});

// Function to update the dropdown based on the search input
function updateDropdown(searchInput, dropdownContent) {
    const dataSet = ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Lemon', 'Orange','Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Lemon', 'Orange'];
    const searchTerm = searchInput.property('value').toLowerCase();
    const filteredData = dataSet.filter(item => item.toLowerCase().includes(searchTerm));

    // Clear previous items
    dropdownContent.html('');

    // Add filtered items to the dropdown
    filteredData.forEach(item => {
        const dropdownItem = dropdownContent.append('div')
            .classed('dropdown-item', true)
            .text(item);

        dropdownItem.on('click', () => {
            searchInput.property('value', item);
            dropdownContent.style('display', 'none');
        });
    });

    // Show/hide the dropdown based on the search input
    if (filteredData.length > 0) {
        dropdownContent.style('display', 'block');
    } else {
        dropdownContent.style('display', 'none');
    }
}