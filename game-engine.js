 // Define card data
 const cardsData = [
    { Year: 1964, Description: "President Lyndon B. Johnson signs Civil Rights Act into law, preventing employment discrimination due to race, color, sex, religion or national origin." },
    { Year: 1954, Description: "Brown v. Board of Education, a consolidation of five cases into one, is decided by the Supreme Court, effectively ending racial segregation in public schools." },
    { Year: 1955, Description: "Rosa Parks refuses to give up her seat to a white man on a Montgomery, Alabama bus. Her defiant stance prompts a year-long Montgomery bus boycott." },
    { Year: 1963, Description: "Martin Luther King Jr. delivers his 'I Have a Dream' speech during the March on Washington for Jobs and Freedom." },
    { Year: 1965, Description: "Selma to Montgomery marches, pivotal in the American civil rights movement, highlight the demand for African American voting rights." },
    { Year: 1961, Description: "Ruby Bridges is escorted by four armed federal marshals as she becomes the first student to integrate William Frantz Elementary School in New Orleans." },
    { Year: 1968, Description: "President Lyndon B. Johnson signs the Fair Housing Act into law, providing equal housing opportunity regardless of race, religion or national origin." }
];

document.addEventListener('DOMContentLoaded', function() {
    // Prompt user to choose between random or hardcoded tick values
    let useRandomTicks = confirm("Would you like to generate random tick values? Click 'OK' for yes or 'Cancel' for no.");

    if (useRandomTicks) {
        // Generate random tick dates between 1952 to 1970
        generateRandomTickDates(5, 1952, 1970);
    }
});

function generateRandomTickDates(numberOfTicks, startYear, endYear) {
    let tickYears = new Set();  // Use a Set to store unique years

    // Generate random years within the specified range
    while (tickYears.size < numberOfTicks) {
        let randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        tickYears.add(randomYear);
    }

    // Convert the Set to an array and sort years in ascending order
    const sortedTickYears = Array.from(tickYears).sort((a, b) => a - b);

    // Assign years to the tick containers
    $('.tick-container .tick-text').each(function(index, element) {
        if (index < sortedTickYears.length) { // To prevent index out of bounds if there are more containers than years
            $(element).text(sortedTickYears[index]);
        }
    });
}


$(document).ready(function() {

    let hasMovedHandCard = false; 
    let hasMovedLaneCard = false;
    const handIndices = shuffleArray([...Array(cardsData.length).keys()]).slice(0, 5);
    let hand = handIndices.map(index => cardsData[index]);
    const tickContainers = $('.tick-container');
    const shuffledIndices = shuffleArray([...Array(tickContainers.length).keys()]);

    let turn = 0;
    revealTickAndLanes(shuffledIndices[turn]);
    turn++;

    // Create and append the cards using the card data
    hand.forEach(function(cardData, index) {
        let card = $(`<div class="card p-1" id="card${index}" year="${cardData.Year}">${cardData.Description}</div>`);
        $('#cards-container').append(card);
    });

    // Set the draggable attribute and event handlers for the cards in hand
    $('.card').attr('draggable', 'true').on('dragstart', function(event) {
        if (hasMovedHandCard) {
            event.preventDefault(); // Prevent dragging if a hand card has been moved this turn
        } else {
            event.originalEvent.dataTransfer.setData('text/plain', event.target.id);
        }
    });

    // Allow lanes to be drop targets for hand cards
    $('.lane').on('dragover', function(event) {
        if (!hasMovedHandCard) {
            event.preventDefault();
        }
    });

    $('.lane').on('drop', function(event) {
        if (!hasMovedHandCard) {
            event.preventDefault();
            let id = event.originalEvent.dataTransfer.getData('text');
            let card = document.getElementById(id);
            if (card && $(card).closest('#cards-container').length > 0) { // Ensure it's a hand card
                event.target.appendChild(card);
                hasMovedHandCard = true; // Mark that a hand card has been moved
            }
        }
    });

    // Set the draggable attribute for lane cards
    $('.lane .card').attr('draggable', 'true').on('dragstart', function(event) {
        if (hasMovedLaneCard) {
            event.preventDefault(); // Prevent dragging if a lane card has been moved this turn
        } else {
            event.originalEvent.dataTransfer.setData('text/plain', event.target.id);
        }
    });

    // Allow lanes to be drop targets for lane cards
    $('.lane').on('dragover', function(event) {
        if (!hasMovedLaneCard) {
            event.preventDefault();
        }
    });

    $('.lane').on('drop', function(event) {
        if (!hasMovedLaneCard) {
            event.preventDefault();
            let id = event.originalEvent.dataTransfer.getData('text');
            let card = document.getElementById(id);
            if (card && $(card).closest('.lane').length > 0) { // Ensure it's a lane card
                event.target.appendChild(card);
                hasMovedLaneCard = true; // Mark that a lane card has been moved
            }
        }
    });

    console.log(tickContainers)
    console.log(shuffledIndices)

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    



    function revealTickAndLanes(index) {
        // Display the current tick
        $(tickContainers[index]).css('display', 'flex');

    }



    function nextTurn() {
        console.log("Clicked " + turn);
        if (turn < shuffledIndices.length) {
            
            revealTickAndLanes(shuffledIndices[turn]);
            turn++;
            
            hasMovedHandCard = false; 
            hasMovedLaneCard = false; 
            if (turn === tickContainers.length) { // Check if this is the last turn
                $('#turnBtn').text('Finish'); // Change button text to "Finish"
            }
        } else {
            $('#turnBtn').prop('disabled', true);
            let results = calculateScores(); // Calculate scores at the end of turns
            displayScores(results); // Pass the scores for display
        }
    }


    function calculateScores() {
        const lanes = $('.lane');
        let scores = [];
    
        lanes.each(function(index, lane) {
            let cards = $(lane).find('.card');
            let score = 0; // Initialize score for each lane
    
            // Check if the lane has a previous tick container
            let hasPreviousTick = $(lane).prev('.tick-container').length > 0;
            let hasNextTick = $(lane).next('.tick-container').length > 0;
    
            let previousTickYear = hasPreviousTick ? 
                parseInt($(lane).prev('.tick-container').find('.tick-text').text()) : null;
            let nextTickYear = hasNextTick ? 
                parseInt($(lane).next('.tick-container').find('.tick-text').text()) : null;
    
            cards.each(function(idx, card) {
                let cardYear = parseInt($(card).attr('year'));
                let cardScored = false; // Flag to determine if the card is scored
                
                // If it's the leftmost lane, only check if the card year is less than the next tick year
                if (!hasPreviousTick && cardYear < nextTickYear) {
                    score += 1;
                    cardScored = true;
                }
                // If it's the rightmost lane, only check if the card year is greater than or equal to the previous tick year
                else if (!hasNextTick && cardYear >= previousTickYear) {
                    score += 1;
                    cardScored = true;
                }
                // Otherwise, check if the card is between the two ticks
                else if (cardYear >= previousTickYear && cardYear < nextTickYear) {
                    score += 1;
                    cardScored = true;
                }
    
                if (cardScored) {
                    $(card).addClass('correct');
                } else {
                    $(card).addClass('incorrect');
                }
            });
    
            scores.push(score); // Append score for this lane
        });
    
        return scores;
    }
    

    function displayScores(scores) {
        let totalScore = scores.reduce((acc, score) => acc + score, 0); 
        let scoreText = 'Total Score: ' + totalScore + '\n'; 

        scores.forEach(function(score, index) { 
            scoreText += 'Lane ' + (index + 1) + ': ' + score + ' points;\n';
        });

        $('.card').each(function() {
            $(this).addClass('show-year')
        });

        setTimeout(function() {
            alert(scoreText); 
        }, 100); 
    }

    $('#turnBtn').on('click', nextTurn);
});
