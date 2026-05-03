import { useState, useRef, useCallback, useEffect } from "react";

const CONFIDENCE_THRESHOLD = 0.75; // reject results below this
const SILENCE_RESTART_DELAY = 2000; // ms before auto-restart on silence
const MAX_SILENT_RESTARTS = 10; // prevent infinite restart loops

// Technical vocabulary likely to be heard in interviews
const TECH_VOCABULARY = [
  "polymorphism",
  "encapsulation",
  "abstraction",
  "inheritance",
  "recursion",
  "algorithm",
  "complexity",
  "Big O notation",
  "REST API",
  "GraphQL",
  "microservices",
  "Kubernetes",
  "Docker",
  "MongoDB",
  "SQL",
  "NoSQL",
  "indexing",
  "sharding",
  "useState",
  "useEffect",
  "React",
  "Node.js",
  "Express",
  "authentication",
  "JWT",
  "OAuth",
  "middleware",
  "asynchronous",
  "promise",
  "async await",
  "callback",
  "binary search",
  "linked list",
  "hash map",
  "binary tree",
  "design pattern",
  "singleton",
  "observer",
  "factory pattern",
  "deadlock",
  "race condition",
  "mutex",
  "semaphore",
  "CI/CD",
  "agile",
  "scrum",
  "sprint",
  "kanban",
];

export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const silentRestartCount = useRef(0);
  const shouldBeListening = useRef(false); // intent flag
  const finalTranscriptBuffer = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    // --- Core config ---
    recognition.continuous = true; // don't stop after first pause
    recognition.interimResults = true; // show words as they're spoken
    recognition.maxAlternatives = 3; // get 3 alternatives, pick best
    recognition.lang = "en-US";

    // --- Grammar hints for technical vocabulary ---
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SpeechGrammarList) {
      try {
        const grammar =
          "#JSGF V1.0; grammar tech; public <tech> = " +
          TECH_VOCABULARY.join(" | ") +
          ";";
        const grammarList = new SpeechGrammarList();
        grammarList.addFromString(grammar, 1); // weight 1 = max priority
        recognition.grammars = grammarList;
      } catch (_) {
        // Grammar support varies by browser; non-critical
      }
    }

    // --- Result handler ---
    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        // Pick the alternative with highest confidence
        let bestTranscript = result[0].transcript;
        let bestConfidence = result[0].confidence;

        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > bestConfidence) {
            bestConfidence = result[j].confidence;
            bestTranscript = result[j].transcript;
          }
        }

        setConfidence(bestConfidence);

        if (result.isFinal) {
          // Only accept final results above confidence threshold
          if (bestConfidence >= CONFIDENCE_THRESHOLD || bestConfidence === 0) {
            // confidence=0 means browser didn't return it (still accept)
            finalTranscriptBuffer.current += bestTranscript + " ";
            setTranscript(finalTranscriptBuffer.current.trim());
          }
          // else: quietly discard low-confidence garbage
        } else {
          interim += bestTranscript;
        }
      }

      setInterimTranscript(interim);
      silentRestartCount.current = 0; // reset on activity
    };

    // --- Auto-restart on silence/end (key improvement) ---
    recognition.onend = () => {
      setInterimTranscript("");
      if (
        shouldBeListening.current &&
        silentRestartCount.current < MAX_SILENT_RESTARTS
      ) {
        silentRestartCount.current++;
        setTimeout(() => {
          if (shouldBeListening.current) {
            try {
              recognition.start();
            } catch (_) {
              /* already started */
            }
          }
        }, SILENCE_RESTART_DELAY);
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' is common and not a real error — just restart
      if (event.error === "no-speech") {
        return; // onend will handle restart
      }
      if (event.error === "audio-capture") {
        setError("Microphone not found or not accessible.");
        shouldBeListening.current = false;
        setIsListening(false);
        return;
      }
      if (event.error === "not-allowed") {
        setError("Microphone permission denied.");
        shouldBeListening.current = false;
        setIsListening(false);
        return;
      }
      // network/aborted: soft errors, let onend restart handle it
    };

    recognitionRef.current = recognition;

    return () => {
      shouldBeListening.current = false;
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldBeListening.current = true;
    silentRestartCount.current = 0;
    setError(null);
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (_) {
      /* already running */
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldBeListening.current = false;
    setIsListening(false);
    setInterimTranscript("");
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptBuffer.current = "";
    setTranscript("");
    setInterimTranscript("");
    setConfidence(0);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
  };
};
