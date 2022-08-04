class DentistScheduler {
    constructor(configuration) {
        this.getAvailability = async () => {
            const response = await fetch(configuration.SchedulerEndpoint + "/availability")
            const times = await response.json()
            let responseText = `Current time slots available: `
            times.map(time => {
                responseText += `
${time}`
            })
            return responseText
        }

        this.scheduleAppointment = async (time) => {

            // print the variable time to the console with a message
            console.log(` **** Scheduling an appointment for ${time} ****`)

            const response = await fetch(configuration.SchedulerEndpoint + "/schedule", { method: "post", body: { time: time } })
            // const response = await fetch(configuration.SchedulerEndpoint , { method: "post", body: { time: time } })
            let responseText = `An appointment is set for ${time}.`
            return responseText
        }
    }
}

module.exports = DentistScheduler