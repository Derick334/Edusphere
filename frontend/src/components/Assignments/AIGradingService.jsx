import { base44 } from '@/api/base44Client';

export async function performAIGrading(assignment, submission, answerText) {
  const rubric = assignment.grading_rubric || {};
  const essayWeightings = rubric.essay_weightings || {
    content_accuracy: 40,
    structure_organization: 20,
    coherence_flow: 15,
    argumentation: 15,
    grammar_spelling: 10
  };
  const customCriteria = rubric.criteria || [];

  // Build comprehensive grading prompt
  const gradingPrompt = buildGradingPrompt(assignment, answerText, essayWeightings, customCriteria);
  
  // Get AI grading
  const gradingResponse = await base44.integrations.Core.InvokeLLM({
    prompt: gradingPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        overall_score: { type: "number" },
        rubric_scores: {
          type: "object",
          properties: {
            content_accuracy: { type: "number" },
            structure_organization: { type: "number" },
            coherence_flow: { type: "number" },
            argumentation: { type: "number" },
            grammar_spelling: { type: "number" }
          }
        },
        criteria_scores: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              score: { type: "number" },
              max_score: { type: "number" },
              feedback: { type: "string" }
            }
          }
        },
        strengths: { type: "array", items: { type: "string" } },
        areas_for_improvement: { type: "array", items: { type: "string" } },
        detailed_feedback: { type: "string" },
        suggestions: { type: "string" }
      }
    }
  });

  return gradingResponse;
}

export async function performPlagiarismCheck(answerText, existingSubmissions = []) {
  // Check against other submissions and common patterns
  const checkPrompt = `You are a plagiarism detection system. Analyze the following student submission for potential plagiarism.

STUDENT SUBMISSION:
${answerText}

${existingSubmissions.length > 0 ? `
EXISTING SUBMISSIONS TO COMPARE:
${existingSubmissions.map((s, i) => `[Submission ${i + 1}]: ${s.answers?.[0]?.text || ''}`).join('\n\n')}
` : ''}

Analyze for:
1. Direct copying or very close paraphrasing from other submissions
2. Patterns suggesting AI-generated content without original thought
3. Unusual language patterns or sudden style changes
4. Common phrases that appear copied

Provide your analysis.`;

  const plagiarismResponse = await base44.integrations.Core.InvokeLLM({
    prompt: checkPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        similarity_score: { type: "number" },
        is_flagged: { type: "boolean" },
        confidence: { type: "string" },
        similar_sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              reason: { type: "string" },
              similarity_percentage: { type: "number" }
            }
          }
        },
        analysis_summary: { type: "string" }
      }
    }
  });

  return {
    score: plagiarismResponse.similarity_score || 0,
    flagged: plagiarismResponse.is_flagged || false,
    similar_sources: plagiarismResponse.similar_sections || [],
    highlighted_sections: (plagiarismResponse.similar_sections || []).map(s => s.text)
  };
}

function buildGradingPrompt(assignment, answerText, essayWeightings, customCriteria) {
  let prompt = `You are an expert educational assessor grading a student's ${assignment.assignment_type || 'essay'} assignment.

ASSIGNMENT DETAILS:
Title: ${assignment.title}
Subject: ${assignment.subject}
Description: ${assignment.description || 'No specific instructions provided'}
Total Marks Available: ${assignment.total_marks}

STUDENT'S SUBMISSION:
${answerText}

GRADING RUBRIC:
You must evaluate the submission based on the following weighted criteria:

1. Content Accuracy (${essayWeightings.content_accuracy}% of grade)
   - Evaluate: Correctness of facts, concepts, and information
   - Check for: Factual errors, misconceptions, missing key points
   
2. Structure & Organization (${essayWeightings.structure_organization}% of grade)
   - Evaluate: Logical flow, clear paragraphing, introduction and conclusion
   - Check for: Clear thesis, organized body, smooth transitions between sections
   
3. Coherence & Flow (${essayWeightings.coherence_flow}% of grade)
   - Evaluate: How well ideas connect, readability, logical progression
   - Check for: Topic sentences, linking words, unified paragraphs
   
4. Argumentation (${essayWeightings.argumentation}% of grade)
   - Evaluate: Quality of arguments, use of evidence, critical thinking
   - Check for: Claims supported by evidence, counterarguments addressed, logical reasoning
   
5. Grammar & Spelling (${essayWeightings.grammar_spelling}% of grade)
   - Evaluate: Language mechanics, punctuation, spelling
   - Check for: Grammatical errors, typos, proper sentence structure`;

  if (customCriteria.length > 0) {
    prompt += `\n\nADDITIONAL CUSTOM CRITERIA:`;
    customCriteria.forEach((criterion, i) => {
      prompt += `\n${i + 6}. ${criterion.name} (${criterion.max_points} points)
   - ${criterion.description}`;
    });
  }

  prompt += `\n\nINSTRUCTIONS:
1. Score each rubric category from 0-100
2. Calculate overall score using the weightings provided
3. For custom criteria, score out of the max points specified
4. Provide specific, constructive feedback
5. Identify 2-3 strengths and 2-3 areas for improvement
6. Be fair but thorough in your assessment
7. Consider the student's education level (${assignment.level}) when evaluating

Provide your detailed assessment.`;

  return prompt;
}

export function determineSubmissionStatus(aiScore, assignment, plagiarismResult) {
  const {
    auto_approval_threshold = 80,
    flag_review_threshold = 50,
    plagiarism_threshold = 20,
    plagiarism_check_enabled = true
  } = assignment;

  // Check plagiarism first
  if (plagiarism_check_enabled && plagiarismResult?.score > plagiarism_threshold) {
    return {
      status: 'flagged_review',
      auto_approved: false,
      needs_review_reason: `High plagiarism similarity detected (${plagiarismResult.score}%)`
    };
  }

  const scorePercentage = (aiScore / assignment.total_marks) * 100;

  // Auto-approve high scores
  if (scorePercentage >= auto_approval_threshold) {
    return {
      status: 'auto_approved',
      auto_approved: true,
      needs_review_reason: null
    };
  }

  // Flag low scores for review
  if (scorePercentage < flag_review_threshold) {
    return {
      status: 'flagged_review',
      auto_approved: false,
      needs_review_reason: `Score below review threshold (${scorePercentage.toFixed(1)}%)`
    };
  }

  // Middle range - AI graded but needs teacher verification
  return {
    status: 'ai_graded',
    auto_approved: false,
    needs_review_reason: null
  };
}