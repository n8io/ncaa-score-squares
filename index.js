import config from './config.json' assert { type: 'json' };
import { getAllEventDays } from './data.js'

const { payouts: configPayouts } = config

const { WHOM: whom = 'nate' } = process.env
const numbers = await import(`./numbers/${(whom ?? '').trim().toLowerCase()}.json`, { assert: { type: 'json' } }).then(({ default: d }) => d)
const allEventDays = await getAllEventDays()

const sortByDateAscending = ({ date: a }, { date: b }) => a - b
const sortByWinnerFirst = ({ winner: a }, { winner: b }) => a ? -1 : b ? 1 : 0

const winningsMap = configPayouts.map(([ , , payout]) => payout)
const winningsRanges = configPayouts.map(([start, end]) => [start, end])

const winningIndexesToPayouts = (indexes) => indexes.map((index) => {
  const payoutIndex = winningsRanges.findIndex(([bottom, top]) => index >= bottom && index <= top)

  return winningsMap[payoutIndex]
})

console.log(winningsMap)
console.log(winningIndexesToPayouts)

const getDayWinners = (events) => {
  const games = events.map(({ competitions }) => {
    return competitions.map(({ competitors, date }) => {
      return {
        date: new Date(date),
        teams: competitors.map(({ id, score, team, winner }) => {
          return {
            id,
            name: team.displayName,
            score: Number(score),
            lastDigit: Number(score.at(-1)),
            winner,
          }
        }).sort(sortByWinnerFirst)
      }
    })
  }).flat(1).sort(sortByDateAscending)
  
  const outcomes = games.map(({ teams }) => [teams[0].lastDigit, teams[1].lastDigit, teams[0].id])
  
  const matchupLookup = games.reduce((acc, { teams }) => ({
    ...acc,
    [teams[0].id]: teams,
  }), {})
  
  const hitMap = numbers.reduce((acc, [w, l]) => ({
    ...acc,
    [w]: { [l]: true },
  }), {})
  
  // console.log('games', JSON.stringify(games, null, 2))
  // console.log('outcomes', outcomes)
  
  const isWinner = ([w, l]) => hitMap[w]?.[l]
  const wins = outcomes.filter(isWinner)
  const indexes = outcomes.map((outcome, index) => isWinner(outcome) ? index : undefined).filter(Boolean)
  
  const text = wins
    .map(([w, l, id]) => [w, l, matchupLookup[id]])
    .map(([w, l, [winner, loser]]) => `[${w}, ${l}] ${winner.name} ${winner.score} / ${loser.score} ${loser.name}`)
    .join('\n')

  return {
    hasWinners: Boolean(indexes.length),
    indexes,
    text,
  }
}

const hasWinnings = ({ hasWinners }) => hasWinners
const events = allEventDays.map(getDayWinners)
const winnings = events.filter(hasWinnings)
const winningIndexes = winnings.map(({ indexes }) => indexes).flat(1)

// console.log(events)
// console.log(winningIndexes)

const payouts = winningIndexesToPayouts(winningIndexes)
const totalWinnings = payouts.reduce((acc, payout) => acc + payout, 0)

console.log(``)
console.log(`#️⃣  Your numbers are: ${numbers.map((winnerLoserNumbers) => `\n  - [${winnerLoserNumbers.join(', ')}]`).join('')}`)
console.log(``)
console.log(`🏀 Out of ${allEventDays.flat().length} chances...`)

if (winnings.length) {
  console.log('')
  console.log(`💰 You've won $${totalWinnings.toFixed(2)}:\n  - ${payouts.map(p => `$${p.toFixed(2)}`).join('\n  - ')}`)
  console.log('')
  console.log(winnings.map(({ text }) => text).join('\n'))
} else {
  console.log(`😢 You've won nothing you fucking loser`)
}

console.log('')