import { NextRequest, NextResponse } from "next/server";

export interface RecruitingMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  recipientName?: string;
  candidateId?: string;
  candidateName?: string;
  requisitionId?: string;
  content: string;
  timestamp: string;
  isUrgent?: boolean;
}

let messages: RecruitingMessage[] = [
  {
    id: "msg-101",
    senderName: "Marcus Chen",
    senderRole: "VP Engineering",
    senderAvatar: "MC",
    recipientName: "Priya Sharma",
    candidateId: "cand-201",
    candidateName: "Maya Patel",
    requisitionId: "req-101",
    content: "@Priya Sharma: Maya Patel's system architecture session was phenomenal. Let's fast-track her to an offer before competitor offers expire.",
    timestamp: "10 mins ago",
    isUrgent: true,
  },
  {
    id: "msg-102",
    senderName: "Priya Sharma",
    senderRole: "Lead Architect",
    senderAvatar: "PS",
    recipientName: "Marcus Chen",
    candidateId: "cand-201",
    candidateName: "Maya Patel",
    requisitionId: "req-101",
    content: "Agreed Marcus! Scorecard submitted with 5/5 on distributed streams and thread safety. Rachel Green is reviewing the compensation band now.",
    timestamp: "5 mins ago",
  },
  {
    id: "msg-103",
    senderName: "Rachel Green",
    senderRole: "VP Finance",
    senderAvatar: "RG",
    recipientName: "Marcus Chen",
    requisitionId: "req-101",
    content: "Offer terms for Slot 1 verified against Q4 budget. Approved on my end once HR completes the background check sign-off.",
    timestamp: "Just now",
  },
];

export async function GET() {
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMsg: RecruitingMessage = {
      id: "msg-" + Date.now().toString().slice(-6),
      senderName: body.senderName || "Recruiting Team Member",
      senderRole: body.senderRole || "Recruiter",
      senderAvatar: (body.senderName || "RT").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
      recipientName: body.recipientName,
      candidateId: body.candidateId,
      candidateName: body.candidateName,
      requisitionId: body.requisitionId,
      content: body.content,
      timestamp: "Just now",
      isUrgent: body.isUrgent || false,
    };
    messages.push(newMsg);
    return NextResponse.json(newMsg, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_POST_MESSAGE" }, { status: 400 });
  }
}
