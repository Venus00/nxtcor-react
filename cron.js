// const cron = require('node-cron');
// import cron from 'node-cron'
// Example data
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['00-02', '02-04', '04-06', '06-08', '08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-00'];
const checkedState = [[true, true, false, false, false, false, false, false, false, false, false, false],
[true, false, false, false, false, false, true, false, false, true, true, false],
[true, true, true, true, false, false, false, true, true, false, false, false],
[true, false, false, false, false, true, false, true, true, false, false, false],
[true, false, false, false, false, true, false, false, true, true, false, false],
[true, false, false, false, false, false, false, false, false, false, false, false],
[true, true, false, false, false, false, false, false, false, false, false, false]
]

// Convert `checkedState` into cron expressions
const convertCheckedStateToCronExpressions = (checkedState, daysOfWeek, timeSlots) => {
    const cronExpressions = [];

    checkedState.forEach((dayState, dayIndex) => {
        dayState.forEach((isChecked, timeIndex) => {
            if (isChecked) {
                const timeSlot = timeSlots[timeIndex];
                const [startHour] = timeSlot.split('-');

                // Cron expression for the start hour of the time slot
                // This example assumes that dayIndex is a 0-based index for days (0=Monday, ..., 6=Sunday)
                cronExpressions.push(`0 ${startHour} * * ${dayIndex + 1}`);
            }
        });
    });

    return cronExpressions;
};

// Function to simulate a task
const task = () => {
    console.log('Running scheduled task');
};

// Generate cron expressions based on `checkedState`
const cronExpressions = convertCheckedStateToCronExpressions(checkedState, daysOfWeek, timeSlots);

// Schedule tasks
// cronExpressions.forEach(expression => {
//     cron.schedule(expression, task);
// });

console.log('Cron jobs scheduled:', cronExpressions);
