const fetch = globalThis.fetch; // Node 18+ has built-in fetch

// Cache to avoid hitting API rate limits
let cachedScore = null;
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds

const getLiveScore = async (req, res) => {
    try {
        const apiKey = process.env.CRIC_API_KEY;
        
        // Serve from cache if fresh
        if (cachedScore && (Date.now() - lastFetchTime < CACHE_TTL)) {
            return res.json(cachedScore);
        }

        if (apiKey) {
            // Attempt to fetch from real CricAPI
            const response = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`);
            const data = await response.json();
            
            // Filter to find an Indian Premier League match
            const iplMatch = data.data?.find(m => 
                m.name.includes("IPL") || 
                m.name.includes("Indian Premier League") ||
                m.name.includes("T20") // fallback just in case
            );
            
            if (iplMatch) {
                cachedScore = {
                    teamA: iplMatch.teamInfo?.[0]?.shortname || "Team A",
                    teamB: iplMatch.teamInfo?.[1]?.shortname || "Team B",
                    scoreA: iplMatch.score?.[0] ? `${iplMatch.score[0].r}/${iplMatch.score[0].w}` : "0/0",
                    scoreB: iplMatch.score?.[1] ? `${iplMatch.score[1].r}/${iplMatch.score[1].w}` : "Yet to bat",
                    overs: iplMatch.score?.[0] ? iplMatch.score[0].o : "0.0",
                    status: iplMatch.status || "Live"
                };
            } else {
                throw new Error("No live IPL match found");
            }
        } else {
            // Simulated mock data if no API key is provided
            cachedScore = {
                teamA: "RCB",
                teamB: "GT",
                scoreA: "145/3",
                scoreB: "120/5",
                overs: "15.2",
                status: "Live"
            };
        }

        lastFetchTime = Date.now();
        res.json(cachedScore);

    } catch (error) {
        console.error("Live Score Error:", error.message);
        // Provide mock fallback data on error so UI doesn't break
        if (!cachedScore) {
            cachedScore = {
                teamA: "CSK",
                teamB: "MI",
                scoreA: "180/4",
                scoreB: "165/8",
                overs: "19.0",
                status: "Live"
            };
            lastFetchTime = Date.now();
        }
        res.json(cachedScore);
    }
};

module.exports = { getLiveScore };
