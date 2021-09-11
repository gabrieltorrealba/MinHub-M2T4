/* const members = data.results[0].members */
const senate = document.getElementById("senate")

const app = Vue.createApp({
    data() {
        return {
            party: ["D", "R", "ID"],
            members: [],
            state: "all",
            statistics: {
                democrats: [],
                republicans: [],
                independents: [],
                averageMissesVoteDemocrats: 0,
                averageMissesVoteRepublicans: 0,
                averageMissesVoteIndependents: 0,
                averageVoteWhithPartyDemocrats: 0,
                averageVoteWhithPartyRepublicans: 0,
                averageVoteWhithPartyIndependents: 0,
                leastLoyal: [],
                mostLoyal: [],
                leastEngaged: [],
                mostEngaged: []
            }
        };
    },
    created() {
        let chamber = senate ? "senate" : "house"
        const endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`
        const init = { headers: { "X-API-key": "1X9Z5PVrWAptsIdJ3DnrbeyjZoV6FtAFMEy2DzZv" } }
        
        fetch(endpoint, init)
            .then(res => res.json())
            .then(data => {
                this.members = data.results[0].members
                this.calculateStatistics(this.members)
                this.average()
                this.engaged(this.members)
                this.loyal(this.members)
                this.addValue(this.members)
            })
            .catch(err => console.error(err.message))
    },
    methods: {
        calculateStatistics(array) {
            this.statistics.democrats = array.filter(member => member.party === "D")
            this.statistics.republicans = array.filter(member => member.party === "R")
            this.statistics.independents = array.filter(member => member.party === "ID")
        },
        average() {
            let functionAverageVote = function (array, string) {
                if (string === "missed") {
                    let reduceParty = array.reduce((average, menber) => {
                        return average += menber.missed_votes
                    }, 0)
                    reduceParty = parseFloat((reduceParty / array.length).toFixed(2))
                    return reduceParty
                }
                if (string === "party") {
                    let reduceParty = array.reduce((average, menber) => {
                        return average += menber.votes_with_party_pct
                    }, 0)
                    reduceParty = parseFloat((reduceParty / array.length).toFixed(2))
                    return reduceParty
                }
            }

            this.statistics.averageMissesVoteDemocrats = functionAverageVote(this.statistics.democrats, "missed")
            this.statistics.averageMissesVoteRepublicans = functionAverageVote(this.statistics.republicans, "missed")
            this.statistics.averageMissesVoteIndependents = functionAverageVote(this.statistics.independents, "missed")

            this.statistics.averageVoteWhithPartyDemocrats = functionAverageVote(this.statistics.democrats, "party")
            this.statistics.averageVoteWhithPartyRepublicans = functionAverageVote(this.statistics.republicans, "party")
            this.statistics.averageVoteWhithPartyIndependents = functionAverageVote(this.statistics.independents, "party")
        },
        engaged(array) {
            let membersFilteredLeast = array.filter(member => member.total_votes > 0)
            let ordenateLeast = membersFilteredLeast.sort((a, b) => {
                if (a.missed_votes_pct < b.missed_votes_pct) {
                    return 1
                }
                if (a.missed_votes_pct > b.missed_votes_pct) {
                    return -1
                } return 0
            })
            let tenPctLeast = Math.ceil(ordenateLeast.length * 0.1)
            let valuePctLeast = ordenateLeast[tenPctLeast - 1]
            let valuePctFilterLeast = ordenateLeast.filter(menber => menber.missed_votes_pct >= valuePctLeast.missed_votes_pct)
            this.statistics.leastEngaged = valuePctFilterLeast

            let membersFilteredMost = array.filter(member => member.total_votes > 0)
            let ordenateMost = membersFilteredMost.sort((a, b) => {
                if (a.missed_votes_pct < b.missed_votes_pct) {
                    return -1
                }
                if (a.missed_votes_pct > b.missed_votes_pct) {
                    return 1
                } return 0
            })
            let tenPctMost = Math.ceil(ordenateMost.length * 0.1)
            let valuePctMost = ordenateMost[tenPctMost - 1]
            let valuePctFilterMost = ordenateMost.filter(menber => menber.missed_votes_pct <= valuePctMost.missed_votes_pct)
            this.statistics.mostEngaged = valuePctFilterMost
        },
        loyal(array) {
            let membersFilteredLeast = array.filter(member => member.total_votes > 0)
            let ordenateLeast = membersFilteredLeast.sort((a, b) => {
                if (a.votes_with_party_pct < b.votes_with_party_pct) {
                    return -1
                }
                if (a.votes_with_party_pct > b.votes_with_party_pct) {
                    return 1
                } return 0
            })
            let tenPctLeast = Math.ceil(ordenateLeast.length * 0.1)
            let valuePctLeast = ordenateLeast[tenPctLeast - 1]
            let valuePctFilterLeast = ordenateLeast.filter(menber => menber.votes_with_party_pct <= valuePctLeast.votes_with_party_pct)

            this.statistics.leastLoyal = valuePctFilterLeast

            let membersFilteredMost = array.filter(member => member.total_votes > 0)
            let ordenateMost = membersFilteredMost.sort((a, b) => {
                if (a.votes_with_party_pct < b.votes_with_party_pct) {
                    return 1
                }
                if (a.votes_with_party_pct > b.votes_with_party_pct) {
                    return -1
                } return 0
            })
            let tenPctMost = Math.ceil(ordenateMost.length * 0.1)
            let valuePctMost = ordenateMost[tenPctMost - 1]
            let valuePctFilterMost = ordenateMost.filter(menber => menber.votes_with_party_pct >= valuePctMost.votes_with_party_pct)

            this.statistics.mostLoyal = valuePctFilterMost
        },
        addValue(array) {
            let memberFilter = array.filter(menber => menber.total_votes > 0)
            memberFilter.forEach(i => {
                let vote = Math.round((i.total_votes - i.missed_votes) * i.votes_with_party_pct / 100)
                i['voteParty'] = vote
            })

        }
    },

    computed: {
        filteredMembers() {
            let filtered = []
            filtered = this.members.filter(member => this.party.includes(member.party) && (member.state === this.state || this.state === "all"))
            return filtered
        }
    }
})

let appMount = app.mount("#app")