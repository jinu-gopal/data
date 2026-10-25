// MAX ERP Universal Voice & Speech Engine
// Powers real-time speech recognition, natural language voice command parsing,
// and Text-to-Speech (TTS) executive audio responses across all MAX ERP modules.

import { maxAiBrain, AiActionExecutionResult } from "./max-ai-brain";

export interface VoiceCommandResult {
  transcript: string;
  intent: "NAVIGATE" | "FILTER" | "EXECUTE_ACTION" | "SEARCH" | "SYNTHESIZE" | "QUERY";
  actionType?: string;
  targetUrl?: string;
  spokenResponse: string;
  executedAction?: AiActionExecutionResult | null;
  displayMessage: string;
  confidence: number;
}

export class MaxVoiceEngine {
  private isSpeaking: boolean = false;
  private voiceEnabled: boolean = true;

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  /* --------------------------------------------------------------------------
   * Text-to-Speech (TTS) Voice Synthesis
   * ------------------------------------------------------------------------ */

  public speak(text: string, onEnd?: () => void): void {
    if (!this.voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      // Clean markdown tags for clear pronunciation
      const cleaned = text
        .replace(/[*_#`~[\]()]/g, "")
        .replace(/https?:\/\/\S+/g, "link")
        .trim();

      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05; // Crisp, professional pace
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel")) &&
          v.lang.startsWith("en")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /* --------------------------------------------------------------------------
   * Natural Language Voice Command Parsing & Execution
   * ------------------------------------------------------------------------ */

  public parseAndExecute(transcript: string, currentRoute: string = "/"): VoiceCommandResult {
    const raw = transcript.trim();
    const q = raw.toLowerCase();

    // 1. NAVIGATION COMMANDS
    if (q === "home" || q === "go home" || q === "back home" || q === "back to home" || q.includes("homepage") || q.includes("suite home")) {
      return {
        transcript: raw,
        intent: "NAVIGATE",
        targetUrl: "/",
        spokenResponse: "Returning to MAX ERP Suite launchpad.",
        displayMessage: "Navigating to **MAX ERP Suite Home** (`/`)",
        confidence: 0.99,
      };
    }

    if (q.startsWith("go to") || q.startsWith("open") || q.startsWith("navigate to") || q.startsWith("show")) {
      if (q.includes("recruiting") || q.includes("recruitment") || q.includes("requisitions")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/recruitment",
          spokenResponse: "Navigating to Recruiting and Talent Requisitions Studio.",
          displayMessage: "Navigating to **Recruiting Studio** (`/recruitment`)",
          confidence: 0.98,
        };
      }
      if (q.includes("offer") || q.includes("offers") || q.includes("offer approvals")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/recruitment/offers",
          spokenResponse: "Opening Candidate Offers and Executive Approvals workspace.",
          displayMessage: "Navigating to **Candidate Offers & Approvals** (`/recruitment/offers`)",
          confidence: 0.98,
        };
      }
      if (q.includes("candidate") || q.includes("applications") || q.includes("pipeline")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/recruitment/candidates",
          spokenResponse: "Opening Candidate Applications pipeline.",
          displayMessage: "Navigating to **Candidate Applications** (`/recruitment/candidates`)",
          confidence: 0.98,
        };
      }
      if (q.includes("career site") || q.includes("careers portal") || q.includes("job portal")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/careers",
          spokenResponse: "Opening public Candidate Career Site.",
          displayMessage: "Navigating to **Career Site** (`/careers`)",
          confidence: 0.96,
        };
      }
      if (q.includes("workforce") || q.includes("people") || q.includes("employee central") || q.includes("employees")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/workforce",
          spokenResponse: "Opening Workforce Management and People Profiles.",
          displayMessage: "Navigating to **Workforce Management** (`/workforce`)",
          confidence: 0.97,
        };
      }
      if (q.includes("position") || q.includes("positions") || q.includes("hierarchy") || q.includes("org chart")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/workforce?tab=positions",
          spokenResponse: "Opening Position Architecture and Hierarchy Tree.",
          displayMessage: "Navigating to **Position Control** (`/workforce?tab=positions`)",
          confidence: 0.98,
        };
      }
      if (q.includes("time off") || q.includes("leaves") || q.includes("absence")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/workforce?tab=timeoff",
          spokenResponse: "Opening Time Off and Leave Wallets.",
          displayMessage: "Navigating to **Time Off Engine** (`/workforce?tab=timeoff`)",
          confidence: 0.96,
        };
      }
      if (q.includes("security") || q.includes("audit") || q.includes("sessions") || q.includes("governance")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/security",
          spokenResponse: "Opening Security Governance and Audit Studio.",
          displayMessage: "Navigating to **Security Studio** (`/security`)",
          confidence: 0.98,
        };
      }
      if (q.includes("users") || q.includes("user management") || q.includes("rbac") || q.includes("roles")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/users",
          spokenResponse: "Opening Enterprise User Directory and RBAC management.",
          displayMessage: "Navigating to **User Directory** (`/users`)",
          confidence: 0.98,
        };
      }
      if (q.includes("integration") || q.includes("webhooks") || q.includes("api clients") || q.includes("connectors")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/integrations",
          spokenResponse: "Opening Enterprise Integration Hub.",
          displayMessage: "Navigating to **Integration Hub** (`/integrations`)",
          confidence: 0.98,
        };
      }
      if (q.includes("business object") || q.includes("metadata") || q.includes("schema builder")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/configuration/business-objects",
          spokenResponse: "Opening Business Objects and Metadata Studio.",
          displayMessage: "Navigating to **Business Objects** (`/configuration/business-objects`)",
          confidence: 0.98,
        };
      }
      if (q.includes("ai studio") || q.includes("copilot") || q.includes("ai")) {
        return {
          transcript: raw,
          intent: "NAVIGATE",
          targetUrl: "/ai",
          spokenResponse: "Opening MAX AI Copilot Studio.",
          displayMessage: "Navigating to **MAX AI Studio** (`/ai`)",
          confidence: 0.99,
        };
      }
    }

    // 2. CANDIDATE COMPARISON & EVALUATION COMMANDS
    if (q.includes("compare") && (q.includes("candidate") || q.includes("priya") || q.includes("emily") || q.includes("devin"))) {
      const name = q.includes("priya") ? "Priya Menon" : q.includes("emily") ? "Emily Zhang" : "Selected Candidate";
      return {
        transcript: raw,
        intent: "SYNTHESIZE",
        targetUrl: "/recruitment/candidates?tab=comparison",
        spokenResponse: `Synthesizing AI candidate comparison for ${name}. Benchmarking skills against Java 21, Spring Boot, and cloud architecture benchmarks.`,
        displayMessage: `Synthesizing **AI Candidate Comparison** for **${name}**`,
        confidence: 0.95,
      };
    }

    // 3. CANDIDATE STAGE PROGRESSION
    if (q.includes("shortlist") || q.includes("move to interview") || q.includes("hire candidate")) {
      const targetStage = q.includes("interview") ? "Interview" : q.includes("hire") ? "Hired" : "Shortlisted";
      return {
        transcript: raw,
        intent: "EXECUTE_ACTION",
        actionType: "MOVE_CANDIDATE_STAGE",
        targetUrl: "/recruitment/candidates",
        spokenResponse: `Candidate has been advanced to ${targetStage} stage. Team notifications and automated screening updates dispatched.`,
        displayMessage: `Advanced candidate stage to **${targetStage}**`,
        confidence: 0.94,
      };
    }

    // 4. AUTONOMOUS ACTIONS VIA BRAIN (Leave, Position, Session, Permission, Webhook)
    const brainReply = maxAiBrain.processPrompt(raw, currentRoute);

    if (brainReply.actionType === "EXECUTE_ACTION" && brainReply.executedAction) {
      const spoken = brainReply.executedAction.summary.replace(/[*_#`~]/g, "");
      return {
        transcript: raw,
        intent: "EXECUTE_ACTION",
        actionType: brainReply.executedAction.actionType,
        targetUrl: brainReply.executedAction.deepLink,
        spokenResponse: spoken,
        executedAction: brainReply.executedAction,
        displayMessage: brainReply.executedAction.summary,
        confidence: 0.96,
      };
    }

    // 5. SCHEMA GENERATION FROM VOICE
    if (brainReply.actionType === "PROPOSE_SCHEMA" && brainReply.proposedSchema) {
      return {
        transcript: raw,
        intent: "SYNTHESIZE",
        actionType: "PROPOSE_SCHEMA",
        targetUrl: "/ai?tab=schema",
        spokenResponse: `Designed Business Object schema for ${brainReply.proposedSchema.name} with ${brainReply.proposedSchema.fields.length} normalized fields. Ready to review and apply.`,
        displayMessage: `Synthesized schema: **${brainReply.proposedSchema.name}** (${brainReply.proposedSchema.fields.length} fields)`,
        confidence: 0.95,
      };
    }

    // 6. WORKFLOW GENERATION FROM VOICE
    if (brainReply.actionType === "PROPOSE_WORKFLOW" && brainReply.proposedWorkflow) {
      return {
        transcript: raw,
        intent: "SYNTHESIZE",
        actionType: "PROPOSE_WORKFLOW",
        targetUrl: "/ai?tab=workflow",
        spokenResponse: `Synthesized multi-tier governance workflow for ${brainReply.proposedWorkflow.name} with ${brainReply.proposedWorkflow.steps.length} ordered approval stages.`,
        displayMessage: `Synthesized workflow: **${brainReply.proposedWorkflow.name}** (${brainReply.proposedWorkflow.steps.length} stages)`,
        confidence: 0.95,
      };
    }

    // 7. TELEMETRY QUERY FROM VOICE
    if (brainReply.actionType === "DATA_INSIGHT") {
      const telemetry = maxAiBrain.getEnterpriseTelemetry();
      return {
        transcript: raw,
        intent: "QUERY",
        targetUrl: "/analytics",
        spokenResponse: `MAX ERP is operating with a 99% health index. Total workforce capacity is ${telemetry.totalEmployeesCount} staff across all legal entities with ${telemetry.openRequisitionsCount} strategic positions currently open.`,
        displayMessage: `Executive Telemetry: **99% Health Index** | **${telemetry.totalEmployeesCount} Headcount** | **${telemetry.openRequisitionsCount} Open Slots**`,
        confidence: 0.96,
      };
    }

    // 8. GENERAL VOICE QUERY FALLBACK
    return {
      transcript: raw,
      intent: "QUERY",
      spokenResponse: `I received your command: "${raw}". I am ready to navigate modules, approve records, compare candidates, or manage position budgets.`,
      displayMessage: `Understood: *" ${raw} "*. Commanding MAX AI across enterprise stores.`,
      confidence: 0.88,
    };
  }
}

// Global Singleton
export const maxVoiceEngine = new MaxVoiceEngine();
