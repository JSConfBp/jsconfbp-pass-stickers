
const apiHeaders = {
  "Accept": "application/json",
  "Authorization": `Token token=${process.env.TITO_API_TOKEN}`
}



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

const ticketGenerator = async function *() {
    let page = 1

    while (page !== null) {
        console.log(`Loading tickets, page ${page} ...`)
        let data = await api(`https://api.tito.io/v3/jsconf-bp/jsconf-budapest-2024/tickets?page=${page}`, {
            headers: apiHeaders
        })
        
        page = data.meta.next_page
        yield data.tickets
    }
}

export default async function handler(req, res) {
    if (req.method === 'GET') {    
      try {
        const { reference } = req.query

        const ref = reference.toUpperCase()
        
        const tickets = ticketGenerator()
        
        let foundTicket
        for await (let list of tickets) {
            foundTicket = list.find(ticket => ticket.reference === ref)
            if (foundTicket) break;
        }

        if (!foundTicket) {
            res.status(404).send();
            return
        }
        
        const { slug } = foundTicket

        let response = await fetch(`https://api.tito.io/v3/jsconf-bp/jsconf-budapest-2024/tickets/${slug}`, {
          headers: apiHeaders
        })
      
        const {
          ticket: {
            first_name,
            last_name,
          }
        } = await response.json()

        res.status(200).json({
          first_name,
          last_name
        });

      } catch (e) {
        console.error(e);
        res.status(503).json({ error: e });
      }
    } else {
      res.status(404).send();
    }
  }
  