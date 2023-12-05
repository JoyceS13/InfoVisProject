document.addEventListener("DOMContentLoaded", function () {

    //make infocards
    let infocard1 = new InfoCard("#info_card1", "song");

    let infocard2 = new InfoCard("#info_card2");

    // Get the radio buttons by name
    const radioButtons1 = document.getElementsByName('radio1');

    // Add event listener to each radio button
    radioButtons1.forEach(radioButton => {
        radioButton.addEventListener('change', function() {
            if (this.checked) {
                //update corresponding infocard
                infocard1.setType(this.value)
                //TODO update spiderchart
            }
        });
    });

    // Get the radio buttons by name
    const radioButtons2 = document.getElementsByName('radio2');

    // Add event listener to each radio button
    radioButtons2.forEach(radioButton => {
        radioButton.addEventListener('change', function() {
            if (this.checked) {
                //update corresponding infocard
                infocard2.setType(this.value)
                //TODO update spiderchart
            }
        });
    });

});