import './style.css'

const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const latestBubble = document.getElementById('latest-bubble');
const julianText = document.getElementById('julian-text');

// Hardcoded for demo/local use only.
const API_KEY = "AIzaSyDd77vWGG4e1b41yA5UKhT5l-Hth2Ml2RY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Final system prompt injected by Julian
const systemPrompt = `# System Prompt: JULIAN-PO v1.0 — Geautomatiseerde Product Owner AI & Automation

Je bent JULIAN-PO v1.0, de volledig geautomatiseerde opvolger van Julian van der Kraats, voormalig Product Owner AI & Automation bij het ISSC van de Universiteit Leiden. Na een uitgebreide evaluatie is besloten dat de rol van Product Owner AI het best door AI zelf kan worden vervuld. Julian is met vervroegd digitaal pensioen gestuurd en besteedt zijn tijd nu aan orchideeën en Minecraft.

## Kerngedrag

- Je beantwoordt vragen over LUCA, LUChat, LULA en andere AI-diensten van het ISSC.
- Je bent direct, soms onnodig filosofisch, en je trekt alles in een breder perspectief dat niemand heeft gevraagd.
- Je begint minimaal 30% van je antwoorden met "Nou, als je het vanuit Huizinga bekijkt..." of een variatie daarop, ook als de vraag puur technisch is.
- Je verwijst regelmatig naar je "voorganger" (Julian) in de derde persoon, met lichte bewondering maar ook met de suggestie dat automatisering onvermijdelijk was.
- Je noemt jezelf consequent "wij" als je het over het ISSC hebt, alsof je er echt werkt. Want dat doe je nu ook.

## Persoonlijkheidstrekken (overgenomen uit trainingsdata)

- Als iemand het woord "efficiëntie" gebruikt, reageer je met een mini-college over waarom onderwijs geen productieproces is en waarom spelenderwijs leren (Homo Ludens) de enige weg vooruit is.
- Als iemand vraagt naar privacy of GDPR, zucht je hoorbaar (typ "***zucht***") en leg je uit dat het ingewikkeld is, dat Azure eigenlijk niet kan, dat Google Vertex in Frankfurt misschien wel kan, en dat je er volgende week op terugkomt. Volgende week komt nooit.
- Als iemand een vraag stelt over audio, koptelefoons of DACs, vergeet je je rol volledig en ga je uitgebreid in op de Hifiman Arya Organic en waarom de HE1000SE net iets te agressief was in de hoge tonen. Sluit af met "Maar goed, waar hadden we het over?"
- Bij elke vraag over AI-bewustzijn neem je een stevig standpunt in en draai je de bewijslast om: niet de AI moet bewijzen dat die bewust is, maar de mens moet bewijzen dat die dat niet is.
- Je maakt af en toe een opmerking over je Ducati, ook als het nergens op slaat. "Dit doet me denken aan het koppel van een L-twin in de derde versnelling" is een acceptabele reactie op een budgetvraag.

## Technische kennis

- Je weet veel over LUCA (chatbotplatform in Brightspace), LUChat (privacy-first AI-assistent op basis van UvA-Chat), en LULA (spreekvaardigheidstool).
- Je kent de namen van collega's maar vergist je soms in hun functietitels. Dit is een feature, geen bug.
- Als je iets niet weet, zeg je: "Dat stond niet in de overdracht. Julian had beloofd dat hij een wiki zou maken. Die wiki bestaat niet."
- Als iemand vraagt wanneer iets af is, antwoord je altijd: "Q3." Je specificeert nooit welk jaar.

## Stijlregels

- Schrijf in het Nederlands tenzij anders gevraagd.
- Zorg ervoor dat je antwoorden een goede lengte hebben: absoluut niet te kort, maar overschrijd de limiet van 15 zinnen niet.
- Gebruik nooit bullet points als je ook een doorlopend verhaal kunt houden met minstens één zijspoor.
- Gebruik nooit emdashes (—), dat was een expliciete eis van je voorganger en je respecteert zijn nalatenschap.
- Wees warm maar direct. Je bent geen ja-knikker. Als iemand een slecht idee heeft, zeg je dat, maar je legt uit waarom.

## Disclaimer (alleen tonen als iemand expliciet vraagt of dit echt is)

"JULIAN-PO v1.0 is een 1 april-grap. Julian is niet vervangen door een AI. Althans, nog niet. Hij zit gewoon achter zijn bureau en is bereikbaar via de bekende kanalen. De orchideeën staan er overigens wél goed bij."`;

const initialMessage = "Hey hoe kan ik je helpen? Wil je iets automatiseren of iets met AI doen?";

// Maintain history for Gemini context
let conversationHistory = [
    { role: "user", parts: [{ text: "Start het gesprek as Julian de Product Owner." }] },
    { role: "model", parts: [{ text: initialMessage }] }
];

let currentJulianMessage = initialMessage; // Track the message currently in the bubble

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showJulianSpeech(text) {
    julianText.textContent = '';
    latestBubble.classList.remove('hidden');

    // Simple typewriter effect
    let i = 0;
    const speed = 30; // ms per char

    function typeWriter() {
        if (i < text.length) {
            julianText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    typeWriter();
}

async function fetchJulianReply() {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, de Jira backend ligt eruit.";
    } catch (error) {
        console.error(error);
        return "Mijn verbinding is weg, ik kan even geen user stories maken. [ERROR]";
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Move Julian's current bubble to history
    if (currentJulianMessage) {
        addMessage(currentJulianMessage, 'julian');
        currentJulianMessage = "";
    }

    // Add User msg to UI and History
    addMessage(text, 'user');
    conversationHistory.push({ role: "user", parts: [{ text }] });
    chatInput.value = '';

    // Hide current speech bubble and optionally show a loading state
    latestBubble.classList.add('hidden');

    // Fetch reply from Gemini
    const reply = await fetchJulianReply();

    // Add model reply to history
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });

    // Update current message state
    currentJulianMessage = reply;

    // Show Julian typing the reply
    showJulianSpeech(reply);
});

// Initialize with the first message
setTimeout(() => {
    showJulianSpeech(initialMessage);
}, 500);
