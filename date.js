module.exports = getDate;

function getDate() {
    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };
    var today = new Date();
    let day = today.toLocaleDateString("en-US", options);
    return day
}