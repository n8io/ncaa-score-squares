import config from './config.json' assert { type: 'json' };

const { dates } = config

const STATUS_FINAL = 'STATUS_FINAL'

const getDateEvents = async (date) => {
  const data = await fetch(
    `https://site.web.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?region=us&lang=en&contentorigin=espn&limit=300&calendartype=offdays&includeModules=videos&dates=${date}&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true`,
    {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://www.espn.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    }
  ).then((r) => r.json()).then(({ events }) => events.filter(({ status }) => status?.type?.name === STATUS_FINAL))
  
  return data
}

const getAllEventDays = async () => Promise.all(dates.map(getDateEvents))

export { getAllEventDays }