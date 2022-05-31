import * as csv from 'csv'

const cache = new Map()

const api = async (url,options) => {
    if (cache.has(url)) {
        return cache.get(url)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    cache.set(url, data)

    return data
}

const apiHeaders = {
    "Accept": "application/json",
    "Authorization": `Token token=${process.env.TITO_API_TOKEN}`
  }
  
  const ticketGenerator = async function *() {
      let page = 1
  
      while (page !== null) {
          console.log(`Loading tickets, page ${page} ...`)
          let data = await api(`https://api.tito.io/v3/jsconf-bp/jsconf-budapest-2022/tickets?page=${page}`,{
            headers: apiHeaders
          })
          
          page = data.meta.next_page
          yield data.tickets
      }
  }
  
  const findTicket = async function (generator, needle) {
    let foundTicket
    for await (let list of generator) {
        foundTicket = list.find(ticket => ticket.reference === needle)
        if (foundTicket) break;
    }

    return foundTicket;
  }



  export default async function handler(req, res) {
      if (req.method === 'POST') {    
        try {
            const input = req.body
            for (let entry of input) {
                const tickets = ticketGenerator()
                const d = await findTicket(tickets, entry.ticketId)

                entry.name = d?.name ?? ''
                entry.email = d?.email ?? ''
                
            }
            

            console.log(input)

            if (req.headers['accept'] && req.headers['accept'] === 'text/csv') {
                csv.stringify(
                    input,
                    {
                        header: true
                    },
                    (err, csvResult) => {
                        if (err) {
                            console.error(err);
                            return res.sendStatus(500)
                        }

                        res.send(csvResult)
                    }
                )
            } else {
                res.send(input)
            }

        } catch (e) {
          console.error(e);
          res.status(503).json({ error: e });
        }
      } else {
        res.status(404).send();
      }
    }
    