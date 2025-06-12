import natural from 'natural';

const TfIdf = natural.TfIdf;

// Calculate similarity score between resume and job
export function calculateMatchScore(resume, job) {
  try {
    const tfidf = new TfIdf();
    
    // Combine resume text
    const resumeText = [
      resume.summary || '',
      resume.experience || '',
      resume.education || '',
      resume.skills ? resume.skills.join(' ') : '',
      resume.resumeText || ''
    ].join(' ').toLowerCase();
    
    // Combine job text
    const jobText = [
      job.description || '',
      job.requirements || '',
      job.skills ? job.skills.join(' ') : ''
    ].join(' ').toLowerCase();
    
    if (!resumeText.trim() || !jobText.trim()) {
      return 0;
    }
    
    // Add documents to TF-IDF
    tfidf.addDocument(resumeText);
    tfidf.addDocument(jobText);
    
    // Calculate cosine similarity
    const resumeVector = [];
    const jobVector = [];
    
    // Get all unique terms
    const allTerms = new Set();
    tfidf.listTerms(0).forEach(term => allTerms.add(term.term));
    tfidf.listTerms(1).forEach(term => allTerms.add(term.term));
    
    // Build vectors
    Array.from(allTerms).forEach(term => {
      resumeVector.push(tfidf.tfidf(term, 0));
      jobVector.push(tfidf.tfidf(term, 1));
    });
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(resumeVector, jobVector);
    
    // Convert to percentage and round
    return Math.round(similarity * 100);
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Calculate job matches for an employee
export async function calculateJobMatches(employee) {
  try {
    const Job = (await import('../models/Job.js')).default;
    
    const jobs = await Job.find({ isActive: true })
      .populate('hrId', 'fullName company');
    
    const matches = jobs.map(job => {
      const score = calculateMatchScore(employee.resume, {
        description: job.description,
        requirements: job.requirements,
        skills: job.skills
      });
      
      return {
        job,
        matchScore: score,
        isApplied: employee.appliedJobs.some(
          appliedJob => appliedJob.jobId.toString() === job._id.toString()
        )
      };
    });
    
    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches;
  } catch (error) {
    console.error('Error calculating job matches:', error);
    return [];
  }
}