const fetch = globalThis.fetch; // Node 18+ has built-in fetch

// Cache to avoid hitting API rate limits
let cachedScore = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds (Mandatory Rate Limit)

const getLiveScore = async (req, res) => {
    try {
        const apiKey = process.env.CRIC_API_KEY;
        
        if (cachedScore && (Date.now() - lastFetchTime < CACHE_TTL)) {
            console.log("Using cached IPL data");
            return res.json(cachedScore);
        }

        if (apiKey) {
            const response = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`);
            const data = await response.json();
            
            // Handle API Blocking
            if (data.status === "failure") {
                throw new Error(data.reason || "Blocked by API Provider");
            }
            
            // STEP 1: DEBUG LOG
            console.log("FULL API RESPONSE:", JSON.stringify(data, null, 2));

            // STEP 2: HANDLE DIFFERENT STRUCTURES
            const matches = data.data || data.matches || [];
            
            // STEP 3: FLEXIBLE MATCHING
            const iplMatch = matches.find(m => {
                const name = (m.name || "").toLowerCase();
                const series = (m.series || "").toLowerCase();
                return name.includes("ipl") || 
                       name.includes("indian premier league") || 
                       series.includes("ipl") || 
                       series.includes("premier");
            });
            
            if (iplMatch) {
                // Check if match is actually live or in progress
                const status = (iplMatch.status || "").toLowerCase();
                const isLive = status.includes("live") || status.includes("progress") || status.includes("started");

                cachedScore = {
                    teamA: iplMatch.teamInfo?.[0]?.shortname || iplMatch.teams?.[0] || "Team A",
                    teamB: iplMatch.teamInfo?.[1]?.shortname || iplMatch.teams?.[1] || "Team B",
                    scoreA: iplMatch.score?.[0] ? `${iplMatch.score[0].r}/${iplMatch.score[0].w}` : "0/0",
                    scoreB: iplMatch.score?.[1] ? `${iplMatch.score[1].r}/${iplMatch.score[1].w}` : "Yet to bat",
                    overs: iplMatch.score?.[0] ? iplMatch.score[0].o : "0.0",
                    status: iplMatch.status || (isLive ? "Live" : "Scheduled")
                };
            } else {
                throw new Error("No live IPL match found in API response");
            }
        } else {
            throw new Error("No CRIC_API_KEY provided");
        }

        lastFetchTime = Date.now();
        res.json(cachedScore);

    } catch (error) {
        if (error.message.includes("No live IPL match")) {
            console.log("ℹ️ IPL Status: No live matches found (using fallback)");
        } else {
            console.error("❌ Live Score API Error:", error.message);
        }
        
        // STEP 4: MANDATORY FALLBACK (DEMO SCORE)
        cachedScore = {
            teamA: "CSK",
            teamB: "MI",
            scoreA: "180/4",
            scoreB: "165/8",
            overs: "19.0",
            status: "Demo Live"
        };
        lastFetchTime = Date.now();
        res.json(cachedScore);
    }
};

module.exports = { getLiveScore };
